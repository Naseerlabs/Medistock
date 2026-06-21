import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

interface DeptOrder {
  Order_ID: string;
  Order_Timestamp: string;
  Order_Status: string;
  Order_Line_Items: any[];
}

const PAGE_SIZE = 10;

export default function DepartmentOrders() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DeptOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchOrders();
  }, [user, page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${API_BASE}/orders/department?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.total !== undefined) setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { showToast('Order cancelled', 'success'); fetchOrders(); }
    else { const d = await res.json(); showToast(d.error || 'Failed to cancel', 'error'); }
  };

  const getStatusInfo = (s: string) => {
    switch (s) {
      case 'Pending': return { badge: 'badge-amber', icon: '⏳', label: 'Pending' };
      case 'Packed': return { badge: 'badge-blue', icon: '📦', label: 'Packed' };
      case 'Dispatched': return { badge: 'badge-green', icon: '✅', label: 'Dispatched' };
      case 'Rejected': return { badge: 'badge-red', icon: '❌', label: 'Rejected' };
      default: return { badge: 'badge-slate', icon: '❓', label: s };
    }
  };

  if (!user) return null;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout title="📋 My Orders" subtitle={`${user.department_name} — ${user.name}`}>
      {/* Status filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: '📋 All' },
          { key: 'Pending', label: '⏳ Pending' },
          { key: 'Packed', label: '📦 Packed' },
          { key: 'Dispatched', label: '✅ Dispatched' },
          { key: 'Rejected', label: '❌ Rejected' },
        ].map(s => (
          <button key={s.key} onClick={() => { setStatusFilter(s.key); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === s.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="card" count={5} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
          <p className="text-sm text-slate-500 mb-4">Head to the store to place your first order</p>
          <button onClick={() => navigate('/store')} className="btn-primary">Go to Store</button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = getStatusInfo(order.Order_Status);
            const isExpanded = expandedId === order.Order_ID;
            return (
              <div key={order.Order_ID} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(order.Order_Timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.Order_Line_Items?.length || 0} items · {order.Order_ID}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${s.badge}`}>{s.icon} {s.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setExpandedId(isExpanded ? null : order.Order_ID)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700" aria-expanded={isExpanded}>
                      {isExpanded ? '▲ Hide Items' : '▼ View Items'}
                    </button>
                    {order.Order_Status === 'Pending' && (
                      <button onClick={() => handleCancel(order.Order_ID)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 ml-auto">✕ Cancel</button>
                    )}
                  </div>
                  {isExpanded && order.Order_Line_Items && order.Order_Line_Items.length > 0 && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 space-y-2">
                      {order.Order_Line_Items.map((li: any) => (
                        <div key={li.Line_Item_ID}
                          className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-slate-700">
                            {li.Inventory_Items?.Item_Name || li.Item_Name || li.Item_ID}
                          </span>
                          <span className="badge badge-blue">×{li.Quantity_Requested}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-ghost text-sm disabled:opacity-30">← Previous</button>
          <span className="text-sm text-slate-500 font-medium">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
            className="btn-ghost text-sm disabled:opacity-30">Next →</button>
        </div>
      )}
    </Layout>
  );
}
