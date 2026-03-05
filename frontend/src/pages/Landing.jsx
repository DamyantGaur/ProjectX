import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Shield, CreditCard, Users, Star, BarChart3, ChevronRight, Sparkles, Zap, ArrowRight } from 'lucide-react';

const features = [
    { icon: QrCode, title: 'Smart QR Access', desc: 'Secure, one-time-use QR codes with real-time validation and duplicate prevention.', color: '#C9A96E' },
    { icon: Shield, title: 'Military-Grade Security', desc: 'HMAC-signed tokens, JWT auth, and role-based access control at every layer.', color: '#A78BFA' },
    { icon: CreditCard, title: 'Seamless Payments', desc: 'Provider-agnostic payment system with coupon support and instant QR activation.', color: '#5B9A6F' },
    { icon: Users, title: 'VIP Memberships', desc: 'Tiered membership system with exclusive perks, priority access, and rewards.', color: '#D4A054' },
    { icon: Star, title: 'Loyalty Rewards', desc: 'Earn points on every interaction. Redeem for discounts, free entry, and upgrades.', color: '#C9A96E' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with revenue, attendance, scan activity, and user insights.', color: '#A78BFA' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 left-0 right-0 w-full z-50 glass" style={{ borderBottom: '1px solid rgba(167,139,250,0.08)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Sparkles size={22} color="#C9A96E" />
                        <span className="text-xl font-bold accent-text tracking-tight">PROJECT X</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium hover:text-white transition-colors" style={{ color: 'var(--color-text-secondary)' }}>Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Subtle ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] rounded-full" style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                    <div className="absolute top-1/2 left-[20%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.04), transparent)', filter: 'blur(60px)' }} />
                    <div className="absolute top-1/3 right-[20%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,58,74,0.04), transparent)', filter: 'blur(60px)' }} />
                </div>

                <div className="relative z-10 w-full px-6" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        {/* Badge */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.18)' }}>
                                <Zap size={14} color="#C9A96E" />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.5px' }}>NEXT-GEN EVENT MANAGEMENT</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '28px', letterSpacing: '-0.03em' }}>
                            <span className="accent-text">The Future</span>
                            <br />
                            <span >of Club & Event</span>
                            <br />
                            <span >Management</span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#9A9AB0', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: 1.7 }}>
                            QR-powered access control, real-time analytics, seamless payments, and VIP membership tiers — all in one premium platform.
                        </p>

                        {/* CTA buttons – cleaned up: one primary Register, one secondary Sign In */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                            <Link to="/register" className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Register Now <ChevronRight size={18} />
                            </Link>
                            <Link to="/login" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 32px' }}>
                                Sign In
                            </Link>
                        </div>
                    </motion.div>

                    {/* Animated QR */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
                        <div className="relative">
                            <div className="qr-pulse" style={{ width: '176px', height: '176px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(18,18,32,0.8)', border: '1px solid rgba(201,169,110,0.2)', position: 'relative', overflow: 'hidden' }}>
                                <QrCode size={88} color="#C9A96E" strokeWidth={1} />
                                <div className="scan-line" />
                            </div>
                            <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', inset: '-12px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(201,169,110,0.04), rgba(167,139,250,0.02))', zIndex: -1 }} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 600, color: '#EAEAF0', marginBottom: '12px', letterSpacing: '-0.02em' }}>Everything You Need</h2>
                        <p style={{ fontSize: '1.05rem', color: '#9A9AB0' }}>A complete platform built for premium experiences</p>
                    </motion.div>

                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {features.map((f, i) => (
                            <motion.div key={i} variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card" style={{ cursor: 'default' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                                    <f.icon size={22} color={f.color} />
                                </div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#EAEAF0', marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#9A9AB0' }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Stats ─── */}
            <section style={{ padding: '60px 24px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
                    {[
                        { value: '99.9%', label: 'Uptime SLA' },
                        { value: '<50ms', label: 'QR Scan Speed' },
                        { value: '256-bit', label: 'Encryption' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                            <p className="accent-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}>{s.value}</p>
                            <p style={{ color: '#5E5E74', fontSize: '0.85rem', marginTop: '4px' }}>{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── CTA – Streamlined ─── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card neon-glow" style={{ padding: '48px 32px' }}>
                        <h2 className="accent-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 1.85rem)', fontWeight: 600, marginBottom: '14px', letterSpacing: '-0.02em' }}>Ready to Transform Your Events?</h2>
                        <p style={{ color: '#9A9AB0', marginBottom: '28px', fontSize: '1rem', lineHeight: 1.6 }}>Join the next generation of event management. Create your account in seconds.</p>
                        <Link to="/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px', padding: '14px 36px' }}>
                            Create Your Account <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(167,139,250,0.06)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#C9A96E" />
                        <span className="accent-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>PROJECT X</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#5E5E74' }}>© 2026 Project X. Built for the future of events.</p>
                </div>
            </footer>
        </div>
    );
}
