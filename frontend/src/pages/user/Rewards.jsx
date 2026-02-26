import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, TrendingUp, ArrowUp, ArrowDown, Award } from 'lucide-react';
import { loyaltyAPI, membershipsAPI } from '../../api/client';

export default function UserRewards() {
    const [balance, setBalance] = useState(null);
    const [history, setHistory] = useState([]);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [bal, hist, mem] = await Promise.all([
                loyaltyAPI.balance(),
                loyaltyAPI.history(),
                membershipsAPI.getMe(),
            ]);
            setBalance(bal.data);
            setHistory(hist.data);
            setMembership(mem.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRedeem = async (type, points) => {
        setRedeeming(true);
        try {
            await loyaltyAPI.redeem({ reward_type: type, points });
            await loadData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Redemption failed');
        } finally { setRedeeming(false); }
    };

    const rewards = [
        { type: 'discount', name: '10% Discount', desc: 'Get 10% off your next event', points: 200, icon: Gift, color: '#D946EF' },
        { type: 'free_entry', name: 'Free Entry', desc: 'Free entry to any event under $50', points: 500, icon: Star, color: '#F59E0B' },
        { type: 'upgrade', name: 'Tier Upgrade', desc: 'Upgrade to the next membership tier', points: 1000, icon: Award, color: '#8B5CF6' },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'transparent', borderTopColor: '#D946EF' }} /></div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Rewards & Loyalty</h1>
                <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Earn and redeem points</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center">
                    <Star size={20} color="#F59E0B" className="mx-auto mb-2" />
                    <p className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{balance?.total_points || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Available</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card text-center">
                    <TrendingUp size={20} color="#22C55E" className="mx-auto mb-2" />
                    <p className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{balance?.lifetime_earned || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Lifetime Earned</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card text-center">
                    <Gift size={20} color="#D946EF" className="mx-auto mb-2" />
                    <p className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{balance?.lifetime_redeemed || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Redeemed</p>
                </motion.div>
            </div>

            {/* Reward Options */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Redeem Points</h2>
            <div className="dashboard-grid mb-8">
                {rewards.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="glass-card">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}>
                            <r.icon size={20} color={r.color} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: '#F8FAFC' }}>{r.name}</h3>
                        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>{r.desc}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold" style={{ color: r.color }}>{r.points} pts</span>
                            <button onClick={() => handleRedeem(r.type, r.points)} disabled={redeeming || (balance?.total_points || 0) < r.points} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: (balance?.total_points || 0) >= r.points ? `${r.color}20` : 'rgba(100,116,139,0.1)', color: (balance?.total_points || 0) >= r.points ? r.color : '#64748B', border: `1px solid ${(balance?.total_points || 0) >= r.points ? `${r.color}30` : 'rgba(100,116,139,0.2)'}` }}>
                                {(balance?.total_points || 0) >= r.points ? 'Redeem' : 'Need more'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transaction History */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Points History</h2>
            <div className="glass-card">
                {history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map((txn, i) => (
                            <div key={i} className="flex items-center gap-3 py-2" style={i < history.length - 1 ? { borderBottom: '1px solid rgba(139,92,246,0.08)' } : {}}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: txn.points > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                    {txn.points > 0 ? <ArrowUp size={14} color="#22C55E" /> : <ArrowDown size={14} color="#EF4444" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm" style={{ color: '#F8FAFC' }}>{txn.description}</p>
                                    <p className="text-xs" style={{ color: '#64748B' }}>{new Date(txn.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: txn.points > 0 ? '#22C55E' : '#EF4444' }}>{txn.points > 0 ? '+' : ''}{txn.points}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-sm" style={{ color: '#64748B' }}>No transactions yet. Start earning points!</p>
                )}
            </div>
        </div>
    );
}
