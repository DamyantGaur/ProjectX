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
        approved: <CheckCircle size={16} color="#22C55E" />,
        denied_used: <XCircle size={16} color="#EF4444" />,
        denied_expired: <Clock size={16} color="#F59E0B" />,
        denied_payment: <XCircle size={16} color="#EF4444" />,
        invalid: <XCircle size={16} color="#EF4444" />,
    };

    const resultColors = {
        approved: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', border: 'rgba(34,197,94,0.2)' },
        denied_used: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
        denied_expired: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
        denied_payment: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
        invalid: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
    };

    const resultBadge = {
        approved: 'badge-success',
        denied_used: 'badge-danger',
        denied_expired: 'badge-warning',
        denied_payment: 'badge-danger',
        invalid: 'badge-danger',
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: '#D946EF' }} /></div>;
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
                    <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Staff Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Manage scans and monitor events</p>
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
                    <Calendar size={20} color="#8B5CF6" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{activeEvents.length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Active Events</p>
                </div>
                <div className="glass-card text-center">
                    <ScanLine size={20} color="#D946EF" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{filteredScans.length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>My Scans</p>
                </div>
                <div className="glass-card text-center">
                    <CheckCircle size={20} color="#22C55E" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{filteredScans.filter(s => s.result === 'approved').length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Approved</p>
                </div>
                <div className="glass-card text-center">
                    <XCircle size={20} color="#EF4444" className="mx-auto mb-2" />
                    <p className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{filteredScans.filter(s => s.result !== 'approved').length}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Denied</p>
                </div>
            </div>

            {/* Live Capacity Counter (shown when event is selected) */}
            {currentEvent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <UsersIcon size={20} color="#06B6D4" />
                        <h3 className="font-semibold" style={{ color: '#F8FAFC' }}>Live Capacity — {currentEvent.title}</h3>
                    </div>
                    <div className="flex items-end gap-4 mb-3">
                        <p className="text-4xl font-bold" style={{ color: '#06B6D4' }}>{currentEvent.attendee_count}</p>
                        <p className="text-lg mb-1" style={{ color: '#64748B' }}>/ {currentEvent.capacity}</p>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (currentEvent.attendee_count / currentEvent.capacity) * 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ background: currentEvent.attendee_count / currentEvent.capacity > 0.9 ? '#EF4444' : 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }}
                        />
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>{Math.round((currentEvent.attendee_count / currentEvent.capacity) * 100)}% capacity</p>
                </motion.div>
            )}

            {/* Active Events */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Active Events</h2>
                <div className="dashboard-grid">
                    {activeEvents.map((event, i) => (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card cursor-pointer" onClick={() => setSelectedEvent(event.id)} style={{ border: selectedEvent === event.id ? '1px solid rgba(217,70,239,0.4)' : undefined }}>
                            <h3 className="font-semibold mb-2" style={{ color: '#F8FAFC' }}>{event.title}</h3>
                            <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                            <div className="flex justify-between text-xs" style={{ color: '#64748B' }}>
                                <span>{event.attendee_count} / {event.capacity} checked in</span>
                                <span className={event.price > 0 ? 'tier-gold' : 'tier-free'}>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full mt-3" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (event.attendee_count / event.capacity) * 100)}%`, background: 'linear-gradient(90deg, #D946EF, #8B5CF6)' }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Scans */}
            <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Recent Scan History</h2>

                {/* Desktop Table */}
                <div className="hidden md:block glass-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: '#94A3B8' }}>Time</th>
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: '#94A3B8' }}>Result</th>
                            <th className="text-left py-2 px-3 font-medium text-xs" style={{ color: '#94A3B8' }}>Token</th>
                        </tr></thead>
                        <tbody>
                            {filteredScans.slice(0, 20).map((scan, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(139,92,246,0.05)' }}>
                                    <td className="py-2 px-3 text-xs" style={{ color: '#94A3B8' }}>{new Date(scan.scanned_at).toLocaleString()}</td>
                                    <td className="py-2 px-3"><span className={`badge text-xs ${resultBadge[scan.result] || 'badge-info'}`}>{scan.result}</span></td>
                                    <td className="py-2 px-3 text-xs font-mono truncate max-w-[120px]" style={{ color: '#64748B' }}>{scan.qr_token?.slice(0, 16)}...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredScans.length === 0 && <p className="text-center py-8 text-sm" style={{ color: '#64748B' }}>No scans yet. Start scanning QR codes!</p>}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {filteredScans.slice(0, 20).map((scan, i) => {
                        const rc = resultColors[scan.result] || resultColors.invalid;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs" style={{ color: '#94A3B8' }}>{new Date(scan.scanned_at).toLocaleString()}</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                                        {resultIcon[scan.result]} {scan.result?.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-xs font-mono" style={{ color: '#64748B' }}>Token: {scan.qr_token?.slice(0, 20)}...</p>
                            </motion.div>
                        );
                    })}
                    {filteredScans.length === 0 && <p className="text-center py-8 text-sm" style={{ color: '#64748B' }}>No scans yet. Start scanning QR codes!</p>}
                </div>
            </div>
        </div>
    );
}
