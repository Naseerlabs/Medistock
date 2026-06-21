import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

export default function AdminStaff() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', departmentId: '', staffId: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, departmentId: false, staffId: false });
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (!user || !user.is_admin) { navigate('/'); return; }
    fetchStaff();
  }, [user]);

  const fetchStaff = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        fetch(`${API_BASE}/staff`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/staff/departments`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const data = await staffRes.json();
      const deptData = await deptRes.json();
      if (data.staff) setStaff(data.staff);
      if (deptData.departments) {
        setDepartments(deptData.departments.map((d: any) => ({ id: d.Department_ID, name: d.Department_Name })));
      }
    } catch {}
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', departmentId: '', staffId: '' }); setError(''); setTouched({ name: false, departmentId: false, staffId: false }); setShowModal(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.Staff_Name, departmentId: s.Department_ID, staffId: String(s.Staff_3_Digit_ID) }); setError(''); setTouched({ name: true, departmentId: true, staffId: true }); setShowModal(true); };

  const formErrors = {
    name: touched.name && !form.name,
    departmentId: touched.departmentId && !form.departmentId,
    staffId: touched.staffId && (!form.staffId || parseInt(form.staffId) < 1 || parseInt(form.staffId) > 999),
  };

  const handleSave = async () => {
    setTouched({ name: true, departmentId: true, staffId: true });
    if (!form.name || !form.departmentId || !form.staffId) { setError('All fields required'); return; }
    const idNum = parseInt(form.staffId);
    if (idNum < 1 || idNum > 999) { setError('Staff ID must be 1-999'); return; }
    setSaving(true); setError('');
    try {
      const url = editing ? `${API_BASE}/staff/${editing.Staff_UID}` : `${API_BASE}/staff`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, departmentId: form.departmentId, staffId: idNum }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      showToast(editing ? 'Staff updated' : 'Staff created', 'success');
      setShowModal(false);
      fetchStaff();
    } catch { setError('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Delete this staff member?')) return;
    setDeleting(uid);
    const res = await fetch(`${API_BASE}/staff/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Delete failed', 'error'); setDeleting(null); return; }
    showToast('Staff deleted', 'success');
    setDeleting(null);
    fetchStaff();
  };

  if (!user) return null;

  return (
    <Layout
      title="👥 Staff Management"
      subtitle={`${staff.length} staff members`}
      headerRight={<><button onClick={() => setShowImport(true)} className="btn-ghost text-sm">📥 Import</button><button onClick={openAdd} className="btn-primary text-sm">+ Add Staff</button></>}
    >
      {loading ? (
        <div className="card overflow-hidden">
          <div className="p-5 space-y-3">
            <Skeleton variant="table-row" count={8} />
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">ID</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 hidden sm:table-cell">Department</th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.map((s: any) => (
                  <tr key={s.Staff_UID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{s.Staff_3_Digit_ID}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{s.Staff_Name}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{s.User_Department?.Department_Name || 'Unknown'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs mr-3">Edit</button>
                      <button onClick={() => handleDelete(s.Staff_UID)} disabled={deleting === s.Staff_UID}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs disabled:opacity-40">
                        {deleting === s.Staff_UID ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Import */}      {showImport && (        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowImport(false); setImportResult(null); setImportText(''); }} />          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg">            <div className="flex items-center justify-between mb-5">              <h2 className="text-lg font-bold text-slate-900">Bulk Import Staff</h2>              <button onClick={() => { setShowImport(false); setImportResult(null); setImportText(''); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>            </div>            {importResult ? (              <div className="space-y-4">                <div className="flex gap-4">                  <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">                    <p className="text-2xl font-bold text-green-600">{importResult.success}</p>                    <p className="text-xs text-green-700">Created</p>                  </div>                  <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">                    <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>                    <p className="text-xs text-red-700">Errors</p>                  </div>                </div>                <div className="max-h-40 overflow-y-auto space-y-1">                  {importResult.items?.filter((i: any) => i.error).map((i: any, idx: number) => (                    <p key={idx} className="text-xs text-red-600">✕ {i.name || '?'}: {i.error}</p>                  ))}                </div>                <button onClick={() => { setShowImport(false); setImportResult(null); setImportText(''); fetchStaff(); }}                  className="w-full btn-primary py-3">Done</button>              </div>            ) : (              <div className="space-y-4">                <p className="text-sm text-slate-500">Paste CSV data or JSON array. Format: <code className="text-xs bg-slate-100 px-1 rounded">name, departmentId, staffId</code> (one per line)</p>                <textarea className="input h-40 font-mono text-xs" placeholder={`Dr. Smith, dept_opd, 201\nNurse Jane, dept_icu, 202`}                  value={importText} onChange={e => setImportText(e.target.value)} />                <button onClick={async () => {                  setImporting(true);                  const lines = importText.trim().split('\n').filter(Boolean);                  const staff = lines.map((l: string) => {                    const parts = l.split(',').map((p: string) => p.trim());                    return { name: parts[0], departmentId: parts[1], staffId: parseInt(parts[2]) };                  });                  const res = await fetch(`${API_BASE}/staff/bulk`, {                    method: 'POST',                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },                    body: JSON.stringify({ staff }),                  });                  const data = await res.json();                  setImportResult(data);                  setImporting(false);                  showToast(`${data.success} staff created, ${data.errors} errors`, data.errors > 0 ? 'warning' : 'success');                }} disabled={importing || !importText.trim()} className="w-full btn-primary py-3">                  {importing ? 'Importing...' : 'Import'}                </button>              </div>            )}          </div>        </div>      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Staff' : 'Add Staff'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Name</label>
                <input className={`input ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="Staff name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))} />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Department</label>
                <select className={`input ${formErrors.departmentId ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, departmentId: true }))}>
                  <option value="">Select department</option>
                  {departments.filter(d => d.id !== 'dept_admin').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {formErrors.departmentId && <p className="text-xs text-red-500 mt-1">Select a department</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Staff ID (3-digit)</label>
                <input className={`input ${formErrors.staffId ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="e.g. 123" value={form.staffId} maxLength={3}
                  onChange={e => setForm({ ...form, staffId: e.target.value.replace(/\D/g, '') })}
                  onBlur={() => setTouched(prev => ({ ...prev, staffId: true }))} />
                {formErrors.staffId && <p className="text-xs text-red-500 mt-1">Enter a valid ID (1-999)</p>}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button onClick={handleSave} disabled={saving} className="w-full btn-primary py-3.5">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
