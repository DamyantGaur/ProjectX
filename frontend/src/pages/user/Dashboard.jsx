import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Calendar, CreditCard, Star, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { membershipsAPI, loyaltyAPI, qrAPI, paymentsAPI } from '../../api/client';
import { Link } from 'react-router-dom';

const tierGradients = {
    free: 'linear-gradient(135deg, #374151, #4B5563)',
    silver: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    gold: 'linear-gradient(135deg, #D97706, #F59E0B)',
    vip: 'linear-gradient(135deg, #9333EA, #D946EF)',
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
        return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: '#D946EF' }} /></div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Your personal hub</p>
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
                    <QrCode size={20} color="#D946EF" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{passes.length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>QR Passes</p>
                </Link>
                <Link to="/dashboard/events" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <Calendar size={20} color="#8B5CF6" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{passes.filter(p => p.status === 'active').length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Active Events</p>
                </Link>
                <Link to="/dashboard/payments" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <CreditCard size={20} color="#06B6D4" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{payments.length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Payments</p>
                </Link>
                <Link to="/dashboard/rewards" className="glass-card text-center hover:scale-[1.02] transition-transform">
                    <Star size={20} color="#F59E0B" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{loyalty?.total_points || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Loyalty Points</p>
                </Link>
            </div>

            {/* Recent Passes */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: '#F8FAFC' }}>Recent Passes</h2>
                    <Link to="/dashboard/passes" className="text-xs font-medium" style={{ color: '#D946EF' }}>View All →</Link>
                </div>
                <div className="dashboard-grid">
                    {passes.slice(0, 3).map((pass, i) => (
                        <motion.div key={pass.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{pass.event_title}</h3>
                                <span className={`badge text-xs ${pass.status === 'active' ? 'badge-success' : pass.status === 'used' ? 'badge-warning' : 'badge-danger'}`}>{pass.status}</span>
                            </div>
                            <div className="flex items-center justify-center py-2">
                                <div className="w-20 h-20 rounded-lg qr-pulse flex items-center justify-center" style={{ background: 'rgba(217,70,239,0.05)', border: '1px solid rgba(217,70,239,0.2)' }}>
                                    <QrCode size={36} color="#D946EF" />
                                </div>
                            </div>
                            <p className="text-xs text-center mt-2" style={{ color: '#64748B' }}>Scans: {pass.scan_count}/{pass.max_scans}</p>
                        </motion.div>
                    ))}
                </div>
                {passes.length === 0 && <p className="text-center py-8 text-sm glass-card" style={{ color: '#64748B' }}>No passes yet. Browse events to get started!</p>}
            </div>

            {/* Next Tier Progress */}
            {membership?.next_tier && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={18} color="#8B5CF6" />
                        <h3 className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>Progress to {membership.next_tier}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="mb-1" style={{ color: '#94A3B8' }}>Spend: ${membership.total_spend.toFixed(0)} / ${(membership.total_spend + (membership.spend_to_next_tier || 0)).toFixed(0)}</p>
                            <div className="h-2 rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (membership.total_spend / (membership.total_spend + (membership.spend_to_next_tier || 1))) * 100)}%`, background: 'linear-gradient(90deg, #D946EF, #8B5CF6)' }} />
                            </div>
                        </div>
                        <div>
                            <p className="mb-1" style={{ color: '#94A3B8' }}>Points: {membership.loyalty_points} / {membership.loyalty_points + (membership.points_to_next_tier || 0)}</p>
                            <div className="h-2 rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (membership.loyalty_points / (membership.loyalty_points + (membership.points_to_next_tier || 1))) * 100)}%`, background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
