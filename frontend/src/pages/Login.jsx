import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');

        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(email.trim(), password);
            const routes = { admin: '/admin', staff: '/staff', user: '/dashboard' };
            navigate(routes[user.role] || '/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail;
            if (typeof msg === 'string') {
                setError(msg);
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(145deg, #0D0D14 0%, #12121E 50%, #0D0D14 100%)' }}>
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full" style={{ opacity: 0.06, background: 'radial-gradient(circle, #C9A96E, transparent)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{ opacity: 0.05, background: 'radial-gradient(circle, #A78BFA, transparent)', filter: 'blur(100px)' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full relative z-10"
                style={{ maxWidth: '420px' }}
            >
                {/* Logo */}
                <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Sparkles size={26} color="#C9A96E" />
                        <h1 className="accent-text" style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>PROJECT X</h1>
                    </Link>
                    <p style={{ marginTop: '8px', color: '#9A9AB0', fontSize: '0.875rem' }}>Welcome back to the experience</p>
                </motion.div>

                {/* Login Card */}
                <div className="glass-card neon-glow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', borderRadius: '10px', background: 'rgba(192,96,112,0.08)', border: '1px solid rgba(192,96,112,0.2)' }}>
                                <AlertCircle size={16} color="#C06070" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '13px', color: '#C06070' }}>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: '#9A9AB0' }}>Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5E5E74' }} />
                                <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-10" required autoComplete="email" />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: '#9A9AB0' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5E5E74' }} />
                                <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="glass-input pl-10" required autoComplete="current-password" />
                            </div>
                        </div>

                        <button id="login-submit" type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px', borderColor: 'rgba(13,13,20,0.3)', borderTopColor: '#0D0D14' }} />
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#5E5E74' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ fontWeight: 600, color: '#C9A96E', textDecoration: 'none' }}>Create one</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
