import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Fix the broken slashes in client.js
replace_in_file('frontend/src/api/client.js', '/api/eventsid', '/api/events/id')
replace_in_file('frontend/src/api/client.js', '/api/eventsid/toggle-active', '/api/events/id/toggle-active')
# Wait, let me just rewrite the eventsAPI block cleanly
content_to_replace = """export const eventsAPI = {
    list: (activeOnly = false) => client.get(`/api/events?active_only=${activeOnly}`),
    get: (id) => client.get(`/api/events/${id}`),
    create: (data) => client.post('/api/events', data),
    update: (id, data) => client.put(`/api/events/${id}`, data),
    delete: (id) => client.delete(`/api/events/${id}`),
    toggleActive: (id) => client.put(`/api/events/${id}/toggle-active`),
};"""

with open('frontend/src/api/client.js', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
new_orig = re.sub(r'export const eventsAPI = \{.*?\};', content_to_replace, orig, flags=re.DOTALL)

with open('frontend/src/api/client.js', 'w', encoding='utf-8') as f:
    f.write(new_orig)

# Improve error reporting in Events.jsx even more
events_jsx_error_fix = """        } catch (err) { 
            const status = err.response?.status;
            const msg = err.response?.data?.detail;
            const error_text = typeof msg === 'string' ? msg : JSON.stringify(msg || 'Unknown Error');
            alert(`Error ${status || 'Network'}: ${error_text}`); 
        }"""

with open('frontend/src/pages/admin/Events.jsx', 'r', encoding='utf-8') as f:
    jsx = f.read()

new_jsx = re.sub(r'\} catch \(err\) \{ const msg = err\.response\?\.data\?\.detail; alert\(typeof msg === \'string\' \? msg : Array\.isArray\(msg\) \? JSON\.stringify\(msg\) : \'Error\'\); \}', events_jsx_error_fix, jsx)

with open('frontend/src/pages/admin/Events.jsx', 'w', encoding='utf-8') as f:
    f.write(new_jsx)
