import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

interface ProfileOrder {
  Order_ID: string;
  Order_Timestamp: string;
  Order_Status: string;
  Order_Line_Items: any[];
}

export default function Profile() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRecentOrders();
  }, [user]);

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/department?limit=5&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Pending': return 'badge-amber';
      case 'Packed': return 'badge-blue';
      case 'Dispatched': return 'badge-green';
      case 'Rejected': return 'badge-red';
      default: return 'badge-slate';
    }
  };

  if (!user) return null;

  return (
    <Layout title="Profile" subtitle={`${user.department_name} — ${user.name}`}>
      {/* Staff Info Card */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30 shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.department_name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>Staff ID: {user.staff_id}</span>
              <span>·</span>
              <span>{user.is_admin ? 'Administrator' : 'Department Staff'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <h3 className="section-title">Recent Orders</h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="card" count={3} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
          <p className="text-sm text-slate-500">Your recent orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.Order_ID} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(order.Order_Timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {order.Order_Line_Items?.length || 0} items
                  </p>
                </div>
                <span className={`badge ${getStatusBadge(order.Order_Status)} shrink-0`}>
                  {order.Order_Status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
