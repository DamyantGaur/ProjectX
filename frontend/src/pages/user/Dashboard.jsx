import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Calendar, CreditCard, Star, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { membershipsAPI, loyaltyAPI, qrAPI, paymentsAPI } from '../../api/client';
import { Link } from 'react-router-dom';

const tierGradients = {
    free: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))',
    silver: 'linear-gradient(135deg, #4A5568, #718096)',
    gold: 'linear-gradient(135deg, var(--color-accent-amber), #D4A054)',
    vip: 'linear-gradient(135deg, var(--color-accent-lavender), #C9A96E)',
};

export default function UserDashboard() {
    const { user } = useAuth();
    const [membership, setMembership] = useState(null);
    const [loyalty, setLoyalty] = useState(null);
    const [passes, setPasses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [mem, loy, pass, pay] = await Promise.all([
                membershipsAPI.getMe(),
                loyaltyAPI.balance(),
                qrAPI.myPasses(),
                paymentsAPI.history(),
            ]);
            setMembership(mem.data);
            setLoyalty(loy.data);
            setPasses(pass.data);
            setPayments(pay.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><motion.div className="spinner w-8 h-8 mx-auto" /></div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold" >Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Your personal hub</p>
            </div>

            {/* Membership Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 mb-8 relative overflow-hidden" style={{ background: tierGradients[membership?.tier || 'free'], minHeight: 180 }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Project X</p>
                            <p className="text-sm opacity-70 mt-0.5">{user?.email}</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur">{membership?.tier || 'Free'} Member</span>
                    </div>
                    <h2 className="text-xl font-bold mb-4">{user?.name}</h2>
                    <div className="flex gap-6 text-xs">
                        <div><p className="opacity-60 mb-0.5">Points</p><p className="font-bold text-lg">{loyalty?.total_points || 0}</p></div>
                        <div><p className="opacity-60 mb-0.5">Discount</p><p className="font-bold text-lg">{membership?.discount_percent || 0}%</p></div>
                        {membership?.next_tier && <div><p className="opacity-60 mb-0.5">Next Tier</p><p className="font-bold text-lg capitalize">{membership.next_tier}</p></div>}
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link to="/dashboard/passes" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <QrCode size={20} color="var(--color-accent-gold)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{passes.length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>QR Passes</p>
                </Link>
                <Link to="/dashboard/events" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <Calendar size={20} color="var(--color-accent-lavender)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{passes.filter(p => p.status === 'active').length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Active Events</p>
                </Link>
                <Link to="/dashboard/payments" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <CreditCard size={20} color="var(--color-accent-lavender)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{payments.length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Payments</p>
                </Link>
                <Link to="/dashboard/rewards" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <Star size={20} color="var(--color-accent-amber)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{loyalty?.total_points || 0}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Loyalty Points</p>
                </Link>
            </div>

            {/* Recent Passes */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold" >Recent Passes</h2>
                    <Link to="/dashboard/passes" className="text-xs font-medium" style={{ color: 'var(--color-accent-gold)' }}>View All →</Link>
                </div>
                <div className="dashboard-grid">
                    {passes.slice(0, 3).map((pass, i) => (
                        <motion.div key={pass.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-sm font-semibold" >{pass.event_title}</h3>
                                <span className={`badge text-xs ${pass.status === 'active' ? 'badge-success' : pass.status === 'used' ? 'badge-warning' : 'badge-danger'}`}>{pass.status}</span>
                            </div>
                            <div className="flex items-center justify-center py-2">
                                <div className="w-20 h-20 rounded-lg qr-pulse flex items-center justify-center" className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                                    <QrCode size={36} color="var(--color-accent-gold)" />
                                </div>
                            </div>
                            <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>Scans: {pass.scan_count}/{pass.max_scans}</p>
                        </motion.div>
                    ))}
                </div>
                {passes.length === 0 && <p className="text-center py-8 text-sm glass-card" style={{ color: 'var(--color-text-muted)' }}>No passes yet. Browse events to get started!</p>}
            </div>

            {/* Next Tier Progress */}
            {membership?.next_tier && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={18} color="var(--color-accent-lavender)" />
                        <h3 className="font-semibold text-sm" >Progress to {membership.next_tier}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="mb-1" style={{ color: 'var(--color-text-secondary)' }}>Spend: ${membership.total_spend.toFixed(0)} / ${(membership.total_spend + (membership.spend_to_next_tier || 0)).toFixed(0)}</p>
                            <div className="h-2 rounded-full" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (membership.total_spend / (membership.total_spend + (membership.spend_to_next_tier || 1))) * 100)}%`, background: 'var(--gradient-gold)' }} />
                            </div>
                        </div>
                        <div>
                            <p className="mb-1" style={{ color: 'var(--color-text-secondary)' }}>Points: {membership.loyalty_points} / {membership.loyalty_points + (membership.points_to_next_tier || 0)}</p>
                            <div className="h-2 rounded-full" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (membership.loyalty_points / (membership.loyalty_points + (membership.points_to_next_tier || 1))) * 100)}%`, background: 'var(--gradient-lavender)' }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
