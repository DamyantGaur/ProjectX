import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminUsers from './pages/admin/Users';
import AdminScanLogs from './pages/admin/ScanLogs';
import AdminSettings from './pages/admin/Settings';

// Staff
import StaffDashboard from './pages/staff/Dashboard';
import StaffScanner from './pages/staff/Scanner';

// User
import UserDashboard from './pages/user/Dashboard';
import UserEvents from './pages/user/EventsList';
import UserPasses from './pages/user/Passes';
import UserPayments from './pages/user/Payments';
import UserRewards from './pages/user/Rewards';
import UserProfile from './pages/user/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
