import axios from 'axios';

const API_BASE = '';

const client = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('projectx_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle auth errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('projectx_token');
            localStorage.removeItem('projectx_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;

// ─── API helpers ───
export const authAPI = {
    register: (data) => client.post('/api/auth/register', data),
    login: (data) => client.post('/api/auth/login', data),
    getMe: () => client.get('/api/auth/me'),
    updateMe: (data) => client.put('/api/auth/me', data),
    uploadPhoto: (photo) => client.post('/api/auth/me/photo', { photo }),
    createStaff: (data) => client.post('/api/auth/create-staff', data),
    listUsers: (skip = 0, limit = 50) => client.get(`/api/auth/users?skip=${skip}&limit=${limit}`),
    changeRole: (userId, role) => client.put(`/api/auth/users/${userId}/role?role=${role}`),
    toggleActive: (userId) => client.put(`/api/auth/users/${userId}/toggle-active`),
    deleteUser: (userId) => client.delete(`/api/auth/users/${userId}`),
};

export const eventsAPI = {
    list: (activeOnly = false) => client.get(`/api/events?active_only=${activeOnly}`),
    get: (id) => client.get(`/api/events/${id}`),
    create: (data) => client.post('/api/events', data),
    update: (id, data) => client.put(`/api/events/${id}`, data),
    delete: (id) => client.delete(`/api/events/${id}`),
    toggleActive: (id) => client.put(`/api/events/${id}/toggle-active`),
};

export const qrAPI = {
    generate: (data) => client.post('/api/qr/generate', data),
    validate: (token) => client.post('/api/qr/validate', { token }),
    myPasses: () => client.get('/api/qr/my-passes'),
    scanHistory: (eventId) => client.get(`/api/qr/scan-history${eventId ? `?event_id=${eventId}` : ''}`),
};

export const paymentsAPI = {
    initiate: (data) => client.post('/api/payments/initiate', data),
    confirm: (data) => client.post('/api/payments/confirm', data),
    history: () => client.get('/api/payments/history'),
    listAll: (skip = 0, limit = 50) => client.get(`/api/payments/all?skip=${skip}&limit=${limit}`),
    getConfig: () => client.get('/api/payments/config'),
};

export const membershipsAPI = {
    getMe: () => client.get('/api/memberships/me'),
    upgrade: (data) => client.post('/api/memberships/upgrade', data),
    override: (userId, tier) => client.put(`/api/memberships/override/${userId}?tier=${tier}`),
};

export const loyaltyAPI = {
    balance: () => client.get('/api/loyalty/balance'),
    redeem: (data) => client.post('/api/loyalty/redeem', data),
    history: () => client.get('/api/loyalty/history'),
};

export const analyticsAPI = {
    overview: () => client.get('/api/analytics/overview'),
    revenueChart: (days = 30) => client.get(`/api/analytics/revenue-chart?days=${days}`),
    attendanceChart: (days = 30) => client.get(`/api/analytics/attendance-chart?days=${days}`),
    scanActivity: (hours = 24) => client.get(`/api/analytics/scan-activity?hours=${hours}`),
    scanLogs: (skip = 0, limit = 50, eventId, result) => {
        let url = `/api/analytics/scan-logs?skip=${skip}&limit=${limit}`;
        if (eventId) url += `&event_id=${eventId}`;
        if (result) url += `&result=${result}`;
        return client.get(url);
    },
    staffActivity: () => client.get('/api/analytics/staff-activity'),
    fraudAlerts: () => client.get('/api/analytics/fraud-alerts'),
    exportCSV: (type) => client.get(`/api/analytics/export/${type}`, { responseType: 'blob' }),
};

