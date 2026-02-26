import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, LayoutDashboard, Calendar, Users, BarChart3,
    ScanLine, QrCode, CreditCard, Star, Settings, LogOut,
    Menu, X, ChevronLeft, ChevronRight, FileText, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/events', icon: Calendar, label: 'Events' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/scan-logs', icon: FileText, label: 'Scan Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const staffLinks = [
    { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/scanner', icon: ScanLine, label: 'Scanner' },
];

const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/events', icon: Calendar, label: 'Events' },
    { to: '/dashboard/passes', icon: QrCode, label: 'My Passes' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/rewards', icon: Star, label: 'Rewards' },
    { to: '/dashboard/profile', icon: Settings, label: 'Profile' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Desktop sidebar collapsed state
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Mobile sidebar open state
    const [mobileOpen, setMobileOpen] = useState(false);
    // Responsive check
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : userLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tierColors = { free: '#6B7280', silver: '#9CA3AF', gold: '#F59E0B', vip: '#D946EF' };

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Listen for window resize
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        const handler = (e) => setIsMobile(!e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return (
        <div className="min-h-screen flex" style={{ background: '#020005', color: '#F8FAFC' }}>
            {/* ─── Desktop Sidebar ─── */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="hidden lg:flex flex-col fixed h-full z-40 glass"
                style={{ borderRight: '1px solid rgba(139,92,246,0.1)' }}
            >
                {/* Header / Logo */}
                <div className="p-6 flex items-center justify-between overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2"
                            >
                                <Sparkles size={22} color="#D946EF" />
                                <span className="text-lg font-bold neon-text whitespace-nowrap">PROJECT X</span>
                            </motion.div>
                        )}
                        {isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mx-auto"
                            >
                                <Sparkles size={24} color="#D946EF" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full glass flex items-center justify-center border border-[rgba(139,92,246,0.2)] text-[#D946EF] hover:bg-[rgba(217,70,239,0.1)] transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar">
                    {links.map((link) => {
                        const active = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                                style={{
                                    background: active ? 'rgba(217,70,239,0.1)' : 'transparent',
                                    color: active ? '#D946EF' : '#94A3B8',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                                }}
                            >
                                <link.icon size={20} className={active ? 'scale-110' : ''} />
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="whitespace-nowrap"
                                    >
                                        {link.label}
                                    </motion.span>
                                )}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && (
                                    <div className="absolute left-16 px-2 py-1 rounded bg-[#1e1a2b] text-white text-xs invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[rgba(139,92,246,0.2)] z-50">
                                        {link.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Logout */}
                <div className={`p-4 mx-3 mb-4 rounded-xl transition-all ${isCollapsed ? 'px-2' : ''}`} style={{ background: 'rgba(15,10,30,0.5)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center mb-0' : 'mb-3'}`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: '#F8FAFC' }}>{user?.name}</p>
                                <p className="text-xs capitalize" style={{ color: tierColors[user?.membership_tier] || '#6B7280' }}>{user?.membership_tier || 'Free'} Member</p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm w-full px-3 py-2 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.05)] transition-all"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    )}
                    {isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="flex justify-center w-full py-2 mt-2 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* ─── Mobile View ─── */}
            <div className="lg:hidden fixed top-0 w-full z-50 glass px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                <Link to="/" className="flex items-center gap-2">
                    <Sparkles size={20} color="#D946EF" />
                    <span className="text-lg font-bold neon-text">PROJECT X</span>
                </Link>
                <button onClick={() => setMobileOpen(true)} className="p-2 text-[#94A3B8]">
                    <Menu size={20} />
                </button>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 h-full w-72 z-[70] glass flex flex-col pt-20"
                            style={{ borderRight: '1px solid rgba(139,92,246,0.15)' }}
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-[#94A3B8]"
                            >
                                <X size={24} />
                            </button>

                            <nav className="flex-1 px-4 space-y-2 mt-4">
                                {links.map((link) => {
                                    const active = location.pathname === link.to;
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all"
                                            style={{
                                                background: active ? 'rgba(217,70,239,0.1)' : 'transparent',
                                                color: active ? '#D946EF' : '#94A3B8',
                                                border: active ? '1px solid rgba(217,70,239,0.2)' : '1px solid transparent'
                                            }}
                                        >
                                            <link.icon size={22} />
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-6 mt-auto">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-semibold bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] transition-colors"
                                >
                                    <LogOut size={20} /> Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main Content ─── */}
            <motion.main
                className="flex-1 min-h-screen pt-16 lg:pt-0"
                animate={{ marginLeft: isMobile ? 0 : (isCollapsed ? 80 : 260) }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
                <div className="p-4 md:p-8 lg:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.main>
        </div>
    );
}
