import os
import shutil

# 1. Move vercel.json to root
vercel_json_content = """{
    "rewrites": [
        {
            "source": "/api/:path*",
            "destination": "https://projectx-production-130f.up.railway.app/api/:path*"
        },
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ],
    "headers": [
        {
            "source": "/api/(.*)",
            "headers": [
                { "key": "Access-Control-Allow-Origin", "value": "*" },
                { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
            ]
        }
    ]
}"""

with open('vercel.json', 'w', encoding='utf-8') as f:
    f.write(vercel_json_content)

# 2. Update backend/app/main.py with Robust CORS + Catch-all 404 logger
with open('backend/app/main.py', 'r', encoding='utf-8') as f:
    main_py = f.read()

import re

# Replace CORS block with a more permissive one
robust_cors = """# Robust CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def debug_middleware(request, call_next):
    print(f"DEBUG REQ: {request.method} {request.url}")
    print(f"DEBUG HEADERS: {dict(request.headers)}")
    try:
        response = await call_next(request)
        print(f"DEBUG RES: {response.status_code}")
        return response
    except Exception as e:
        import traceback
        print(f"SERVER ERROR: {str(e)}")
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500, 
            content={"detail": str(e), "traceback": traceback.format_exc()}
        )

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
async def catch_all(path_name: str):
    print(f"CATCH-ALL 404: {path_name}")
    return JSONResponse(
        status_code=404,
        content={"detail": f"Path not found: /api/{path_name}", "path": path_name}
    )
"""

# Find where routers are included and put catch-all AFTER them
new_main = re.sub(r'# CORS configuration.*?log_requests.*?\}\n\n', robust_cors, main_py, flags=re.DOTALL)
# Ensure include_router calls are preserved and catch_all is after them
if "app.include_router" in new_main:
    parts = new_main.split("app.include_router")
    header = parts[0]
    routers = "app.include_router".join(parts[1:])
    # Find last occurrence of a router inclusion
    last_router_idx = routers.rfind(")")
    new_main = header + "app.include_router" + routers[:last_router_idx+1] + "\n\n" + robust_cors + routers[last_router_idx+1:]
else:
    new_main = new_main + "\n\n" + robust_cors

with open('backend/app/main.py', 'w', encoding='utf-8') as f:
    f.write(new_main)

# 3. Clean up client.js - removal of any forced stuff that might be confusing
with open('frontend/src/api/client.js', 'r', encoding='utf-8') as f:
    client_js = f.read()

client_js = client_js.replace("const API_BASE = ''; // Forced for Vercel Proxy consistency", "const API_BASE = '';")
with open('frontend/src/api/client.js', 'w', encoding='utf-8') as f:
    f.write(client_js)

