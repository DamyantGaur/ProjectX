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
 <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4 py-12">
 {/* Background effects */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[var(--color-accent-gold)]/10 blur-[100px]" />
 <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--color-accent-lavender)]/10 blur-[100px]" />
 </div>

 <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
 {/* Logo */}
 <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
 <Link to="/" className="inline-flex items-center gap-2">
 <Sparkles size={26} color="#C9A96E" />
 <h1 className="accent-text text-2xl font-bold tracking-tight">PROJECT X</h1>
 </Link>
 <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Welcome back to the experience</p>
 </motion.div>

 {/* Login Card */}
 <div className="glass-card neon-glow">
 <form onSubmit={handleSubmit} className="space-y-5">
 {error && (
 <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20">
 <AlertCircle size={16} color="#C06070" style={{ flexShrink: 0, marginTop: '2px' }} />
 <span style={{ fontSize: '13px', color: '#C06070' }}>{error}</span>
 </motion.div>
 )}

 <div>
 <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Email</label>
 <div className="relative">
 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
 <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-10" required autoComplete="email" />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Password</label>
 <div className="relative">
 <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
 <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="glass-input pl-10" required autoComplete="current-password" />
 </div>
 </div>

 <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
 {loading ? (
 <div className="spinner" style={{ width: '20px', height: '20px', borderColor: 'rgba(13,13,20,0.3)', borderTopColor: '#0D0D14' }} />
 ) : (
 <><LogIn size={18} /> Sign In</>
 )}
 </button>
 </form>

 <p className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
 Don't have an account?{' '}
 <Link to="/register" className="font-semibold text-[var(--color-accent-gold)] link">Create one</Link>
 </p>
 </div>
 </motion.div>
 </div>
 );
}
