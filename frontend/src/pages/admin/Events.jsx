import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, DollarSign, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { eventsAPI } from '../../api/client';

export default function AdminEvents() {
 const [events, setEvents] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [editingEvent, setEditingEvent] = useState(null);
 const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({ title: '', description: '', venue: '', date: '', capacity: '', price: '0', tags: '' });

 useEffect(() => { loadEvents(); }, []);

 const loadEvents = async () => {
 try {
 const res = await eventsAPI.list();
 setEvents(res.data);
 } catch (err) {
 console.error(err);
 const status = err.response?.status;
 const msg = err.response?.data?.detail;
 alert(`Load Events Failed (${status || 'Network'}): ${typeof msg === 'string' ? msg : 'Check connection'}`);
 }
 finally { setLoading(false); }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 const data = { ...form, capacity: parseInt(form.capacity), price: parseFloat(form.price), tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
 try {
 if (editingEvent) {
 await eventsAPI.update(editingEvent.id, data);
 } else {
 await eventsAPI.create(data);
 }
 setShowForm(false);
 setEditingEvent(null);
 setForm({ title: '', description: '', venue: '', date: '', capacity: '', price: '0', tags: '' });
 loadEvents();
 } catch (err) {
 const status = err.response?.status;
 const msg = err.response?.data?.detail;
 const error_text = typeof msg === 'string' ? msg : JSON.stringify(msg || 'Unknown Error');
 alert(`Error ${status || 'Network'}: ${error_text}`);
 }
 };

 const handleEdit = (event) => {
 setEditingEvent(event);
 setForm({ title: event.title, description: event.description, venue: event.venue, date: event.date.slice(0, 16), capacity: String(event.capacity), price: String(event.price), tags: event.tags?.join(', ') || '' });
 setShowForm(true);
 };

 const handleDelete = async (id) => {
 if (!confirm('Delete this event?')) return;
 await eventsAPI.delete(id);
 loadEvents();
 };

 const handleToggle = async (id) => {
 await eventsAPI.toggleActive(id);
 loadEvents();
 };

 return (
 <div>
 <div className="section-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold">Event Management</h1>
 <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{events.length} total events</p>
 </div>
 <button onClick={() => { setShowForm(!showForm); setEditingEvent(null); setForm({ title: '', description: '', venue: '', date: '', capacity: '', price: '0', tags: '' }); }} className="btn-primary w-full sm:w-auto">
 <Plus size={18} /> Create Event
 </button>
 </div>

 {/* Create/Edit Form */}
 <AnimatePresence>
 {showForm && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card mb-8">
 <h3 className="text-lg font-semibold mb-4">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
 <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
 <div className="md:col-span-2 block text-xs mb-1 glass-input"><label style={{ color: 'var(--color-text-secondary)' }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={3} /></div>
 <div className="md:col-span-2 block text-xs mb-1 glass-input"><label style={{ color: 'var(--color-text-secondary)' }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required minLength={10} /></div>
 <div><label className="block text-xs mb-1 glass-input" style={{ color: 'var(--color-text-secondary)' }}>Venue</label><input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required /></div>
 <div><label className="block text-xs mb-1 glass-input" style={{ color: 'var(--color-text-secondary)' }}>Date & Time</label><input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
 <div><label className="block text-xs mb-1 glass-input" style={{ color: 'var(--color-text-secondary)' }}>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required min={1} /></div>
 <div><label className="block text-xs mb-1 glass-input" style={{ color: 'var(--color-text-secondary)' }}>Price ($)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min={0} /></div>
 <div className="md:col-span-2 block text-xs mb-1 glass-input"><label style={{ color: 'var(--color-text-secondary)' }}>Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="vip, electronic, concert" /></div>
 <div className="md:col-span-2 flex gap-3">
 <button type="submit" className="btn-primary text-sm">{editingEvent ? 'Update' : 'Create'} Event</button>
 <button type="button" onClick={() => { setShowForm(false); setEditingEvent(null); }} className="btn-secondary text-sm">Cancel</button>
 </div>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Events Grid */}
 {loading ? (
 <div className="flex justify-center py-12 spinner"><motion.div /></div>
 ) : (
 <div className="dashboard-grid">
 {events.map((event, i) => (
 <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card group relative">
 <div className="flex justify-between items-start mb-3">
 <h3 className="text-base font-semibold truncate flex-1">{event.title}</h3>
 <span className={`badge ${event.is_active ? 'badge-success' : 'badge-danger'}`}>{event.is_active ? 'Active' : 'Inactive'}</span>
 </div>
 <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{event.description}</p>
 <div className="space-y-2 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
 <div className="flex items-center gap-2"><MapPin size={13} /> {event.venue}</div>
 <div className="flex items-center gap-2"><Calendar size={13} /> {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
 <div className="flex items-center gap-2"><Users size={13} /> {event.attendee_count} / {event.capacity}</div>
 <div className="flex items-center gap-2"><DollarSign size={13} /> {event.price > 0 ? `$${event.price}` : 'Free'}</div>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleEdit(event)} className="flex-1 btn-secondary text-xs py-2 min-h-0"><Edit2 size={14} /> Edit</button>
 <button onClick={() => handleToggle(event.id)} className="flex items-center justify-center p-2 rounded-lg" style={{ background: event.is_active ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)', border: `1px solid ${event.is_active ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)'}` }}>
 {event.is_active ? <ToggleRight size={18} color="var(--color-accent-emerald)" /> : <ToggleLeft size={18} color="var(--color-accent-rose)" />}
 </button>
 <button onClick={() => handleDelete(event.id)} className="btn-danger p-2 rounded-xl min-h-0"><Trash2 size={16} /></button>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 );
}
