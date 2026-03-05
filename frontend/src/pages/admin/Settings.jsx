import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, CreditCard, Crown, Shield, Save, Info } from 'lucide-react';

export default function AdminSettings() {
 const [settings, setSettings] = useState({
 stripe_secret_key: '',
 stripe_publishable_key: '',
 default_capacity: '500',
 silver_threshold: '500',
 gold_threshold: '2000',
 vip_threshold: '5000',
 silver_points: '200',
 gold_points: '800',
 vip_points: '2000',
 points_per_dollar: '10',
 scan_points: '5',
 });
 const [saved, setSaved] = useState(false);

 const handleSave = () => {
 // In production, this would POST to backend settings API
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 };

 const Section = ({ icon: Icon, title, children, color = '#C9A96E' }) => (
 <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-6">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
 <Icon size={20} color={color} />
 </div>
 <h3 className="text-base font-semibold">{title}</h3>
 </div>
 {children}
 </motion.div>
 );

 const Field = ({ label, name, type = 'text', placeholder, note }) => (
 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
 <input type={type} value={settings[name]} onChange={e => setSettings({ ...settings, [name]: e.target.value })}
 placeholder={placeholder} className="glass-input text-sm"
 />
 {note && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{note}</p>}
 </div>
 );

 return (
 <div className="max-w-3xl">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
 <div>
 <h1 className="text-2xl font-bold">System Settings</h1>
 <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Configure platform settings</p>
 </div>
 <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
 <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
 </button>
 </div>

 {/* Info Banner */}
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card mb-6 flex items-start gap-3 border-l-4 border-[var(--color-accent-lavender)]">
 <Info size={18} color="var(--color-accent-lavender)" className="mt-0.5 shrink-0" />
 <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
 Settings are stored locally in this preview. In production, these will persist to the database and be applied across all services.
 </p>
 </motion.div>

 {/* Stripe Integration */}
 <Section icon={CreditCard} title="Payment Integration (Stripe)" color="var(--color-accent-lavender)">
 <div className="grid sm:grid-cols-2 gap-4">
 <Field label="Secret Key" name="stripe_secret_key" placeholder="sk_live_..." note="Leave blank to use mock payments" />
 <Field label="Publishable Key" name="stripe_publishable_key" placeholder="pk_live_..." />
 </div>
 <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(212,160,84,0.06)', border: '1px solid rgba(212,160,84,0.15)' }}>
 <p className="text-xs flex items-center gap-2" style={{ color: '#D4A054' }}>
 <Key size={14} /> When keys are empty, the mock payment provider is used automatically.
 </p>
 </div>
 </Section>

 {/* Membership Tiers */}
 <Section icon={Crown} title="Membership Tier Thresholds" color="var(--color-accent-amber)">
 <div className="grid sm:grid-cols-3 gap-4">
 <Field label="Silver ($)" name="silver_threshold" type="number" note="Spend threshold" />
 <Field label="Gold ($)" name="gold_threshold" type="number" note="Spend threshold" />
 <Field label="VIP ($)" name="vip_threshold" type="number" note="Spend threshold" />
 </div>
 <div className="grid sm:grid-cols-3 gap-4 mt-4">
 <Field label="Silver (pts)" name="silver_points" type="number" note="Point threshold" />
 <Field label="Gold (pts)" name="gold_points" type="number" note="Point threshold" />
 <Field label="VIP (pts)" name="vip_points" type="number" note="Point threshold" />
 </div>
 </Section>

 {/* Loyalty Settings */}
 <Section icon={Shield} title="Loyalty & Points" color="var(--color-accent-emerald)">
 <div className="grid sm:grid-cols-2 gap-4">
 <Field label="Points per Dollar Spent" name="points_per_dollar" type="number" />
 <Field label="Points per Scan" name="scan_points" type="number" />
 </div>
 </Section>

 {/* Event Defaults */}
 <Section icon={Settings} title="Event Defaults" color="var(--color-accent-lavender)">
 <div className="grid sm:grid-cols-2 gap-4">
 <Field label="Default Capacity" name="default_capacity" type="number" note="Default venue capacity for new events" />
 </div>
 </Section>
 </div>
 );
}
