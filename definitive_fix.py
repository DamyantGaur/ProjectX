import os
import re

def rewrite_file(path, transformer):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = transformer(content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# 1. Standardize backend/app/routes/events.py
def transform_events_py(content):
    # Fix prefix - remove trailing slash
    content = content.replace('prefix="/api/events/"', 'prefix="/api/events"')
    # Fix root decorators - use empty string for exact match
    content = content.replace('@router.post("/")', '@router.post("")')
    content = content.replace('@router.get("/")', '@router.get("")')
    return content

rewrite_file('backend/app/routes/events.py', transform_events_py)

# 2. Standardize frontend/src/api/client.js
def transform_client_js(content):
    # Ensure eventsAPI uses clean paths
    events_api_block = """export const eventsAPI = {
    list: (activeOnly = false) => client.get(`/api/events?active_only=${activeOnly}`),
    get: (id) => client.get(`/api/events/${id}`),
    create: (data) => client.post('/api/events', data),
    update: (id, data) => client.put(`/api/events/${id}`, data),
    delete: (id) => client.delete(`/api/events/${id}`),
    toggleActive: (id) => client.put(`/api/events/${id}/toggle-active`),
};"""
    content = re.sub(r'export const eventsAPI = \{.*?\};', events_api_block, content, flags=re.DOTALL)
    
    # Audit other paths just in case (ensure no double slashes like //)
    content = content.replace('//api/', '/api/')
    return content

rewrite_file('frontend/src/api/client.js', transform_client_js)

# 3. Final check on backend/app/main.py CORS
def transform_main_py(content):
    # Ensure allow_credentials is False when allow_origins is ["*"]
    if 'allow_origins=["*"]' in content and 'allow_credentials=True' in content:
        content = content.replace('allow_credentials=True', 'allow_credentials=False')
    return content

rewrite_file('backend/app/main.py', transform_main_py)

