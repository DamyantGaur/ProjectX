import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ToggleLeft, ToggleRight, Search, Crown, Trash2, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { authAPI, membershipsAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
 const { user: currentUser } = useAuth();
 const [users, setUsers] = useState([]);
 const [search, setSearch] = useState('');
 const [loading, setLoading] = useState(true);

 // Create Staff form state
 const [showCreateForm, setShowCreateForm] = useState(false);
 const [staffName, setStaffName] = useState('');
 const [staffEmail, setStaffEmail] = useState('');
 const [staffPassword, setStaffPassword] = useState('');
 const [staffRole, setStaffRole] = useState('staff');
 const [creating, setCreating] = useState(false);
 const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

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

 const deleteUser = async (userId) => {
 if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
 try {
 await authAPI.deleteUser(userId);
 loadUsers();
 } catch (err) { alert(err.response?.data?.detail || "Error deleting user"); }
 };

 const overrideTier = async (userId, tier) => {
 try {
 await membershipsAPI.override(userId, tier);
 loadUsers();
 } catch (err) { console.error(err); }
 };

 const handleCreateStaff = async (e) => {
 e.preventDefault();
 if (creating) return;
 setCreating(true);
 setCreateMsg({ type: '', text: '' });
 try {
 const res = await authAPI.createStaff({
 name: staffName.trim(),
 email: staffEmail.trim().toLowerCase(),
 password: staffPassword,
 role: staffRole,
 });
 setCreateMsg({ type: 'success', text: `${staffRole.charAt(0).toUpperCase() + staffRole.slice(1)} account created for ${res.data.email}` });
 setStaffName('');
 setStaffEmail('');
 setStaffPassword('');
 setStaffRole('staff');
 loadUsers();
 } catch (err) {
 setCreateMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to create account' });
 } finally { setCreating(false); }
 };

 const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

 const tierColors = { free: '#6B7280', silver: '#9CA3AF', gold: '#D4A054', vip: '#C9A96E' };
 const roleColors = { admin: '#C06070', staff: '#D4A054', user: '#5B9A6F' };

 return (
 <div>
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
 <div>
 <h1 className="text-2xl font-bold">User Management</h1>
 <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{users.length} total users</p>
 </div>
 <div className="flex items-center gap-3">
 <button onClick={() => { setShowCreateForm(!showCreateForm); setCreateMsg({ type: '', text: '' }); }}
 className="btn-primary text-sm flex items-center gap-2 py-2 px-4"
 >
 {showCreateForm ? <X size={16} /> : <UserPlus size={16} />}
 {showCreateForm ? 'Close' : 'Create Staff'}
 </button>
 <div className="relative w-full sm:w-56">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="glass-input pl-10 text-sm" />
 </div>
 </div>
 </div>

 {/* Create Staff Form */}
 {showCreateForm && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
 <div className="glass-card" style={{ padding: '28px' }}>
 <h3 className="font-semibold mb-5 flex items-center gap-2">
 <Shield size={18} color="#D4A054" /> Create Staff / Admin Account
 </h3>

 {createMsg.text && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: createMsg.type === 'success' ? 'rgba(91,154,111,0.08)' : 'rgba(192,96,112,0.08)', border: `1px solid ${createMsg.type === 'success' ? 'rgba(91,154,111,0.2)' : 'rgba(192,96,112,0.2)'}`, color: createMsg.type === 'success' ? '#5B9A6F' : '#C06070', }}>
 {createMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
 {createMsg.text}
 </motion.div>
 )}

 <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
 <div className="relative">
 <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input type="text" value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="Staff name" className="glass-input pl-10 text-sm" required minLength={2} />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
 <div className="relative">
 <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="staff@email.com" className="glass-input pl-10 text-sm" required />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
 <div className="relative">
 <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="Min 8 chars, upper+lower+digit+special" className="glass-input pl-10 text-sm" required minLength={8} />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Role</label>
 <select value={staffRole} onChange={e => setStaffRole(e.target.value)} className="glass-input text-sm" style={{ color: roleColors[staffRole] }}>
 <option value="staff">Staff</option>
 <option value="admin">Admin</option>
 </select>
 </div>
 <div className="sm:col-span-2 flex justify-end">
 <button type="submit" disabled={creating} className="btn-primary text-sm flex items-center gap-2 py-2 px-6">
 {creating ? (
 <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(13,13,20,0.3)', borderTopColor: '#0D0D14' }} />
 ) : (
 <><UserPlus size={16} /> Create Account</>
 )}
 </button>
 </div>
 </form>
 </div>
 </motion.div>
 )}

 {loading ? (
 <div className="flex justify-center py-12 spinner"><motion.div /></div>
 ) : (
 <>
 {/* Desktop Table */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[var(--color-border-subtle)]">
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>User</th>
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</th>
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tier</th>
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Points</th>
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
 <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((u, i) => (
 <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-[var(--color-border-subtle)] hover:bg-white/[0.02] transition-colors">
 <td className="py-3 px-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #C9A96E, #A78BFA)' }}>{u.name[0].toUpperCase()}</div>
 <div>
 <p className="font-medium">{u.name}</p>
 <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.email}</p>
 </div>
 </div>
 </td>
 <td className="py-3 px-4">
 <select disabled={u.id === currentUser?.id} value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs w-24" style={{ color: roleColors[u.role] }}>
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
 <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>{u.loyalty_points}</td>
 <td className="py-3 px-4"><span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <button disabled={u.id === currentUser?.id} onClick={() => toggleActive(u.id)} className="p-2 rounded-xl transition-all" style={{ background: u.is_active ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)', border: `1px solid ${u.is_active ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)'}` }}>
 {u.is_active ? <ToggleRight size={18} color="var(--color-accent-emerald)" /> : <ToggleLeft size={18} color="var(--color-accent-rose)" />}
 </button>
 <button onClick={() => deleteUser(u.id)} className="btn-danger p-2 rounded-xl min-h-0">
 <Trash2 size={16} />
 </button>
 </div>
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
 <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #C9A96E, #A78BFA)' }}>{u.name[0].toUpperCase()}</div>
 <div>
 <p className="font-medium text-sm">{u.name}</p>
 <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.email}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button disabled={u.id === currentUser?.id} onClick={() => toggleActive(u.id)} className="p-2 rounded-lg" style={{ background: u.is_active ? 'rgba(91,154,111,0.1)' : 'rgba(192,96,112,0.1)' }}>
 {u.is_active ? <ToggleRight size={18} color="var(--color-accent-emerald)" /> : <ToggleLeft size={18} color="var(--color-accent-rose)" />}
 </button>
 <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg" style={{ background: 'rgba(192,96,112,0.1)' }}>
 <Trash2 size={18} />
 </button>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-2">
 <div>
 <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Role</label>
 <select disabled={u.id === currentUser?.id} value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs" style={{ color: roleColors[u.role] }}>
 <option value="user">User</option>
 <option value="staff">Staff</option>
 <option value="admin">Admin</option>
 </select>
 </div>
 <div>
 <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Tier</label>
 <select value={u.membership_tier} onChange={e => overrideTier(u.id, e.target.value)} className="glass-input py-1 px-2 text-xs" style={{ color: tierColors[u.membership_tier] }}>
 <option value="free">Free</option>
 <option value="silver">Silver</option>
 <option value="gold">Gold</option>
 <option value="vip">VIP</option>
 </select>
 </div>
 <div className="text-center">
 <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Points</label>
 <p className="text-sm font-medium">{u.loyalty_points}</p>
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
