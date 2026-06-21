import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CluePool from '@/pages/CluePool';
import ClueDetail from '@/pages/ClueDetail';
import Transfer from '@/pages/Transfer';
import Schedule from '@/pages/Schedule';
import DuplicateCustomer from '@/pages/DuplicateCustomer';
import Reports from '@/pages/Reports';
import Rules from '@/pages/Rules';
import StoreManagement from '@/pages/StoreManagement';
import ExportHistory from '@/pages/ExportHistory';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isLoggedIn, hasPermission, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasPermission(roles)) {
    if (user?.role === 'admin' || user?.role === 'storeManager') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clues" element={
              <ProtectedRoute roles={['admin', 'storeManager', 'consultant']}>
                <CluePool />
              </ProtectedRoute>
            } />
            <Route path="/clues/:id" element={
              <ProtectedRoute roles={['admin', 'storeManager', 'consultant']}>
                <ClueDetail />
              </ProtectedRoute>
            } />
            <Route path="/transfer" element={
              <ProtectedRoute roles={['admin', 'storeManager']}>
                <Transfer />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute roles={['admin', 'scheduler', 'storeManager']}>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/duplicate" element={
              <ProtectedRoute roles={['admin']}>
                <DuplicateCustomer />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['admin', 'storeManager']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/exports" element={
              <ProtectedRoute roles={['admin', 'storeManager']}>
                <ExportHistory />
              </ProtectedRoute>
            } />
            <Route path="/rules" element={
              <ProtectedRoute roles={['admin']}>
                <Rules />
              </ProtectedRoute>
            } />
            <Route path="/stores" element={
              <ProtectedRoute roles={['admin']}>
                <StoreManagement />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}
