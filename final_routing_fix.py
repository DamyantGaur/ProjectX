import os
import re

def fix_routes(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.py'):
            path = os.path.join(directory, filename)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove trailing slash from prefix
            content = re.sub(r'prefix="/api/([^"]+)/"', r'prefix="/api/\1"', content)
            
            # Remove slash from root decorators
            # Matches @router.get("/", ...) or @router.post("/") etc.
            content = re.sub(r'@router\.(get|post|put|delete)\("/"(,|\))', r'@router.\1(""\2', content)
            content = re.sub(r"@router\.(get|post|put|delete)\('/'(,|\))", r"@router.\1(''\2", content)
            
            # Also catch the ones with just the string
            content = content.replace('@router.get("/")', '@router.get("")')
            content = content.replace('@router.post("/")', '@router.post("")')
            content = content.replace('@router.put("/")', '@router.put("")')
            content = content.replace('@router.delete("/")', '@router.delete("")')

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

fix_routes('backend/app/routes')

# Verify the changes in events.py specifically
with open('backend/app/routes/events.py', 'r', encoding='utf-8') as f:
    print("--- EVENTS.PY PREVIEW ---")
    print(f.read())
    print("--- END PREVIEW ---")
