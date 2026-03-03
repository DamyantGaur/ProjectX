import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/guards/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy-loaded pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminScanLogs = lazy(() => import('./pages/admin/ScanLogs'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));

// Staff
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffScanner = lazy(() => import('./pages/staff/Scanner'));

// User
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserEvents = lazy(() => import('./pages/user/EventsList'));
const UserPasses = lazy(() => import('./pages/user/Passes'));
const UserPayments = lazy(() => import('./pages/user/Payments'));
const UserRewards = lazy(() => import('./pages/user/Rewards'));
const UserProfile = lazy(() => import('./pages/user/Profile'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D14' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="scan-logs" element={<AdminScanLogs />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffDashboard />} />
              <Route path="scanner" element={<StaffScanner />} />
            </Route>

            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<UserDashboard />} />
              <Route path="events" element={<UserEvents />} />
              <Route path="passes" element={<UserPasses />} />
              <Route path="payments" element={<UserPayments />} />
              <Route path="rewards" element={<UserRewards />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
