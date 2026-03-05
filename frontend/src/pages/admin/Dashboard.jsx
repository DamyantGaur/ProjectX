import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, ScanLine, TrendingUp, Activity, AlertTriangle, Shield } from 'lucide-react';
import { analyticsAPI } from '../../api/client';

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [staffActivity, setStaffActivity] = useState([]);
    const [fraudAlerts, setFraudAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ov, rev, att, staff, fraud] = await Promise.all([
                analyticsAPI.overview(),
                analyticsAPI.revenueChart(30),
                analyticsAPI.attendanceChart(30),
                analyticsAPI.staffActivity().catch(() => ({ data: [] })),
                analyticsAPI.fraudAlerts().catch(() => ({ data: [] })),
            ]);
            setOverview(ov.data);
            setRevenueData(rev.data);
            setAttendanceData(att.data);
            setStaffActivity(staff.data || []);
            setFraudAlerts(fraud.data || []);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    const chartScanTotal = attendanceData.reduce((sum, d) => sum + (d.scans || 0), 0);
    const chartRevenueTotal = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);

    const stats = [
        { label: 'Total Users', value: overview?.users?.total || 0, icon: Users, color: 'var(--color-accent-gold)' },
        { label: 'Active Events', value: overview?.events?.active || 0, icon: Calendar, color: 'var(--color-accent-lavender)' },
        { label: 'Revenue', value: `$${overview?.revenue?.total || 0}`, icon: DollarSign, color: 'var(--color-accent-emerald)' },
        { label: 'Total Scans', value: overview?.scans?.total || 0, icon: ScanLine, color: 'var(--color-accent-amber)' },
    ];

    const severityColors = {
        high: { bg: 'rgba(192,96,112,0.1)', text: 'var(--color-accent-rose)', border: 'rgba(192,96,112,0.2)' },
        medium: { bg: 'rgba(212,160,84,0.1)', text: 'var(--color-accent-amber)', border: 'rgba(212,160,84,0.2)' },
        low: { bg: 'rgba(91,154,111,0.1)', text: 'var(--color-accent-emerald)', border: 'rgba(91,154,111,0.2)' },
    };

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-sm mt-2 text-[var(--color-text-secondary)]">Real-time overview of your platform</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid mb-10">
                {stats.map((s, i) => (
                    <motion.div
                        key={i} initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card flex items-center gap-4 p-6"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10">
                            <s.icon size={22} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-10">
                {/* Recent Revenue Summary */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-[var(--color-accent-emerald)]" />
                            <h3 className="font-semibold">Recent Revenue</h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] border border-[var(--color-accent-emerald)]/20">
                            ${chartRevenueTotal.toFixed(2)} (30d)
                        </span>
                    </div>

                    <div className="space-y-4">
                        {revenueData.slice(-5).reverse().map((d, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <span className="text-sm text-[var(--color-text-secondary)]">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <span className="text-sm font-semibold text-[var(--color-accent-gold)]">+${d.revenue.toFixed(2)}</span>
                            </div>
                        ))}
                        {revenueData.length === 0 && (
                            <p className="text-sm text-center py-4 text-[var(--color-text-muted)]">No recent revenue data</p>
                        )}
                    </div>
                </motion.div>

                {/* Recent Attendance Summary */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-[var(--color-accent-lavender)]" />
                            <h3 className="font-semibold">Scan Activity</h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--color-accent-lavender)]/10 text-[var(--color-accent-lavender)] border border-[var(--color-accent-lavender)]/20">
                            {chartScanTotal} scans (30d)
                        </span>
                    </div>

                    <div className="space-y-4">
                        {attendanceData.slice(-5).reverse().map((d, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <span className="text-sm text-[var(--color-text-secondary)]">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{d.scans} scans</span>
                            </div>
                        ))}
                        {attendanceData.length === 0 && (
                            <p className="text-sm text-center py-4 text-[var(--color-text-muted)]">No recent scan activity</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Staff Activity & Fraud Alerts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Staff Activity */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-7">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield size={18} className="text-[var(--color-accent-lavender)]" />
                        <h3 className="font-semibold">Staff Performance</h3>
                    </div>
                    {staffActivity.length === 0 ? (
                        <p className="text-sm text-center py-8 text-[var(--color-text-muted)]">No staff activity recorded</p>
                    ) : (
                        <div className="space-y-3">
                            {staffActivity.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[var(--color-accent-gold)] text-black">
                                            {s.staff_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{s.staff_name}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)]">Active: {s.last_scan ? new Date(s.last_scan).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{s.total_scans}</p>
                                        <div className="flex items-center gap-2 text-[10px]">
                                            <span className="text-[var(--color-accent-emerald)]">{s.approved} ✓</span>
                                            <span className="text-[var(--color-accent-rose)]">{s.denied} ✗</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Fraud Alerts */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-[var(--color-accent-amber)]" />
                            <h3 className="font-semibold">Security Alerts</h3>
                        </div>
                        {fraudAlerts.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)] border border-[var(--color-accent-rose)]/20">
                                {fraudAlerts.length} Active
                            </span>
                        )}
                    </div>
                    {fraudAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] mb-3">
                                <Shield size={24} />
                            </div>
                            <p className="text-sm text-[var(--color-accent-emerald)]">System Secure</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">No suspicious activity flags</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
                            {fraudAlerts.slice(0, 10).map((a, i) => {
                                const sc = severityColors[a.severity] || severityColors.low;
                                return (
                                    <div key={i} className="p-3 rounded-xl border" style={{ background: sc.bg, borderColor: sc.border }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase" style={{ color: sc.text }}>{a.severity} Risk</span>
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{a.scan_count} scans</span>
                                        </div>
                                        <p className="text-[11px] font-mono text-[var(--color-text-secondary)] truncate">Token: {a.qr_token}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{a.denied_count} attempts denied</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
