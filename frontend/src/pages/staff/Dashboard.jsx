import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Users, Calendar, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { eventsAPI, analyticsAPI } from '../../api/client';

export default function StaffDashboard() {
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({ total_scans: 0, approved: 0, denied: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, statsRes, scansRes] = await Promise.all([
        eventsAPI.listActive(),
        analyticsAPI.getStats(),
        analyticsAPI.scanLogs(0, 10)
      ]);
      setActiveEvents(eventsRes.data);
      if (eventsRes.data.length > 0) setSelectedEvent(eventsRes.data[0].id);
      setStats(statsRes.data);
      setRecentScans(scansRes.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = recentScans.filter(s => 
    s.qr_token.toLowerCase().includes(search.toLowerCase()) ||
    s.result.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64 spinner"><motion.div /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Event entry & scan overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center gap-3 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Scans', value: stats.total_scans, icon: QrCode, color: 'var(--color-accent-gold)' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'var(--color-accent-emerald)' },
          { label: 'Denied', value: stats.denied, icon: XCircle, color: 'var(--color-accent-rose)' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: item.color + '15', border: '1px solid ' + item.color + '30' }}>
                <item.icon size={24} color={item.color} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Events */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Active Events</h2>
        <div className="dashboard-grid">
          {activeEvents.map((event, i) => {
            const isSelected = selectedEvent === event.id;
            const progress = (event.attendee_count / event.capacity) * 100;
            return (
              <motion.div 
                key={event.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }} 
                onClick={() => setSelectedEvent(event.id)} 
                className={"glass-card cursor-pointer transition-all " + (isSelected ? "border-[var(--color-accent-gold)] ring-1 ring-[var(--color-accent-gold)]/20" : "border-white/5")}
              >
                <h3 className="font-semibold mb-2">{event.title}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{event.attendee_count} / {event.capacity} checked in</span>
                  <span className={event.price > 0 ? 'tier-gold' : 'tier-free'}>{event.price > 0 ? '$' + event.price : 'Free'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full mt-3" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: Math.min(100, progress) + '%', background: 'var(--gradient-gold)' }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Scans */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold">Recent Scan History</h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Filter scans..." 
              className="glass-input pl-10 text-xs py-2" 
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Time</th>
                  <th className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Token</th>
                  <th className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.05 }} 
                    className="border-b border-white/5 hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(scan.scanned_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{scan.qr_token.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className={"badge text-[10px] " + (scan.result === 'approved' ? 'badge-success' : 'badge-danger')}>
                        {scan.result}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredScans.length === 0 && (
            <div className="py-12 text-center">
              <Clock size={40} color="var(--color-text-muted)" className="mx-auto mb-4 opacity-20" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No recent scans found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
