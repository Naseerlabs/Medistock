import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

const DEPT_NAMES: Record<string, string> = {
  dept_opd: 'OPD', dept_icu: 'ICU', dept_dialysis: 'Dialysis',
  dept_dental: 'Dental', dept_xray: 'X-Ray', dept_pathalogy: 'Pathology', dept_admin: 'Admin',
};

export default function AdminReports() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'top-items' | 'dept' | 'trends'>('top-items');
  const [topItems, setTopItems] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any>({});
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_admin) { navigate('/'); return; }
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/analytics/top-items`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/analytics/dept-consumption`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/analytics/trends`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([itemsData, deptData2, trendsData]) => {
      if (itemsData.items) setTopItems(itemsData.items);
      if (deptData2.departments) setDeptData(deptData2.departments);
      if (trendsData.series) setTrends(trendsData.series);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const exportCSV = () => {
    let csv = 'Item,Category,Total Requested\n';
    topItems.forEach((i: any) => csv += `"${i.name}","${i.category}",${i.total}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inventory-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <Layout
      title="📊 Reports & Analytics"
      subtitle="Usage insights and trends"
      headerRight={<button onClick={exportCSV} className="btn-ghost text-sm">⬇ Export CSV</button>}
    >
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['top-items', 'dept', 'trends'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {t === 'top-items' ? '📊 Top Items' : t === 'dept' ? '🏥 Departments' : '📈 Trends'}
          </button>
        ))}
      </div>

      {loading ? (
        <div>
          <Skeleton variant="table-row" count={10} />
        </div>
      ) : tab === 'top-items' ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-500">#</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Item</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 hidden sm:table-cell">Category</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topItems.map((item: any, i: number) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{item.name}</td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{item.category}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'dept' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(deptData).map(([deptId, cats]: [string, any]) => (
            <div key={deptId} className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">{DEPT_NAMES[deptId] || deptId}</h3>
              <div className="space-y-2">
                {Object.entries(cats).sort((a: any, b: any) => b[1] - a[1]).map(([cat, total]: [string, any]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-slate-600">{cat}</span>
                    <span className="font-semibold text-slate-900">{total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Monthly Order Volume</h3>
          <div className="space-y-3">
            {trends.map((t: any) => {
              const maxVal = Math.max(...trends.map((x: any) => x.total), 1);
              return (
                <div key={t.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{t.month}</span>
                    <span className="text-slate-500">{t.total} orders</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(t.total / maxVal) * 100}%` }} />
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
                    <span>✅ {t.dispatched} dispatched</span>
                    <span>❌ {t.rejected} rejected</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
