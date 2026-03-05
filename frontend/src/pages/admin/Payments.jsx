import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { paymentsAPI } from '../../api/client';

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPayments(); }, []);

    const loadPayments = async () => {
        try {
            const res = await paymentsAPI.listAll(0, 500);
            setPayments(res.data.items);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const filtered = payments.filter(p =>
        p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        p.event_title?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} color="var(--color-accent-emerald)" />;
            case 'pending': return <Clock size={16} color="#EAB308" />;
            default: return <XCircle size={16} color="var(--color-accent-rose)" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'pending': return 'badge-warning';
            default: return 'badge-danger';
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" >
                        <CreditCard size={24} color="var(--color-accent-gold)" /> Payment History (All)
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{payments.length} total transactions</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user or event..." className="glass-input pl-10 text-sm" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><motion.div className="spinner" /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm glass-card p-0 rounded-2xl overflow-hidden block">
                            <thead>
                                <tr className="border-b border-[var(--color-border-subtle)]">
                                    <th className="text-left py-4 px-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Date</th>
                                    <th className="text-left py-4 px-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>User</th>
                                    <th className="text-left py-4 px-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Event</th>
                                    <th className="text-left py-4 px-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Amount</th>
                                    <th className="text-left py-4 px-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => (
                                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-[var(--color-border-subtle)]" }} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                <Calendar size={14} />
                                                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                                <span className="opacity-50">· {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium" >{p.user_name}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.user_email}</p>
                                        </td>
                                        <td className="py-4 px-6 font-medium" >{p.event_title}</td>
                                        <td className="py-4 px-6 font-bold" style={{ color: 'var(--color-accent-gold)' }}>${p.amount.toFixed(2)}</td>
                                        <td className="py-4 px-6">
                                            <span className={`badge flex items-center gap-1.5 w-max ${getStatusColor(p.status)}`}>
                                                {getStatusIcon(p.status)} <span className="capitalize">{p.status}</span>
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No payments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg leading-tight" style={{ color: 'var(--color-accent-gold)' }}>${p.amount.toFixed(2)}</p>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            <Calendar size={12} /> {new Date(p.created_at).toLocaleDateString()} · {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <span className={`badge flex items-center gap-1 text-[10px] ${getStatusColor(p.status)}`}>
                                        {getStatusIcon(p.status)} <span className="capitalize">{p.status}</span>
                                    </span>
                                </div>
                                <div className="p-3 mt-3 rounded-lg" style={{ background: 'rgba(15,10,30,0.5)', border: '1px solid rgba(167,139,250,0.1)' }}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>User:</span>
                                        <span className="text-sm font-medium" >{p.user_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Event:</span>
                                        <span className="text-sm font-medium truncate ml-2 text-right" >{p.event_title}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No payments found.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
