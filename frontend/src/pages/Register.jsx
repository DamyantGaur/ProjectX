import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

function PasswordStrength({ password }) {
    const checks = [
        { label: 'At least 8 characters', test: password.length >= 8 },
        { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
        { label: 'Lowercase letter', test: /[a-z]/.test(password) },
        { label: 'Number', test: /\d/.test(password) },
        { label: 'Special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
    const passed = checks.filter(c => c.test).length;

    if (!password) return null;

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= passed
                            ? passed <= 2 ? '#C06070' : passed <= 3 ? '#D4A054' : '#5B9A6F'
                            : 'rgba(94,94,116,0.2)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                {checks.map((c, i) => (
                    <span key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', color: c.test ? '#5B9A6F' : '#5E5E74' }}>
                        {c.test ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {c.label}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters.');
            return;
        }

        if (!isPasswordStrong) {
            setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
            return;
        }

        setLoading(true);
        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail;
            if (typeof msg === 'string') {
                setError(msg);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(145deg, #0D0D14 0%, #12121E 50%, #0D0D14 100%)' }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full" style={{ opacity: 0.05, background: 'radial-gradient(circle, #A78BFA, transparent)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full" style={{ opacity: 0.06, background: 'radial-gradient(circle, #C9A96E, transparent)', filter: 'blur(100px)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
                <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/" className="inline-flex items-center gap-2">
                        <h1 className="text-2xl font-bold accent-text tracking-tight">PROJECT X</h1>
                    </Link>
                    <p className="mt-2 text-sm" style={{ color: '#9A9AB0' }}>Join the exclusive experience</p>
                </motion.div>

                <div className="glass-card neon-glow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(192,96,112,0.08)', border: '1px solid rgba(192,96,112,0.2)' }}>
                                <AlertCircle size={16} color="#C06070" style={{ flexShrink: 0 }} />
                                <span className="text-sm" style={{ color: '#C06070' }}>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#9A9AB0' }}>Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5E5E74' }} />
                                <input id="register-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="glass-input pl-10" required minLength={2} autoComplete="name" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#9A9AB0' }}>Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5E5E74' }} />
                                <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-10" required autoComplete="email" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#9A9AB0' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5E5E74' }} />
                                <input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="glass-input pl-10" required minLength={8} autoComplete="new-password" />
                            </div>
                            <PasswordStrength password={password} />
                        </div>

                        <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px', borderColor: 'rgba(13,13,20,0.3)', borderTopColor: '#0D0D14' }} />
                            ) : (
                                <><UserPlus size={18} /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm" style={{ color: '#5E5E74' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold" style={{ color: '#C9A96E' }}>Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
