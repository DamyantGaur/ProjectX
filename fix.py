import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

replace_in_file('frontend/src/api/client.js', '/api/events/', '/api/events')
replace_in_file('backend/app/routes/events.py', 'prefix="/api/events/"', 'prefix="/api/events"')
replace_in_file('backend/app/routes/events.py', '@router.post("/")', '@router.post("")')
replace_in_file('frontend/src/pages/admin/Events.jsx', "alert(err.response?.data?.detail || 'Error');", "const msg = err.response?.data?.detail; alert(typeof msg === 'string' ? msg : Array.isArray(msg) ? JSON.stringify(msg) : 'Error');")
