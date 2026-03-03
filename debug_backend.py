import os

def replace_in_module(path, search, replace):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(search, replace)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Update main.py for better CORS and logging
main_py_fix = """# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Changed to False for "*" compatibility
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        import traceback
        print(f"CRASH: {str(e)}")
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}", "traceback": traceback.format_exc()})
"""

with open('backend/app/main.py', 'r', encoding='utf-8') as f:
    orig_main = f.read()

import re
# Replace the old CORS block
new_main = re.sub(r'# CORS configuration.*?allow_headers=\["\*"\],\n\)', main_py_fix, orig_main, flags=re.DOTALL)

with open('backend/app/main.py', 'w', encoding='utf-8') as f:
    f.write(new_main)

# Also ensure EventCreate handles potential string dates gracefully
replace_in_module('backend/app/models/event.py', '    date: datetime', '    date: datetime # Handles ISO strings automatically')
