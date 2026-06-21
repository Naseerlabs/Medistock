import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { InventoryItem } from '../types';
import { API_BASE } from '../lib/constants';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';

export default function AdminInventory() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showInward, setShowInward] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [inwardItem, setInwardItem] = useState('');
  const [inwardQty, setInwardQty] = useState('');
  const [itemForm, setItemForm] = useState({ name: '', category: 'General Stationery', stock: '0', threshold: '10' });
  const [loading, setLoading] = useState(true);
  const [touched, setTouched] = useState({ name: false, stock: false, threshold: false });

  useEffect(() => {
    if (!user || !user.is_admin) { navigate('/'); return; }
    fetchItems();
    fetchCategories();
  }, [user, selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {}
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory?category=${selectedCategory}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {}
    setLoading(false);
  };

  const handleInward = async () => {
    if (!inwardItem || !inwardQty) return;
    const res = await fetch(`${API_BASE}/inventory/inward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId: inwardItem, quantity: parseInt(inwardQty) }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Stock updated! New: ${data.newStock}`, 'success');
      setShowInward(false); setInwardQty(''); setInwardItem('');
      fetchItems();
    } else showToast(data.error || 'Failed', 'error');
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ name: '', category: 'General Stationery', stock: '0', threshold: '10' });
    setTouched({ name: false, stock: false, threshold: false });
    setShowItemModal(true);
  };

  const openEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({ name: item.Item_Name, category: item.Category, stock: String(item.Current_Stock), threshold: String(item.Low_Stock_Threshold) });
    setTouched({ name: true, stock: true, threshold: true });
    setShowItemModal(true);
  };

  const formErrors = {
    name: touched.name && !itemForm.name,
    stock: touched.stock && (itemForm.stock === '' || parseInt(itemForm.stock) < 0 || isNaN(parseInt(itemForm.stock))),
    threshold: touched.threshold && (itemForm.threshold === '' || parseInt(itemForm.threshold) < 0 || isNaN(parseInt(itemForm.threshold))),
  };

  const handleSaveItem = async () => {
    setTouched({ name: true, stock: true, threshold: true });
    if (!itemForm.name) { showToast('Item name required', 'error'); return; }
    try {
      if (editingItem) {
        const res = await fetch(`${API_BASE}/inventory/${editingItem.Item_ID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ itemName: itemForm.name, category: itemForm.category, currentStock: parseInt(itemForm.stock), lowStockThreshold: parseInt(itemForm.threshold) }),
        });
        if (!res.ok) { const d = await res.json(); showToast(d.error, 'error'); return; }
        showToast('Item updated', 'success');
      } else {
        const res = await fetch(`${API_BASE}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ itemName: itemForm.name, category: itemForm.category, currentStock: parseInt(itemForm.stock), lowStockThreshold: parseInt(itemForm.threshold) }),
        });
        if (!res.ok) { const d = await res.json(); showToast(d.error, 'error'); return; }
        showToast('Item created', 'success');
      }
      setShowItemModal(false);
      fetchItems();
    } catch { showToast('Save failed', 'error'); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, 'error'); return; }
    showToast('Item deleted', 'success');
    fetchItems();
  };

  const lowStockCount = items.filter(i => i.Current_Stock <= i.Low_Stock_Threshold).length;
  const totalStock = items.reduce((sum, i) => sum + i.Current_Stock, 0);

  if (!user) return null;

  return (
    <Layout
      title="📋 Inventory"
      subtitle={`${items.length} items · ${lowStockCount} low in stock`}
      headerRight={
        <>
          <button onClick={openAddItem} className="btn-primary text-sm">+ New Item</button>
          <button onClick={() => setShowInward(true)} className="btn-success text-sm">+ Add Stock</button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon-box bg-blue-100">📦</div>
          <div><p className="stat-value">{totalStock.toLocaleString()}</p><p className="stat-label">Total Stock Units</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box bg-red-100">⚠️</div>
          <div><p className={`stat-value ${lowStockCount > 0 ? 'text-red-600' : ''}`}>{lowStockCount}</p><p className="stat-label">Low Stock Items</p></div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input className="input flex-1" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="table-row" count={8} />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
          <p className="text-sm text-slate-500 mb-4">Your inventory is empty</p>
          <button onClick={openAddItem} className="btn-primary">+ Add New Item</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Category</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Stock</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Threshold</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const isLow = item.Current_Stock <= item.Low_Stock_Threshold;
                  return (
                    <tr key={item.Item_ID} className={`transition-colors hover:bg-slate-50 ${isLow ? 'bg-red-50/50' : ''}`}>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-sm text-slate-900">{item.Item_Name}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell"><span className="badge badge-slate">{item.Category}</span></td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{item.Current_Stock}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-slate-500">{item.Low_Stock_Threshold}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>{isLow ? '⚠ Low' : '✓ OK'}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => openEditItem(item)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs mr-3">Edit</button>
                        <button onClick={() => handleDeleteItem(item.Item_ID)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showInward && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInward(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Stock Inward</h2>
              <button onClick={() => setShowInward(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Item</label>
                <select value={inwardItem} onChange={e => setInwardItem(e.target.value)} className="input">
                  <option value="">Choose an item...</option>
                  {items.map(item => <option key={item.Item_ID} value={item.Item_ID}>{item.Item_Name} — Stock: {item.Current_Stock}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quantity to Add</label>
                <input type="number" min="1" value={inwardQty} onChange={e => setInwardQty(e.target.value)}
                  className="input text-center text-2xl font-bold" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowInward(false); setInwardItem(''); setInwardQty(''); }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</button>
                <button onClick={handleInward} disabled={!inwardItem || !inwardQty}
                  className="flex-1 btn-primary py-3">Add Stock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowItemModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Item' : 'New Item'}</h2>
              <button onClick={() => setShowItemModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Name</label>
                <input className={`input ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="Item name" value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))} />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Category</label>
                <select className="input" value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Initial Stock</label>
                  <input type="number" min="0"
                    className={`input ${formErrors.stock ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    value={itemForm.stock}
                    onChange={e => setItemForm({ ...itemForm, stock: e.target.value })}
                    onBlur={() => setTouched(prev => ({ ...prev, stock: true }))} />
                  {formErrors.stock && <p className="text-xs text-red-500 mt-1">Enter a valid number</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Low Stock At</label>
                  <input type="number" min="0"
                    className={`input ${formErrors.threshold ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    value={itemForm.threshold}
                    onChange={e => setItemForm({ ...itemForm, threshold: e.target.value })}
                    onBlur={() => setTouched(prev => ({ ...prev, threshold: true }))} />
                  {formErrors.threshold && <p className="text-xs text-red-500 mt-1">Enter a valid number</p>}
                </div>
              </div>
              <button onClick={handleSaveItem} className="w-full btn-primary py-3.5">{editingItem ? 'Save Changes' : 'Create Item'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
