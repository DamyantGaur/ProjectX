import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Filter, Download, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyticsAPI, eventsAPI } from '../../api/client';

export default function AdminScanLogs() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({ event_id: '', result: '' });
    const limit = 25;

    useEffect(() => { loadEvents(); }, []);
    useEffect(() => { loadLogs(); }, [page, filters]);

    const loadEvents = async () => {
        try { const res = await eventsAPI.list(); setEvents(res.data); } catch (err) { console.error(err); }
    };

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await analyticsAPI.scanLogs(page * limit, limit, filters.event_id || undefined, filters.result || undefined);
            setLogs(res.data.items);
            setTotal(res.data.total);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleExport = () => {
        analyticsAPI.exportCSV('scans').then(res => {
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'scan_logs.csv'; a.click();
            URL.revokeObjectURL(url);
        });
    };

    const resultIcon = {
        approved: <CheckCircle size={14} color="var(--color-accent-emerald)" />,
        denied_used: <XCircle size={14} color="var(--color-accent-rose)" />,
        denied_expired: <Clock size={14} color="var(--color-accent-amber)" />,
        denied_payment: <XCircle size={14} color="var(--color-accent-rose)" />,
        invalid: <XCircle size={14} color="var(--color-accent-rose)" />,
    };

    const resultColors = {
        approved: { bg: 'rgba(91,154,111,0.1)', text: '#5B9A6F', border: 'rgba(91,154,111,0.2)' },
        denied_used: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
        denied_expired: { bg: 'rgba(212,160,84,0.1)', text: '#D4A054', border: 'rgba(212,160,84,0.2)' },
        denied_payment: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
        invalid: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold" >Scan Logs</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{total} total scan records</p>
                </div>
                <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} color="var(--color-accent-gold)" />
                    <span className="text-sm font-medium" >Filters</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Event</label>
                        <select value={filters.event_id} onChange={e => { setFilters({ ...filters, event_id: e.target.value }); setPage(0); }} className="glass-input text-sm">
                            <option value="">All Events</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Result</label>
                        <select value={filters.result} onChange={e => { setFilters({ ...filters, result: e.target.value }); setPage(0); }} className="glass-input text-sm">
                            <option value="">All Results</option>
                            <option value="approved">Approved</option>
                            <option value="denied_used">Denied (Used)</option>
                            <option value="denied_expired">Denied (Expired)</option>
                            <option value="denied_payment">Denied (Payment)</option>
                            <option value="invalid">Invalid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs — Desktop table, Mobile cards */}
            {loading ? (
                <div className="flex justify-center py-12"><motion.div className="spinner" /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block glass-card overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border-subtle)]">
                                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Time</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Result</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Event</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Token</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Scanned By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <motion.tr key={log.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-[var(--color-border-subtle)]">
                                        <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(log.scanned_at).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: resultColors[log.result]?.bg, color: resultColors[log.result]?.text, border: `1px solid ${resultColors[log.result]?.border}` }}>
                                                {resultIcon[log.result]} {log.result?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{log.event_id?.slice(0, 8)}...</td>
                                        <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{log.qr_token?.slice(0, 16)}...</td>
                                        <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{log.scanned_by?.slice(0, 8)}...</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3 mb-6">
                        {logs.map((log, i) => (
                            <motion.div key={log.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(log.scanned_at).toLocaleString()}</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: resultColors[log.result]?.bg, color: resultColors[log.result]?.text, border: `1px solid ${resultColors[log.result]?.border}` }}>
                                        {resultIcon[log.result]} {log.result?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    <p>Event: <span className="font-mono">{log.event_id?.slice(0, 12)}...</span></p>
                                    <p>Token: <span className="font-mono">{log.qr_token?.slice(0, 16)}...</span></p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg transition-colors disabled:opacity-30" style={{ background: 'rgba(167,139,250,0.1)' }}>
                                <ChevronLeft size={18} color="var(--color-accent-gold)" />
                            </button>
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Page {page + 1} of {totalPages}</span>
                            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg transition-colors disabled:opacity-30" style={{ background: 'rgba(167,139,250,0.1)' }}>
                                <ChevronRight size={18} color="var(--color-accent-gold)" />
                            </button>
                        </div>
                    )}

                    {logs.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No scan logs found.</p>}
                </>
            )}
        </div>
    );
}
