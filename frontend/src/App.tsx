import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/Toast';
import Login from './pages/Login';
import DepartmentStore from './pages/DepartmentStore';
import DepartmentOrders from './pages/DepartmentOrders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminStaff from './pages/AdminStaff';
import AdminReports from './pages/AdminReports';
import AdminStockMovements from './pages/AdminStockMovements';
import AdminCategories from './pages/AdminCategories';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !user.is_admin) return <Navigate to="/store" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.is_admin ? '/admin/dashboard' : '/store'} /> : <Login />} />
      <Route path="/store" element={<ProtectedRoute><DepartmentStore /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><DepartmentOrders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute adminOnly><AdminStaff /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/stock-movements" element={<ProtectedRoute adminOnly><AdminStockMovements /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
