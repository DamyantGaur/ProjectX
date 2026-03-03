import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D14' }}>
                <div className="spinner" style={{ width: '32px', height: '32px' }} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role if they try to access an unauthorized route
        const dashboardMap = {
            admin: '/admin',
            staff: '/staff',
            user: '/dashboard',
        };
        return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />;
    }

    // Special case for root paths to ensure admins don't get stuck in staff views
    if (user.role === 'admin' && window.location.pathname === '/staff') {
        return <Navigate to="/admin" replace />;
    }

    return children;
}
