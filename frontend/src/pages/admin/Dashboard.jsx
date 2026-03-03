import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, ScanLine, TrendingUp, Activity, AlertTriangle, Shield } from 'lucide-react';
import { analyticsAPI } from '../../api/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#C9A96E', '#A78BFA', '#5B9A6F', '#D4A054', '#8B3A4A'];

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

    // Compute chart totals for annotations
    const chartScanTotal = attendanceData.reduce((sum, d) => sum + (d.scans || 0), 0);
    const chartRevenueTotal = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);

    const stats = [
        { label: 'Total Users', value: overview?.users?.total || 0, icon: Users, color: '#C9A96E' },
        { label: 'Active Events', value: overview?.events?.active || 0, icon: Calendar, color: '#A78BFA' },
        { label: 'Revenue', value: `$${overview?.revenue?.total || 0}`, icon: DollarSign, color: '#5B9A6F' },
        { label: 'Total Scans', value: overview?.scans?.total || 0, icon: ScanLine, color: '#D4A054' },
    ];

    const membershipData = overview?.membership_distribution
        ? Object.entries(overview.membership_distribution).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        : [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="glass-card p-3 text-xs" style={{ minWidth: 120 }}>
                    <p style={{ color: '#9A9AB0' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const severityColors = {
        high: { bg: 'rgba(192,96,112,0.1)', text: '#C06070', border: 'rgba(192,96,112,0.25)' },
        medium: { bg: 'rgba(212,160,84,0.1)', text: '#D4A054', border: 'rgba(212,160,84,0.25)' },
        low: { bg: 'rgba(91,154,111,0.1)', text: '#5B9A6F', border: 'rgba(91,154,111,0.25)' },
    };

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#EAEAF0' }}>Admin Dashboard</h1>
                <p className="text-sm mt-2" style={{ color: '#9A9AB0' }}>Real-time overview of your platform</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid mb-10">
                {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card flex items-center gap-4" style={{ padding: '24px 28px' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: '#EAEAF0' }}>{s.value}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#9A9AB0' }}>{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '28px' }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} color="#5B9A6F" />
                            <h3 className="font-semibold" style={{ color: '#EAEAF0' }}>Revenue (30d)</h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(91,154,111,0.08)', color: '#5B9A6F', border: '1px solid rgba(91,154,111,0.15)' }}>
                            ${chartRevenueTotal.toFixed(2)} total
                        </span>
                    </div>
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.06)" />
                                <XAxis dataKey="date" tick={{ fill: '#5E5E74', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                                <YAxis tick={{ fill: '#5E5E74', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px]">
                            <p className="text-sm" style={{ color: '#5E5E74' }}>No revenue data in the last 30 days</p>
                        </div>
                    )}
                </motion.div>

                {/* Attendance Chart */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '28px' }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Activity size={18} color="#A78BFA" />
                            <h3 className="font-semibold" style={{ color: '#EAEAF0' }}>Attendance (30d)</h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(167,139,250,0.08)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.15)' }}>
                            {chartScanTotal} approved
                        </span>
                    </div>
                    {attendanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
                                <XAxis dataKey="date" tick={{ fill: '#5E5E74', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                                <YAxis tick={{ fill: '#5E5E74', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="scans" stroke="#A78BFA" strokeWidth={2} dot={{ fill: '#A78BFA', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px]">
                            <p className="text-sm" style={{ color: '#5E5E74' }}>No attendance data in the last 30 days</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Staff Activity & Fraud Alerts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
                {/* Staff Activity */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '28px' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <Shield size={18} color="#A78BFA" />
                        <h3 className="font-semibold" style={{ color: '#EAEAF0' }}>Staff Activity</h3>
                    </div>
                    {staffActivity.length === 0 ? (
                        <p className="text-sm text-center py-8" style={{ color: '#5E5E74' }}>No staff activity yet</p>
                    ) : (
                        <div className="space-y-3">
                            {staffActivity.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.06)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #B8965A, #C9A96E)', color: '#0D0D14' }}>
                                            {s.staff_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: '#EAEAF0' }}>{s.staff_name}</p>
                                            <p className="text-xs" style={{ color: '#5E5E74' }}>Last: {s.last_scan ? new Date(s.last_scan).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold" style={{ color: '#EAEAF0' }}>{s.total_scans}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span style={{ color: '#5B9A6F' }}>{s.approved} ✓</span>
                                            <span style={{ color: '#C06070' }}>{s.denied} ✗</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Fraud Alerts */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: '28px' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle size={18} color="#D4A054" />
                        <h3 className="font-semibold" style={{ color: '#EAEAF0' }}>Fraud Alerts</h3>
                        {fraudAlerts.length > 0 && (
                            <span className="ml-auto text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(192,96,112,0.12)', color: '#C06070', border: '1px solid rgba(192,96,112,0.2)' }}>
                                {fraudAlerts.length} alert{fraudAlerts.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {fraudAlerts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm" style={{ color: '#5B9A6F' }}>✓ No suspicious activity detected</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                            {fraudAlerts.slice(0, 10).map((a, i) => {
                                const sc = severityColors[a.severity] || severityColors.low;
                                return (
                                    <div key={i} className="p-3 rounded-xl" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold uppercase" style={{ color: sc.text }}>{a.severity}</span>
                                            <span className="text-xs" style={{ color: '#9A9AB0' }}>{a.scan_count} scans</span>
                                        </div>
                                        <p className="text-xs font-mono" style={{ color: '#9A9AB0' }}>Token: {a.qr_token}</p>
                                        <p className="text-xs" style={{ color: '#5E5E74' }}>{a.denied_count} denied · {a.first_scan ? new Date(a.first_scan).toLocaleDateString() : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Membership Distribution */}
            {membershipData.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card max-w-md" style={{ padding: '28px' }}>
                    <h3 className="font-semibold mb-5" style={{ color: '#EAEAF0' }}>Membership Distribution</h3>
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
