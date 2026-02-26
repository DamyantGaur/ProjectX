import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #020005 0%, #0A0812 50%, #020005 100%)' }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D946EF, transparent)', filter: 'blur(100px)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
                <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold neon-text">PROJECT X</h1>
                    </Link>
                    <p className="mt-2" style={{ color: '#94A3B8' }}>Join the exclusive experience</p>
                </motion.div>

                <div className="glass-card neon-glow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <AlertCircle size={16} color="#EF4444" />
                                <span className="text-sm" style={{ color: '#EF4444' }}>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="glass-input pl-10" required minLength={2} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-10" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="glass-input pl-10" required minLength={6} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 rounded-full border-2 border-white/30" style={{ borderTopColor: 'white' }} />
                            ) : (
                                <><UserPlus size={18} /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm" style={{ color: '#64748B' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold" style={{ color: '#D946EF' }}>Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
