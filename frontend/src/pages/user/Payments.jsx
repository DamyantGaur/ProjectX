import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, CheckCircle, Clock, XCircle,
    ArrowUpRight, Info, Search, Filter,
    Download, ShieldCheck, Zap
} from 'lucide-react';
import { paymentsAPI } from '../../api/client';

export default function UserPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        paymentsAPI.history()
            .then(res => setPayments(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusConfig = {
        completed: { color: '#22C55E', badge: 'badge-success', icon: CheckCircle, label: 'Completed' },
        pending: { color: '#F59E0B', badge: 'badge-warning', icon: Clock, label: 'Pending' },
        failed: { color: '#EF4444', badge: 'badge-danger', icon: XCircle, label: 'Failed' },
        refunded: { color: '#06B6D4', badge: 'badge-info', icon: CreditCard, label: 'Refunded' },
    };

    const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const filteredPayments = payments.filter(p =>
        p.event_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.provider_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: 'transparent', borderTopColor: '#D946EF' }}
            />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header Content */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Payment History</h1>
                    <p className="text-[#94A3B8]">Manage your transactions and event passes</p>
                </div>

                {/* Simulator Alert */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <ShieldCheck size={18} color="#38BDF8" />
                    <div className="text-xs">
                        <p className="font-bold text-[#38BDF8]">PAYMENT SIMULATOR ACTIVE</p>
                        <p className="text-[#94A3B8]">Stripe integration is in sandbox mode.</p>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-6 border-l-4 border-l-[#D946EF]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-[#94A3B8]">Total Invested</p>
                        <DollarSign size={20} className="text-[#D946EF]" />
                    </div>
                    <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-[#22C55E] mt-1 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Lifespan value
                    </p>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-[#8B5CF6]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-[#94A3B8]">Transactions</p>
                        <CreditCard size={20} className="text-[#8B5CF6]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{payments.length}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                        {payments.filter(p => p.status === 'completed').length} completed successfully
                    </p>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-[#06B6D4]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-[#94A3B8]">Savings</p>
                        <Zap size={20} className="text-[#06B6D4]" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${payments.reduce((sum, p) => sum + (p.discount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-[#06B6D4] mt-1">Loyalty & Reward discounts</p>
                </div>
            </div>

            {/* Filters and List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[rgba(139,92,246,0.1)] flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <input
                            type="text"
                            placeholder="Search event or transaction ID..."
                            className="glass-input pl-10 h-10 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary py-2 px-3 text-xs flex items-center gap-2">
                            <Filter size={14} /> Filter
                        </button>
                        <button className="btn-secondary py-2 px-3 text-xs flex items-center gap-2">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-[rgba(139,92,246,0.05)]">
                    {filteredPayments.map((p, i) => {
                        const cfg = statusConfig[p.status] || statusConfig.pending;
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="p-4 md:p-6 hover:bg-[rgba(139,92,246,0.03)] transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                                        <cfg.icon size={22} color={cfg.color} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-white truncate">{p.event_title || 'Private Event Access'}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-[#64748B]">#{p.id.slice(-8).toUpperCase()}</p>
                                            <span className="w-1 h-1 rounded-full bg-[#334155]" />
                                            <p className="text-xs text-[#64748B]">
                                                {new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">${p.amount.toFixed(2)}</p>
                                        {p.discount > 0 && <p className="text-[10px] font-bold text-[#22C55E]">-{p.discount.toFixed(2)} OFF</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${cfg.badge}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredPayments.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(139,92,246,0.05)] mb-4">
                                <Info size={32} className="text-[#64748B]" />
                            </div>
                            <p className="text-[#94A3B8] text-sm">No transactions found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-6 text-center text-xs text-[#475569]">
                All transactions are encrypted and processed via Project X Secure Layer.
            </p>
        </div>
    );
}

// Reuse the badge styles from common styles or define them here if not available
// .badge-success { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }
// .badge-warning { background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.2); }
// .badge-danger  { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.2); }
// .badge-info    { background: rgba(6,182,212,0.1); color: #06B6D4; border: 1px solid rgba(6,182,212,0.2); }
