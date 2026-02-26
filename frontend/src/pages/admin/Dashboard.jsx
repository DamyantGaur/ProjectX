import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, ScanLine, TrendingUp, Activity, AlertTriangle, Shield } from 'lucide-react';
import { analyticsAPI } from '../../api/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#D946EF', '#8B5CF6', '#06B6D4', '#F59E0B', '#22C55E'];

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
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: '#D946EF' }} />
            </div>
        );
    }

    const stats = [
        { label: 'Total Users', value: overview?.users?.total || 0, icon: Users, color: '#D946EF' },
        { label: 'Active Events', value: overview?.events?.active || 0, icon: Calendar, color: '#8B5CF6' },
        { label: 'Revenue', value: `$${overview?.revenue?.total || 0}`, icon: DollarSign, color: '#22C55E' },
        { label: 'Total Scans', value: overview?.scans?.total || 0, icon: ScanLine, color: '#06B6D4' },
    ];

    const membershipData = overview?.membership_distribution
        ? Object.entries(overview.membership_distribution).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        : [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="glass-card p-3 text-xs" style={{ minWidth: 120 }}>
                    <p style={{ color: '#94A3B8' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const severityColors = {
        high: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.25)' },
        medium: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
        low: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', border: 'rgba(34,197,94,0.25)' },
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Admin Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Real-time overview of your platform</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid mb-8">
                {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{s.value}</p>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} color="#22C55E" />
                        <h3 className="font-semibold" style={{ color: '#F8FAFC' }}>Revenue (30d)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" fill="#D946EF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Attendance Chart */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={18} color="#06B6D4" />
                        <h3 className="font-semibold" style={{ color: '#F8FAFC' }}>Attendance (30d)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="scans" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Staff Activity & Fraud Alerts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Staff Activity */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} color="#8B5CF6" />
                        <h3 className="font-semibold" style={{ color: '#F8FAFC' }}>Staff Activity</h3>
                    </div>
                    {staffActivity.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: '#64748B' }}>No staff activity yet</p>
                    ) : (
                        <div className="space-y-3">
                            {staffActivity.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)' }}>
                                            {s.staff_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{s.staff_name}</p>
                                            <p className="text-xs" style={{ color: '#64748B' }}>Last: {s.last_scan ? new Date(s.last_scan).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{s.total_scans}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span style={{ color: '#22C55E' }}>{s.approved} ✓</span>
                                            <span style={{ color: '#EF4444' }}>{s.denied} ✗</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Fraud Alerts */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} color="#F59E0B" />
                        <h3 className="font-semibold" style={{ color: '#F8FAFC' }}>Fraud Alerts</h3>
                        {fraudAlerts.length > 0 && (
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                {fraudAlerts.length} alert{fraudAlerts.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {fraudAlerts.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm" style={{ color: '#22C55E' }}>✓ No suspicious activity detected</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                            {fraudAlerts.slice(0, 10).map((a, i) => {
                                const sc = severityColors[a.severity] || severityColors.low;
                                return (
                                    <div key={i} className="p-3 rounded-xl" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold uppercase" style={{ color: sc.text }}>{a.severity}</span>
                                            <span className="text-xs" style={{ color: '#94A3B8' }}>{a.scan_count} scans</span>
                                        </div>
                                        <p className="text-xs font-mono" style={{ color: '#94A3B8' }}>Token: {a.qr_token}</p>
                                        <p className="text-xs" style={{ color: '#64748B' }}>{a.denied_count} denied · {a.first_scan ? new Date(a.first_scan).toLocaleDateString() : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Membership Distribution */}
            {membershipData.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card max-w-md">
                    <h3 className="font-semibold mb-4" style={{ color: '#F8FAFC' }}>Membership Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={membershipData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {membershipData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </div>
    );
}
