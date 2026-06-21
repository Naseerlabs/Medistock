import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

export default function AdminCategories() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) { navigate('/'); return; }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.categories) setCategories(data.categories.sort());
    } catch {}
    setLoading(false);
  };

  const handleRename = async (oldName: string) => {
    if (!newName.trim()) { showToast('New name required', 'warning'); return; }
    if (newName.trim() === oldName) { setRenaming(null); setNewName(''); return; }
    const res = await fetch(`${API_BASE}/inventory/categories/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldName, newName: newName.trim() }),
    });
    if (res.ok) {
      showToast(`"${oldName}" renamed to "${newName.trim()}"`, 'success');
      setRenaming(null); setNewName('');
      fetchCategories();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to rename', 'error');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete category "${name}"? Items will be moved to "Uncategorized".`)) return;
    const res = await fetch(`${API_BASE}/inventory/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast(`"${name}" deleted`, 'success');
      fetchCategories();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to delete', 'error');
    }
  };

  if (!user) return null;

  return (
    <Layout
      title="Categories"
      subtitle={`${categories.length} categories`}
      headerRight={<button onClick={() => { setShowAdd(true); setAddName(''); }} className="btn-primary text-sm">+ Add Category</button>}
    >
      {loading ? (
        <Skeleton variant="card" count={5} />
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📂</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No categories</h3>
          <p className="text-sm text-slate-500">Categories are derived from inventory items</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {categories.map(cat => (
            <div key={cat} className="flex items-center justify-between px-5 py-4">
              {renaming === cat ? (
                <div className="flex items-center gap-3 flex-1">
                  <input className="input flex-1" value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(cat); if (e.key === 'Escape') { setRenaming(null); setNewName(''); } }}
                    autoFocus />
                  <button onClick={() => handleRename(cat)} className="btn-primary text-sm py-2">Save</button>
                  <button onClick={() => { setRenaming(null); setNewName(''); }} className="btn-ghost text-sm py-2">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">📁</span>
                    <span className="font-semibold text-slate-900">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setRenaming(cat); setNewName(cat); }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800">Rename</button>
                    <button onClick={() => handleDelete(cat)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Add Category</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-4">
              <input className="input" placeholder="Category name" value={addName}
                onChange={e => setAddName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') document.getElementById('btn-save-cat')?.click(); }} autoFocus />
              <button id="btn-save-cat" onClick={async () => {
                if (!addName.trim()) { showToast('Name required', 'warning'); return; }
                setAdding(true);
                const res = await fetch(`${API_BASE}/inventory/categories`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ name: addName.trim() }),
                });
                const d = await res.json();
                if (res.ok) {
                  showToast(`"${addName.trim()}" added`, 'success');
                  setShowAdd(false);
                  fetchCategories();
                } else {
                  showToast(d.error || 'Failed', 'error');
                }
                setAdding(false);
              }} disabled={adding || !addName.trim()} className="w-full btn-primary py-3">
                {adding ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
