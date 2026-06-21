import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { InventoryItem } from '../types';
import { API_BASE } from '../lib/constants';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import CartPanel from '../components/CartPanel';
import Numpad from '../components/Numpad';
import Skeleton from '../components/Skeleton';

export default function DepartmentStore() {
  const { user, token } = useAuth();
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, totalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.is_admin) { navigate('/'); return; }
    fetchInventory();
  }, [user, selectedCategory, search]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/inventory/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => {});
  }, [token]);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/inventory?category=${selectedCategory}&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInventory(data.items || []);
    setLoading(false);
  };

  const cartItemMap = new Map(cartItems.map(c => [c.itemId, c.quantity]));

  const handleCheckout = async () => {
    if (!staffId || staffId.length !== 3) {
      setCheckoutError('Enter valid 3-digit Staff ID');
      return;
    }
    const enteredId = parseInt(staffId, 10);
    if (enteredId !== user!.staff_id) {
      setCheckoutError('Staff ID does not match your account');
      return;
    }
    setOrdering(true);
    setCheckoutError('');

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: cartItems.map(i => ({ itemId: i.itemId, quantity: i.quantity })) }),
    });

    const data = await res.json();
    setOrdering(false);

    if (!res.ok) {
      setCheckoutError(data.error || 'Order failed');
      return;
    }

    clearCart();
    setShowCheckout(false);
    setShowCart(false);
    setStaffId('');
    showToast('Order placed successfully!', 'success');
  };

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <Layout
        title={`🏥 ${user.department_name}`}
        subtitle={user.name}
        headerRight={
          <div className="flex items-center gap-3">
            <button className="btn-icon relative" aria-label="Notifications">
              🔔
            </button>
            <button onClick={() => setShowCart(true)} className="btn-icon relative" aria-label="Open cart">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{totalItems}</span>
              )}
            </button>
          </div>
        }
      >
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="greeting">Welcome, {user.name} 👋</h2>
          <p className="greeting-sub">{today}</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input ref={searchRef} className="input pl-10" placeholder="Search items... (Ctrl+K)" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2">
            <button onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
              All Items
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            <Skeleton variant="product-card" count={8} />
          </div>
        ) : inventory.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl block mb-4">📦</span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-sm text-slate-500">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {inventory.map(item => (
              <ProductCard
                key={item.Item_ID}
                item={item}
                cartQty={cartItemMap.get(item.Item_ID) || 0}
                onAdd={() => {
                  addItem({ itemId: item.Item_ID, itemName: item.Item_Name, quantity: 1, stock: item.Current_Stock });
                  setShowCart(true);
                }}
                onIncrement={() => updateQuantity(item.Item_ID, 1)}
                onDecrement={() => updateQuantity(item.Item_ID, -1)}
              />
            ))}
          </div>
        )}

        {/* Need help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">Need help? <span className="text-blue-600 font-medium cursor-pointer hover:underline">Contact support</span></p>
        </div>
      </Layout>

      <CartPanel
        open={showCart}
        items={cartItems}
        inventory={inventory}
        onUpdateQuantity={updateQuantity}
        onRemove={(id) => removeItem(id)}
        onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        onClose={() => setShowCart(false)}
        totalItems={totalItems}
      />

      {showCheckout && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowCheckout(false); setStaffId(''); setCheckoutError(''); }} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md sm:mx-4" role="dialog" aria-modal="true" aria-label="Checkout">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verify Staff ID</h2>
                <p className="text-sm text-slate-500">Enter your 3-digit ID to confirm</p>
              </div>
              <button onClick={() => { setShowCheckout(false); setStaffId(''); setCheckoutError(''); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400" aria-label="Close checkout">✕</button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Summary</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {cartItems.map(item => {
                  const inv = inventory.find(i => i.Item_ID === item.itemId);
                  return (
                    <div key={item.itemId} className="flex justify-between text-sm">
                      <span className="text-slate-700">{inv?.Item_Name || item.itemName}</span>
                      <span className="font-semibold text-slate-900">×{item.quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 mb-4">
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-14 h-16 rounded-xl flex items-center justify-center text-2xl font-mono font-bold
                    ${i < staffId.length ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 border-2 border-slate-200'}`}>
                    {i < staffId.length ? staffId[i] : ''}
                  </div>
                ))}
              </div>
            </div>

            <Numpad
              onDigit={d => setStaffId(prev => prev.length < 3 ? prev + d : prev)}
              onBackspace={() => setStaffId(prev => prev.slice(0, -1))}
              onClear={() => setStaffId('')}
              disabled={ordering}
            />

            {checkoutError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-2.5 text-sm font-medium mt-3">
                <span>⚠️</span> {checkoutError}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowCheckout(false); setStaffId(''); setCheckoutError(''); }}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleCheckout} disabled={ordering || staffId.length !== 3}
                className="flex-1 btn-success py-3.5">
                {ordering ? 'Placing...' : '✓ Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
