import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ToggleLeft, ToggleRight, Search, Crown } from 'lucide-react';
import { authAPI, membershipsAPI } from '../../api/client';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try { const res = await authAPI.listUsers(0, 200); setUsers(res.data); } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const changeRole = async (userId, role) => {
        await authAPI.changeRole(userId, role);
        loadUsers();
    };

    const toggleActive = async (userId) => {
        await authAPI.toggleActive(userId);
        loadUsers();
    };

    const overrideTier = async (userId, tier) => {
        try {
            await membershipsAPI.override(userId, tier);
            loadUsers();
        } catch (err) { console.error(err); }
    };

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const tierColors = { free: '#6B7280', silver: '#9CA3AF', gold: '#F59E0B', vip: '#D946EF' };
    const roleColors = { admin: '#EF4444', staff: '#F59E0B', user: '#22C55E' };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>User Management</h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{users.length} total users</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="glass-input pl-10 text-sm" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: '#D946EF' }} /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>User</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>Role</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>Tier</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>Points</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>Status</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#94A3B8' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }}>{u.name[0].toUpperCase()}</div>
                                                <div>
                                                    <p className="font-medium" style={{ color: '#F8FAFC' }}>{u.name}</p>
                                                    <p className="text-xs" style={{ color: '#64748B' }}>{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs w-24" style={{ color: roleColors[u.role] }}>
                                                <option value="user">User</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select value={u.membership_tier} onChange={e => overrideTier(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs w-24" style={{ color: tierColors[u.membership_tier] }}>
                                                <option value="free">Free</option>
                                                <option value="silver">Silver</option>
                                                <option value="gold">Gold</option>
                                                <option value="vip">VIP</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4" style={{ color: '#94A3B8' }}>{u.loyalty_points}</td>
                                        <td className="py-3 px-4"><span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => toggleActive(u.id)} className="p-2 rounded-lg transition-colors" style={{ background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                                {u.is_active ? <ToggleRight size={16} color="#22C55E" /> : <ToggleLeft size={16} color="#EF4444" />}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((u, i) => (
                            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }}>{u.name[0].toUpperCase()}</div>
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: '#F8FAFC' }}>{u.name}</p>
                                            <p className="text-xs" style={{ color: '#64748B' }}>{u.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleActive(u.id)} className="p-2 rounded-lg" style={{ background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                        {u.is_active ? <ToggleRight size={18} color="#22C55E" /> : <ToggleLeft size={18} color="#EF4444" />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs mb-1" style={{ color: '#64748B' }}>Role</label>
                                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs" style={{ color: roleColors[u.role] }}>
                                            <option value="user">User</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs mb-1" style={{ color: '#64748B' }}>Tier</label>
                                        <select value={u.membership_tier} onChange={e => overrideTier(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs" style={{ color: tierColors[u.membership_tier] }}>
                                            <option value="free">Free</option>
                                            <option value="silver">Silver</option>
                                            <option value="gold">Gold</option>
                                            <option value="vip">VIP</option>
                                        </select>
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-xs mb-1" style={{ color: '#64748B' }}>Points</label>
                                        <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{u.loyalty_points}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
