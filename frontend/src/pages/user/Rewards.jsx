import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, TrendingUp, ArrowUp, ArrowDown, Award } from 'lucide-react';
import { loyaltyAPI, membershipsAPI } from '../../api/client';

export default function UserRewards() {
    const [balance, setBalance] = useState(null);
    const [history, setHistory] = useState([]);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeemingType, setRedeemingType] = useState(null); // per-reward loading

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
        if (redeemingType) return; // prevent double-click
        setRedeemingType(type);
        try {
            await loyaltyAPI.redeem({ reward_type: type, points });
            await loadData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Redemption failed');
        } finally { setRedeemingType(null); }
    };

    const rewards = [
        { type: 'discount', name: '10% Discount', desc: 'Get 10% off your next event', points: 200, icon: Gift, color: '#C9A96E' },
        { type: 'free_entry', name: 'Free Entry', desc: 'Free entry to any event under $50', points: 500, icon: Star, color: '#D4A054' },
        { type: 'upgrade', name: 'Tier Upgrade', desc: 'Upgrade to the next membership tier', points: 1000, icon: Award, color: '#A78BFA' },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'rgba(201, 169, 110, 0.2)', borderTopColor: 'var(--color-accent-gold)' }} /></div>;

    const available = balance?.total_points || 0;

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight" >Rewards & Loyalty</h1>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Earn and redeem points</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center" className="p-7">
                    <Star size={20} color="var(--color-accent-amber)" className="mx-auto mb-3" />
                    <p className="text-3xl font-bold" >{available}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Available</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card text-center" className="p-7">
                    <TrendingUp size={20} color="var(--color-accent-emerald)" className="mx-auto mb-3" />
                    <p className="text-3xl font-bold" >{balance?.lifetime_earned || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Lifetime Earned</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card text-center" className="p-7">
                    <Gift size={20} color="var(--color-accent-gold)" className="mx-auto mb-3" />
                    <p className="text-3xl font-bold" >{balance?.lifetime_redeemed || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Redeemed</p>
                </motion.div>
            </div>

            {/* Reward Options */}
            <h2 className="text-xl font-semibold mb-5" >Redeem Points</h2>
            <div className="dashboard-grid mb-10">
                {rewards.map((r, i) => {
                    const canAfford = available >= r.points;
                    const isThisRedeeming = redeemingType === r.type;
                    const deficit = r.points - available;

                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="glass-card" className="p-7">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${r.color}12`, border: `1px solid ${r.color}25` }}>
                                <r.icon size={20} color={r.color} />
                            </div>
                            <h3 className="font-semibold text-sm mb-1" >{r.name}</h3>
                            <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>{r.desc}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold" style={{ color: r.color }}>{r.points} pts</span>
                                <button
                                    onClick={() => handleRedeem(r.type, r.points)}
                                    disabled={!canAfford || isThisRedeeming || redeemingType !== null}
                                    className="text-xs px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                    style={{
                                        background: canAfford ? `${r.color}15` : 'rgba(100,116,139,0.06)',
                                        color: canAfford ? r.color : '#5E5E74',
                                        border: `1px solid ${canAfford ? `${r.color}25` : 'rgba(100,116,139,0.12)'}`,
                                        opacity: isThisRedeeming ? 0.6 : 1,
                                        cursor: canAfford && !isThisRedeeming ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    {isThisRedeeming ? 'Redeeming...' : canAfford ? 'Redeem' : `Need ${deficit} more`}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Transaction History */}
            <h2 className="text-xl font-semibold mb-5" >Points History</h2>
            <div className="glass-card" className="p-7">
                {history.length > 0 ? (
                    <div className="space-y-1">
                        {history.map((txn, i) => (
                            <div key={i} className="flex items-center gap-3 py-3" className={i < history.length - 1 ? "border-b border-white/5" : ""}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" className={txn.points > 0 ? "bg-[var(--color-accent-emerald)]/10" : "bg-[var(--color-accent-rose)]/10"}>
                                    {txn.points > 0 ? <ArrowUp size={14} color="var(--color-accent-emerald)" /> : <ArrowDown size={14} color="var(--color-accent-rose)" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm" >{txn.description}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{new Date(txn.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-sm font-semibold flex-shrink-0" style={{ color: txn.points > 0 ? '#5B9A6F' : '#C06070' }}>{txn.points > 0 ? '+' : ''}{txn.points}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>No transactions yet. Start earning points!</p>
                )}
            </div>
        </div>
    );
}
