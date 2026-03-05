import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Calendar, CheckCircle, XCircle, Clock, Users as UsersIcon } from 'lucide-react';
import { eventsAPI, qrAPI } from '../../api/client';

export default function StaffDashboard() {
    const [activeEvents, setActiveEvents] = useState([]);
    const [scanHistory, setScanHistory] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [events, scans] = await Promise.all([
                eventsAPI.list(true),
                qrAPI.scanHistory(),
            ]);
            setActiveEvents(events.data);
            setScanHistory(scans.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const resultIcon = {
        approved: <CheckCircle size={16} color="var(--color-accent-emerald)" />,
        denied_used: <XCircle size={16} color="var(--color-accent-rose)" />,
        denied_expired: <Clock size={16} color="var(--color-accent-amber)" />,
        denied_payment: <XCircle size={16} color="var(--color-accent-rose)" />,
        invalid: <XCircle size={16} color="var(--color-accent-rose)" />,
    };

    const resultColors = {
        approved: { bg: 'rgba(91,154,111,0.1)', text: '#5B9A6F', border: 'rgba(91,154,111,0.2)' },
        denied_used: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
        denied_expired: { bg: 'rgba(212,160,84,0.1)', text: '#D4A054', border: 'rgba(212,160,84,0.2)' },
        denied_payment: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
        invalid: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.2)' },
    };

    const resultBadge = {
        approved: 'badge-success',
        denied_used: 'badge-danger',
        denied_expired: 'badge-warning',
        denied_payment: 'badge-danger',
        invalid: 'badge-danger',
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><motion.div className="spinner w-8 h-8 mx-auto" /></div>;
    }

    // Filter scan history by selected event
    const filteredScans = selectedEvent
        ? scanHistory.filter(s => s.event_id === selectedEvent)
        : scanHistory;

    // Get selected event details for capacity counter
    const currentEvent = activeEvents.find(e => e.id === selectedEvent);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold" >Staff Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage scans and monitor events</p>
                </div>
                {/* Event Selector */}
                <div className="w-full sm:w-64">
                    <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="glass-input text-sm">
                        <option value="">All Events</option>
                        {activeEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card text-center">
                    <Calendar size={20} color="var(--color-accent-lavender)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{activeEvents.length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Active Events</p>
                </div>
                <div className="glass-card text-center">
                    <ScanLine size={20} color="var(--color-accent-gold)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{filteredScans.length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>My Scans</p>
                </div>
                <div className="glass-card text-center">
                    <CheckCircle size={20} color="var(--color-accent-emerald)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{filteredScans.filter(s => s.result === 'approved').length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Approved</p>
                </div>
                <div className="glass-card text-center">
                    <XCircle size={20} color="var(--color-accent-rose)" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" >{filteredScans.filter(s => s.result !== 'approved').length}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Denied</p>
                </div>
            </div>

            {/* Live Capacity Counter (shown when event is selected) */}
            {currentEvent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <UsersIcon size={20} color="var(--color-accent-lavender)" />
                        <h3 className="font-semibold" >Live Capacity — {currentEvent.title}</h3>
                    </div>
                    <div className="flex items-end gap-4 mb-3">
                        <p className="text-4xl font-bold" style={{ color: 'var(--color-accent-lavender)' }}>{currentEvent.attendee_count}</p>
                        <p className="text-lg mb-1" style={{ color: 'var(--color-text-muted)' }}>/ {currentEvent.capacity}</p>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (currentEvent.attendee_count / currentEvent.capacity) * 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ background: currentEvent.attendee_count / currentEvent.capacity > 0.9 ? 'var(--color-accent-rose)' : 'var(--gradient-lavender)' }}
                        />
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>{Math.round((currentEvent.attendee_count / currentEvent.capacity) * 100)}% capacity</p>
                </motion.div>
            )}

            {/* Active Events */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4" >Active Events</h2>
                <div className="dashboard-grid">
                    {activeEvents.map((event, i) => (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card cursor-pointer" onClick={() => setSelectedEvent(event.id)} className={selectedEvent === event.id ? "border-[var(--color-accent-gold)]" : "border-white/5"}>
                            <h3 className="font-semibold mb-2" >{event.title}</h3>
                            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span>{event.attendee_count} / {event.capacity} checked in</span>
                                <span className={event.price > 0 ? 'tier-gold' : 'tier-free'}>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full mt-3" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (event.attendee_count / event.capacity) * 100)}%`, background: 'var(--gradient-gold)' }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Scans */}
            <div>
                <h2 className="text-lg font-semibold mb-4" >Recent Scan History</h2>

                {/* Desktop Table */}
                <div className="hidden md:block glass-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Time</th>
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Result</th>
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>Token</th>
                        </tr></thead>
                        <tbody>
                            {filteredScans.slice(0, 20).map((scan, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    <td className="py-2 px-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(scan.scanned_at).toLocaleString()}</td>
                                    <td className="py-2 px-3"><span className={`badge text-xs ${resultBadge[scan.result] || 'badge-info'}`}>{scan.result}</span></td>
                                    <td className="py-2 px-3 text-xs font-mono truncate max-w-[120px]" style={{ color: 'var(--color-text-muted)' }}>{scan.qr_token?.slice(0, 16)}...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredScans.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No scans yet. Start scanning QR codes!</p>}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {filteredScans.slice(0, 20).map((scan, i) => {
                        const rc = resultColors[scan.result] || resultColors.invalid;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(scan.scanned_at).toLocaleString()}</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                                        {resultIcon[scan.result]} {scan.result?.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Token: {scan.qr_token?.slice(0, 20)}...</p>
                            </motion.div>
                        );
                    })}
                    {filteredScans.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No scans yet. Start scanning QR codes!</p>}
                </div>
            </div>
        </div>
    );
}
