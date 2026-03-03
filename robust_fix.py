import os
import re

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# 1. Force Vercel Proxy in client.js
replace_in_file('frontend/src/api/client.js', "const API_BASE = import.meta.env.VITE_API_URL || '';", "const API_BASE = ''; // Forced for Vercel Proxy consistency")

# 2. Standardize Events API to use trailing slashes (most reliable for proxying)
events_api_standard = """export const eventsAPI = {
    list: (activeOnly = false) => client.get(`/api/events/?active_only=${activeOnly}`),
    get: (id) => client.get(`/api/events/${id}`),
    create: (data) => client.post('/api/events/', data),
    update: (id, data) => client.put(`/api/events/${id}`, data),
    delete: (id) => client.delete(`/api/events/${id}`),
    toggleActive: (id) => client.put(`/api/events/${id}/toggle-active`),
};"""

with open('frontend/src/api/client.js', 'r', encoding='utf-8') as f:
    orig_client = f.read()
new_client = re.sub(r'export const eventsAPI = \{.*?\};', events_api_standard, orig_client, flags=re.DOTALL)
with open('frontend/src/api/client.js', 'w', encoding='utf-8') as f:
    f.write(new_client)

# 3. Match backend Standard (trailing slashes on root endpoints)
replace_in_file('backend/app/routes/events.py', 'prefix="/api/events"', 'prefix="/api/events/"')
replace_in_file('backend/app/routes/events.py', '@router.post("")', '@router.post("/")')
replace_in_file('backend/app/routes/events.py', '@router.get("")', '@router.get("/")')

# 4. Improve loadEvents error reporting
load_events_fix = """    const loadEvents = async () => {
        try {
            const res = await eventsAPI.list();
            setEvents(res.data);
        } catch (err) { 
            console.error(err);
            const status = err.response?.status;
            const msg = err.response?.data?.detail;
            alert(`Load Events Failed (${status || 'Network'}): ${typeof msg === 'string' ? msg : 'Check connection'}`);
        }
        finally { setLoading(false); }
    };"""

with open('frontend/src/pages/admin/Events.jsx', 'r', encoding='utf-8') as f:
    jsx = f.read()
# Replace the old loadEvents
new_jsx = re.sub(r'const loadEvents = async \(\) => \{.*?\};', load_events_fix, jsx, flags=re.DOTALL)
with open('frontend/src/pages/admin/Events.jsx', 'w', encoding='utf-8') as f:
    f.write(new_jsx)
