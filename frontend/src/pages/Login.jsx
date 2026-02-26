import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles, Shield, ScanLine, User } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@projectx.com', password: 'Admin@123', icon: Shield, color: '#EF4444', route: '/admin', desc: 'Full system access' },
    { label: 'Staff', email: 'staff@projectx.com', password: 'Staff@123', icon: ScanLine, color: '#F59E0B', route: '/staff', desc: 'QR scanner & events' },
    { label: 'User', email: 'user@projectx.com', password: 'User@123', icon: User, color: '#22C55E', route: '/dashboard', desc: 'Passes & rewards' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            const routes = { admin: '/admin', staff: '/staff', user: '/dashboard' };
            navigate(routes[user.role] || '/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Make sure the backend is running and accounts are seeded.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demo) => {
        setEmail(demo.email);
        setPassword(demo.password);
        setError('');
        setLoading(true);
        try {
            await login(demo.email, demo.password);
            navigate(demo.route);
        } catch (err) {
            setError('Demo login failed. Make sure the backend is running and seed accounts exist. Run: python seed.py');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #020005 0%, #0A0812 50%, #020005 100%)' }}>
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ opacity: 0.1, background: 'radial-gradient(circle, #D946EF, transparent)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{ opacity: 0.1, background: 'radial-gradient(circle, #8B5CF6, transparent)', filter: 'blur(100px)' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full relative z-10"
                style={{ maxWidth: '440px' }}
            >
                {/* Logo */}
                <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Sparkles size={28} color="#D946EF" />
                        <h1 className="neon-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>PROJECT X</h1>
                    </Link>
                    <p style={{ marginTop: '8px', color: '#94A3B8', fontSize: '0.875rem' }}>Welcome back to the experience</p>
                </motion.div>

                {/* Login Card */}
                <div className="glass-card neon-glow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '13px', color: '#EF4444' }}>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: '#94A3B8' }}>Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-10" required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: '#94A3B8' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="glass-input pl-10" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Demo</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
                    </div>

                    {/* Demo login buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {DEMO_ACCOUNTS.map((demo) => (
                            <motion.button
                                key={demo.label}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDemoLogin(demo)}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 8px',
                                    borderRadius: '12px',
                                    background: `${demo.color}10`,
                                    border: `1px solid ${demo.color}30`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${demo.color}20`; e.currentTarget.style.borderColor = `${demo.color}60`; }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${demo.color}10`; e.currentTarget.style.borderColor = `${demo.color}30`; }}
                            >
                                <demo.icon size={18} color={demo.color} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: demo.color }}>{demo.label}</span>
                                <span style={{ fontSize: '10px', color: '#64748B' }}>{demo.desc}</span>
                            </motion.button>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748B' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ fontWeight: 600, color: '#D946EF', textDecoration: 'none' }}>Create one</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
