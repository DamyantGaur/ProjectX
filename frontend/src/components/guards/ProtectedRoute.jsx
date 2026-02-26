import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#020005' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: '#D946EF', borderRightColor: '#8B5CF6' }}
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardMap = {
            admin: '/admin',
            staff: '/staff',
            user: '/dashboard',
        };
        return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />;
    }

    return children;
}
