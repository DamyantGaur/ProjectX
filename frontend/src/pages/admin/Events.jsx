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
        } catch (err) { console.error(err); }
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
        } catch (err) { alert(err.response?.data?.detail || 'Error'); }
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Event Management</h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{events.length} total events</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditingEvent(null); setForm({ title: '', description: '', venue: '', date: '', capacity: '', price: '0', tags: '' }); }} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} /> Create Event
                </button>
            </div>

            {/* Create/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card mb-8">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="glass-input" required minLength={3} /></div>
                            <div className="md:col-span-2"><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="glass-input" rows={3} required minLength={10} /></div>
                            <div><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Venue</label><input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="glass-input" required /></div>
                            <div><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Date & Time</label><input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="glass-input" required /></div>
                            <div><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="glass-input" required min={1} /></div>
                            <div><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Price ($)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="glass-input" min={0} /></div>
                            <div className="md:col-span-2"><label className="block text-xs mb-1" style={{ color: '#94A3B8' }}>Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="glass-input" placeholder="vip, electronic, concert" /></div>
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
                <div className="flex justify-center py-12"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: '#D946EF' }} /></div>
            ) : (
                <div className="dashboard-grid">
                    {events.map((event, i) => (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card group relative">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-base font-semibold truncate flex-1" style={{ color: '#F8FAFC' }}>{event.title}</h3>
                                <span className={`badge ${event.is_active ? 'badge-success' : 'badge-danger'}`}>{event.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <p className="text-xs mb-4 line-clamp-2" style={{ color: '#94A3B8' }}>{event.description}</p>
                            <div className="space-y-2 text-xs mb-4" style={{ color: '#64748B' }}>
                                <div className="flex items-center gap-2"><MapPin size={13} /> {event.venue}</div>
                                <div className="flex items-center gap-2"><Calendar size={13} /> {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
                                <div className="flex items-center gap-2"><Users size={13} /> {event.attendee_count} / {event.capacity}</div>
                                <div className="flex items-center gap-2"><DollarSign size={13} /> {event.price > 0 ? `$${event.price}` : 'Free'}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(event)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}><Edit2 size={12} /> Edit</button>
                                <button onClick={() => handleToggle(event.id)} className="flex items-center justify-center p-2 rounded-lg" style={{ background: event.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${event.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                    {event.is_active ? <ToggleRight size={16} color="#22C55E" /> : <ToggleLeft size={16} color="#EF4444" />}
                                </button>
                                <button onClick={() => handleDelete(event.id)} className="flex items-center justify-center p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}><Trash2 size={14} color="#EF4444" /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
