import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('projectx_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            authAPI.getMe()
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('projectx_user', JSON.stringify(res.data));
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { access_token, user: userData } = res.data;
        setToken(access_token);
        setUser(userData);
        localStorage.setItem('projectx_token', access_token);
        localStorage.setItem('projectx_user', JSON.stringify(userData));
        return userData;
    };

    const register = async (name, email, password, role = 'user') => {
        const res = await authAPI.register({ name, email, password, role });
        const { access_token, user: userData } = res.data;
        setToken(access_token);
        setUser(userData);
        localStorage.setItem('projectx_token', access_token);
        localStorage.setItem('projectx_user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('projectx_token');
        localStorage.removeItem('projectx_user');
    };

    const refreshUser = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data);
            localStorage.setItem('projectx_user', JSON.stringify(res.data));
        } catch { }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
