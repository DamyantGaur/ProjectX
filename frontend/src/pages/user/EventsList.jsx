import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, DollarSign, Clock, QrCode } from 'lucide-react';
import { eventsAPI, qrAPI, paymentsAPI } from '../../api/client';

export default function UserEvents() {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [processing, setProcessing] = useState(null);
 const navigate = useNavigate();

 useEffect(() => { loadEvents(); }, []);

 const loadEvents = async () => {
 try { const res = await eventsAPI.list(true); setEvents(res.data); }
 catch (err) { console.error(err); }
 finally { setLoading(false); }
 };

 const handleGetPass = async (event) => {
 setProcessing(event.id);
 try {
 if (event.price > 0) {
 // Check which payment provider is active
 const configRes = await paymentsAPI.getConfig();
 const isStripe = configRes.data.provider === 'stripe';

 // Initiate payment
 const payRes = await paymentsAPI.initiate({ event_id: event.id, amount: event.price });

 if (isStripe && payRes.data.checkout_url) {
 // Redirect to Stripe Checkout — user returns via success/cancel URL
 window.location.href = payRes.data.checkout_url;
 return;
 }

 // Mock flow: auto-confirm instantly
 await paymentsAPI.confirm({ payment_id: payRes.data.id });
 }
 // Generate QR
 await qrAPI.generate({ event_id: event.id, qr_type: 'one_time' });
 alert('Pass generated! Check your passes.');
 navigate('/dashboard/passes');
 } catch (err) {
 alert(err.response?.data?.detail || 'Failed to get pass');
 } finally {
 setProcessing(null);
 }
 };

 if (loading) {
 return <div className="flex items-center justify-center h-64 spinner w-8 h-8 mx-auto"><motion.div /></div>;
 }

 return (
 <div>
 <div className="mb-8">
 <h1 className="text-2xl font-bold">Events</h1>
 <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Browse and join upcoming events</p>
 </div>

 <div className="dashboard-grid">
 {events.map((e, i) => {
 const spotsLeft = e.capacity - e.attendee_count;
 const isFull = spotsLeft <= 0;
 return (
 <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card flex flex-col">
 <div className="flex justify-between items-start mb-2">
 <h3 className="font-semibold flex-1">{e.title}</h3>
 <span className={`badge text-xs ${e.price> 0 ? 'badge-vip' : 'badge-success'}`}>{e.price > 0 ? `$${e.price}` : 'Free'}</span>
 </div>
 <p className="text-xs mb-4 flex-1" style={{ color: 'var(--color-text-secondary)' }}>{e.description}</p>

 <div className="space-y-1.5 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
 <div className="flex items-center gap-2"><MapPin size={12} /> {e.venue}</div>
 <div className="flex items-center gap-2"><Calendar size={12} /> {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
 <div className="flex items-center gap-2"><Users size={12} /> {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</div>
 </div>

 <div className="flex gap-2">
 {e.tags?.map((t, j) => (
 <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-lavender)]/10 text-[var(--color-accent-lavender)] border border-[var(--color-accent-lavender)]/20 px-2 py-0.5 rounded-full">{t}</span>
 ))}
 </div>

 <button onClick={() => handleGetPass(e)} disabled={isFull || processing === e.id} className="btn-primary w-full mt-4 text-sm flex items-center justify-center gap-2" style={{ opacity: isFull ? 0.5 : 1 }}>
 {processing === e.id ? (
 <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 rounded-full border-2 border-white/30" style={{ borderTopColor: 'white' }} />
 ) : (
 <><QrCode size={16} /> {isFull ? 'Event Full' : e.price > 0 ? `Get Pass ($${e.price})` : 'Get Free Pass'}</>
 )}
 </button>
 </motion.div>
 );
 })}
 </div>

 {events.length === 0 && <p className="text-center py-16 text-sm glass-card" style={{ color: 'var(--color-text-muted)' }}>No active events right now. Check back later!</p>}
 </div>
 );
}
