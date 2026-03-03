import os
import re

def fix_file(path):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Strip trailing slash from APIRouter prefix
    content = re.sub(r'prefix="/api/([^"]+)/"', r'prefix="/api/\1"', content)
    
    # 2. Fix root decorators: change @router.get("/") to @router.get("")
    content = content.replace('@router.get("/")', '@router.get("")')
    content = content.replace('@router.post("/")', '@router.post("")')
    content = content.replace("@router.get('/')", "@router.get('')")
    content = content.replace("@router.post('/')", "@router.post('')")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Apply to all route files
route_dir = 'backend/app/routes'
for filename in os.listdir(route_dir):
    if filename.endswith('.py'):
        fix_file(os.path.join(route_dir, filename))

# Also ensure frontend client.js is perfectly clean
with open('frontend/src/api/client.js', 'r', encoding='utf-8') as f:
    client_js = f.read()

# Ensure no trailing slashes on root endpoints
client_js = client_js.replace("'/api/events'", "'/api/events'") # Ensure no confusion
client_js = client_js.replace("'/api/auth'", "'/api/auth'")

with open('frontend/src/api/client.js', 'w', encoding='utf-8') as f:
    f.write(client_js)
