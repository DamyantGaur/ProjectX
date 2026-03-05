import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Shield, Camera, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';

export default function UserProfile() {
 const { user, refreshUser } = useAuth();
 const [name, setName] = useState(user?.name || '');
 const [email, setEmail] = useState(user?.email || '');
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState('');
 const [photoPreview, setPhotoPreview] = useState(null);
 const [uploadingPhoto, setUploadingPhoto] = useState(false);
 const fileInputRef = useRef(null);

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

 const handlePhotoSelect = (e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 if (file.size > 1024 * 1024) {
 setMessage('Image too large. Max size is 1 MB.');
 return;
 }
 const reader = new FileReader();
 reader.onload = (ev) => setPhotoPreview(ev.target.result);
 reader.readAsDataURL(file);
 };

 const handlePhotoUpload = async () => {
 if (!photoPreview) return;
 setUploadingPhoto(true);
 setMessage('');
 try {
 await authAPI.uploadPhoto(photoPreview);
 await refreshUser();
 setPhotoPreview(null);
 setMessage('Photo updated!');
 } catch (err) {
 setMessage(err.response?.data?.detail || 'Failed to upload photo');
 } finally { setUploadingPhoto(false); }
 };

 const tierColors = { free: '#6B7280', silver: '#9CA3AF', gold: '#D4A054', vip: '#C9A96E' };
 const currentPhoto = photoPreview || user?.profile_photo;

 return (
 <div className="max-w-2xl mx-auto">
 {/* Page Header */}
 <div className="mb-10">
 <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
 <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Manage your account</p>
 </div>

 {/* Avatar Section */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-8 p-8">
 <div className="flex items-center gap-6">
 {/* Photo */}
 <div className="relative group flex-shrink-0">
 <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden" style={{ background: currentPhoto ? 'transparent' : 'var(--gradient-gold)', border: '3px solid rgba(201, 169, 110, 0.3)', }}>
 {currentPhoto ? (
 <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 user?.name?.[0]?.toUpperCase() || 'U'
 )}
 </div>
 <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40"

 title="Change Photo"
 >
 <Camera size={20} color="var(--color-text-primary)" />
 </button>
 <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
 </div>

 {/* Name & Badges */}
 <div className="flex-1 min-w-0">
 <h2 className="text-xl font-bold tracking-tight">{user?.name}</h2>
 <div className="flex flex-wrap items-center gap-2 mt-2">
 <span className="text-xs capitalize font-semibold px-3 py-1 rounded-full" style={{ background: `${tierColors[user?.membership_tier]}15`, color: tierColors[user?.membership_tier], border: `1px solid ${tierColors[user?.membership_tier]}25`, }}>
 {user?.membership_tier} Member
 </span>
 <span className="text-xs capitalize px-3 py-1 rounded-full bg-[var(--color-accent-lavender)]/10 text-[var(--color-accent-lavender)] border border-[var(--color-accent-lavender)]/20">
 <Shield size={10} className="inline mr-1" />{user?.role}
 </span>
 </div>
 </div>
 </div>

 {/* Photo Preview Actions */}
 {photoPreview && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
 <button onClick={handlePhotoUpload} disabled={uploadingPhoto} className="btn-primary text-xs py-2 px-4">
 {uploadingPhoto ? 'Uploading...' : 'Save Photo'}
 </button>
 <button onClick={() => setPhotoPreview(null)} className="btn-ghost text-xs py-2 px-4 flex items-center gap-1"
 >
 <X size={14} /> Cancel
 </button>
 </motion.div>
 )}
 </motion.div>

 {/* Status Message */}
 {message && (
 <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl text-sm" style={{ background: message.includes('updated') || message.includes('Photo') ? 'rgba(91,154,111,0.08)' : 'rgba(192,96,112,0.08)', color: message.includes('updated') || message.includes('Photo') ? '#5B9A6F' : '#C06070', border: `1px solid ${message.includes('updated') || message.includes('Photo') ? 'rgba(91,154,111,0.2)' : 'rgba(192,96,112,0.2)'}`, }}>
 {message}
 </motion.div>
 )}

 {/* Edit Form */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-8 p-8">
 <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>

 <form onSubmit={handleSave} className="space-y-6">
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
 <div className="relative">
 <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input pl-11" required />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
 <div className="relative">
 <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
 <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input pl-11" required />
 </div>
 </div>
 <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
 <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
 </button>
 </form>
 </motion.div>

 {/* Account Info */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8">
 <h3 className="text-lg font-semibold mb-5">Account Info</h3>
 <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
 <div className="flex justify-between items-center py-1">
 <span>Loyalty Points</span>
 <span className="font-semibold" style={{ color: 'var(--color-accent-amber)' }}>{user?.loyalty_points || 0}</span>
 </div>
 <div className="flex justify-between items-center py-1 border-t border-white/5">
 <span>Member Since</span>
 <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
 </div>
 <div className="flex justify-between items-center py-1 border-t border-white/5">
 <span>Account Status</span>
 <span className="font-semibold" style={{ color: 'var(--color-accent-emerald)' }}>Active</span>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
