import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

interface Movement {
  Movement_ID: string;
  Item_ID: string;
  Order_ID: string | null;
  Movement_Type: 'Inward' | 'Dispatch' | 'Rejection_Return' | 'Adjustment';
  Quantity: number;
  Previous_Stock: number;
  New_Stock: number;
  Performed_By: string;
  Created_At: string;
  Inventory_Items: { Item_Name: string; Category: string };
  Staff_Master: { Staff_Name: string };
}

const TYPE_STYLES: Record<string, string> = {
  Inward: 'badge-green',
  Dispatch: 'badge-red',
  Rejection_Return: 'badge-amber',
  Adjustment: 'badge-blue',
};

const PAGE_SIZE = 25;

export default function AdminStockMovements() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    if (!user || !user.is_admin) { navigate('/'); return; }
    fetchMovements();
  }, [user, page, typeFilter]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`${API_BASE}/stock-movements?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.movements) setMovements(data.movements);
      if (data.total !== undefined) setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const getTypeStyle = (t: string) => TYPE_STYLES[t] || 'badge-slate';

  if (!user) return null;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout
      title="Stock Movements"
      subtitle="Audit log of all stock changes"
    >
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {['all', 'Inward', 'Dispatch', 'Rejection_Return', 'Adjustment'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${typeFilter === t ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {t === 'all' ? '📋 All' : t === 'Inward' ? '📥 Inward' : t === 'Dispatch' ? '📤 Dispatch' : t === 'Rejection_Return' ? '↩ Returns' : '🔧 Adjustments'}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={8} />
      ) : movements.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📋</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No movements found</h3>
          <p className="text-sm text-slate-500">Stock movements will appear here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Item</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Type</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Qty</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Prev</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">New</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movements.map(m => (
                  <tr key={m.Movement_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                      {new Date(m.Created_At).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {m.Inventory_Items?.Item_Name || m.Item_ID}
                      <span className="block text-xs text-slate-400">{m.Inventory_Items?.Category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getTypeStyle(m.Movement_Type)}`}>{m.Movement_Type}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{m.Quantity}</td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{m.Previous_Stock}</td>
                    <td className="px-4 py-3 text-center font-bold hidden sm:table-cell">{m.New_Stock}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                      {m.Staff_Master?.Staff_Name || m.Performed_By}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
