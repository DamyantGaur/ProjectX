import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { qrAPI } from '../../api/client';

export default function UserPasses() {
 const [passes, setPasses] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedPass, setSelectedPass] = useState(null);

 useEffect(() => { loadPasses(); }, []);

 const loadPasses = async () => {
 try { const res = await qrAPI.myPasses(); setPasses(res.data); }
 catch (err) { console.error(err); }
 finally { setLoading(false); }
 };

 const statusConfig = {
 active: { color: '#5B9A6F', icon: CheckCircle, badge: 'badge-success' },
 used: { color: '#D4A054', icon: Clock, badge: 'badge-warning' },
 expired: { color: '#C06070', icon: XCircle, badge: 'badge-danger' },
 revoked: { color: '#C06070', icon: XCircle, badge: 'badge-danger' },
 };

 if (loading) {
 return <div className="flex items-center justify-center h-64 spinner w-8 h-8 mx-auto"><motion.div /></div>;
 }

 return (
 <div>
 <div className="mb-8">
 <h1 className="text-2xl font-bold">My QR Passes</h1>
 <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{passes.length} passes total</p>
 </div>

 {/* QR Detail Modal */}
 {selectedPass && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPass(null)}>
 <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-card max-w-sm w-full text-center neon-glow" onClick={e => e.stopPropagation()}>
 <h3 className="font-semibold mb-2">{selectedPass.event_title}</h3>
 <span className={`badge text-xs ${statusConfig[selectedPass.status]?.badge}`}>{selectedPass.status}</span>

 <div className="my-6 flex justify-center">
 {selectedPass.qr_image_base64 ? (
 <div className="p-4 rounded-2xl qr-pulse bg-black/40 border border-white/5">
 <img src={`data:image/png;base64,${selectedPass.qr_image_base64}`} alt="QR Code" className="w-48 h-48" style={{ imageRendering: 'pixelated' }} />
 </div>
 ) : (
 <div className="w-48 h-48 rounded-2xl flex items-center justify-center qr-pulse bg-black/40 border-2 border-[var(--color-accent-gold)]/30">
 <QrCode size={80} color="var(--color-accent-gold)" />
 </div>
 )}
 </div>

 <div className="space-y-2 text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
 <p>Type: <span className="font-medium">{selectedPass.qr_type === 'one_time' ? 'Single Use' : 'Multi-Use'}</span></p>
 <p>Scans: <span className="font-medium">{selectedPass.scan_count} / {selectedPass.max_scans}</span></p>
 <p>Tier: <span className="font-medium capitalize" style={{ color: 'var(--color-accent-gold)' }}>{selectedPass.membership_tier}</span></p>
 </div>

 <p className="text-xs font-mono break-all px-2 py-2 rounded-lg mb-4 bg-white/5 text-[var(--color-text-muted)] border border-white/10">{selectedPass.token}</p>

 <button onClick={() => setSelectedPass(null)} className="btn-secondary w-full text-sm">Close</button>
 </motion.div>
 </motion.div>
 )}

 {/* Pass Grid */}
 <div className="dashboard-grid">
 {passes.map((pass, i) => {
 const cfg = statusConfig[pass.status] || statusConfig.active;
 return (
 <motion.div key={pass.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setSelectedPass(pass)}>
 <div className="flex justify-between items-start mb-3">
 <h3 className="text-sm font-semibold">{pass.event_title}</h3>
 <span className={`badge text-xs ${cfg.badge}`}>{pass.status}</span>
 </div>

 <div className="flex items-center justify-center py-4">
 <div className="`w-24 h-24 rounded-xl flex items-center justify-center ${pass.status === 'active' ? 'qr-pulse' : '' bg-white/5 border border-white/10">
 <QrCode size={44} color={cfg.color} />
 </div>
 </div>

 <div className="flex justify-between items-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
 <span>{pass.qr_type === 'one_time' ? 'Single' : 'Multi'}</span>
 <span>Scans: {pass.scan_count}/{pass.max_scans}</span>
 </div>
 </motion.div>
 );
 })}
 </div>

 {passes.length === 0 && <p className="text-center py-16 text-sm glass-card" style={{ color: 'var(--color-text-muted)' }}>No passes yet. Browse events to get your first pass!</p>}
 </div>
 );
}
