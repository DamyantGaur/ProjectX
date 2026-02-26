import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Shield, CreditCard, Users, Star, BarChart3, ChevronRight, Sparkles, Zap, ArrowRight } from 'lucide-react';

const features = [
    { icon: QrCode, title: 'Smart QR Access', desc: 'Secure, one-time-use QR codes with real-time validation and duplicate prevention.', color: '#D946EF' },
    { icon: Shield, title: 'Military-Grade Security', desc: 'HMAC-signed tokens, JWT auth, and role-based access control at every layer.', color: '#8B5CF6' },
    { icon: CreditCard, title: 'Seamless Payments', desc: 'Provider-agnostic payment system with coupon support and instant QR activation.', color: '#06B6D4' },
    { icon: Users, title: 'VIP Memberships', desc: 'Tiered membership system with exclusive perks, priority access, and rewards.', color: '#F59E0B' },
    { icon: Star, title: 'Loyalty Rewards', desc: 'Earn points on every interaction. Redeem for discounts, free entry, and upgrades.', color: '#22C55E' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with revenue, attendance, scan activity, and user insights.', color: '#EF4444' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
    return (
        <div className="min-h-screen" style={{ background: '#020005' }}>
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 left-0 right-0 w-full z-50 glass" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Sparkles size={24} color="#D946EF" />
                        <span className="text-xl font-bold neon-text">PROJECT X</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Sign In</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Glow effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 w-[700px] h-[700px] rounded-full" style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(217,70,239,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                    <div className="absolute top-1/2 left-[20%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)', filter: 'blur(60px)' }} />
                    <div className="absolute top-1/3 right-[20%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent)', filter: 'blur(60px)' }} />
                </div>

                <div className="relative z-10 w-full px-6" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        {/* Badge */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.25)' }}>
                                <Zap size={14} color="#D946EF" />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D946EF', letterSpacing: '0.5px' }}>NEXT-GEN EVENT MANAGEMENT</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '28px' }}>
                            <span className="neon-text">The Future</span>
                            <br />
                            <span style={{ color: '#F8FAFC' }}>of Club & Event</span>
                            <br />
                            <span style={{ color: '#F8FAFC' }}>Management</span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94A3B8', maxWidth: '640px', margin: '0 auto 40px auto', lineHeight: 1.6 }}>
                            QR-powered access control, real-time analytics, seamless payments, and VIP membership tiers — all in one premium platform.
                        </p>

                        {/* CTA buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                            <Link to="/register" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Start Free <ChevronRight size={18} />
                            </Link>
                            <Link to="/login" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                                Sign In
                            </Link>
                        </div>
                    </motion.div>

                    {/* Animated QR */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
                        <div className="relative">
                            <div className="qr-pulse" style={{ width: '192px', height: '192px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,10,30,0.8)', border: '2px solid rgba(217,70,239,0.3)', position: 'relative', overflow: 'hidden' }}>
                                <QrCode size={100} color="#D946EF" strokeWidth={1} />
                                <div className="scan-line" />
                            </div>
                            <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: 'absolute', inset: '-16px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(217,70,239,0.1), rgba(139,92,246,0.05))', zIndex: -1 }} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Everything You Need</h2>
                        <p style={{ fontSize: '1.125rem', color: '#94A3B8' }}>A complete platform built for premium experiences</p>
                    </motion.div>

                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {features.map((f, i) => (
                            <motion.div key={i} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="glass-card" style={{ cursor: 'default' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                                    <f.icon size={24} color={f.color} />
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#94A3B8' }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Stats ─── */}
            <section style={{ padding: '60px 24px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
                    {[
                        { value: '99.9%', label: 'Uptime SLA' },
                        { value: '<50ms', label: 'QR Scan Speed' },
                        { value: '256-bit', label: 'Encryption' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                            <p className="neon-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800 }}>{s.value}</p>
                            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card neon-glow" style={{ padding: '48px 32px' }}>
                        <h2 className="neon-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '16px' }}>Ready to Transform Your Events?</h2>
                        <p style={{ color: '#94A3B8', marginBottom: '32px', fontSize: '1rem' }}>Join the next generation of event management. Get started in seconds.</p>
                        <Link to="/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', padding: '14px 40px' }}>
                            Get Started Now <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="#D946EF" />
                        <span className="neon-text" style={{ fontSize: '0.875rem', fontWeight: 600 }}>PROJECT X</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>© 2026 Project X. Built for the future of events.</p>
                </div>
            </footer>
        </div>
    );
}
