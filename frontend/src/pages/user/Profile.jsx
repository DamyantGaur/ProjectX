import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';

export default function UserProfile() {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await authAPI.updateMe({ name, email });
            await refreshUser();
            setMessage('Profile updated!');
        } catch (err) {
            setMessage(err.response?.data?.detail || 'Failed to update');
        } finally { setSaving(false); }
    };

    const tierColors = { free: '#6B7280', silver: '#9CA3AF', gold: '#F59E0B', vip: '#D946EF' };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Profile & Settings</h1>
                <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Manage your account</p>
            </div>

            {/* Avatar */}
            <div className="glass-card mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <h2 className="text-lg font-semibold" style={{ color: '#F8FAFC' }}>{user?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded-full" style={{ background: `${tierColors[user?.membership_tier]}20`, color: tierColors[user?.membership_tier], border: `1px solid ${tierColors[user?.membership_tier]}30` }}>{user?.membership_tier} Member</span>
                        <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <Shield size={10} className="inline mr-1" />{user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                <h3 className="font-semibold mb-4" style={{ color: '#F8FAFC' }}>Edit Profile</h3>

                {message && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: message.includes('updated') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: message.includes('updated') ? '#22C55E' : '#EF4444', border: `1px solid ${message.includes('updated') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input pl-10" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input pl-10" required />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </motion.div>

            {/* Account Info */}
            <div className="glass-card mt-6">
                <h3 className="font-semibold mb-3" style={{ color: '#F8FAFC' }}>Account Info</h3>
                <div className="space-y-2 text-sm" style={{ color: '#94A3B8' }}>
                    <div className="flex justify-between"><span>Loyalty Points</span><span style={{ color: '#F59E0B' }}>{user?.loyalty_points || 0}</span></div>
                    <div className="flex justify-between"><span>Member Since</span><span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Account Status</span><span style={{ color: '#22C55E' }}>Active</span></div>
                </div>
            </div>
        </div>
    );
}
