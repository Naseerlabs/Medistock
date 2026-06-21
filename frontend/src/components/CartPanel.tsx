import { CartItem, InventoryItem } from '../types';

interface CartPanelProps {
  open: boolean;
  items: CartItem[];
  inventory: InventoryItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
  totalItems: number;
}

export default function CartPanel({ open, items, inventory, onUpdateQuantity, onRemove, onCheckout, onClose, totalItems }: CartPanelProps) {
  if (!open) return null;

  const findItem = (id: string) => inventory.find(i => i.Item_ID === id);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Your Cart ({totalItems})</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
        </div>

        <div className="mx-5 mt-4 bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <span>ℹ️</span> Review your items and proceed to checkout
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="font-medium">Your cart is empty</p>
            </div>
          ) : items.map(item => {
            const inv = findItem(item.itemId);
            const style = inv?.Category === 'Printed Forms' ? '📋' : inv?.Category === 'General Stationery' ? '✏️' : inv?.Category === 'Medical Supplies' ? '🏥' : '🖨️';
            return (
              <div key={item.itemId} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <span className="text-xl">{style}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.itemName}</p>
                  <p className="text-xs text-slate-400">{inv?.Category || ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.itemId, -1)}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100">−</button>
                  <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.itemId, 1)} disabled={item.quantity >= item.stock}
                    className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-40">+</button>
                </div>
                <button onClick={() => onRemove(item.itemId)}
                  className="text-xs text-red-500 font-semibold hover:text-red-700 whitespace-nowrap">Remove</button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal ({totalItems} items)</span>
            <span className="font-bold text-slate-900">{totalItems} units</span>
          </div>
          <button onClick={onCheckout} disabled={totalItems === 0}
            className="w-full btn-primary py-3.5 text-base">
            Proceed to Checkout →
          </button>
          <button onClick={onClose} className="w-full text-center text-sm text-blue-600 font-semibold hover:underline">
            View Cart Details
          </button>
        </div>
      </div>
    </>
  );
}
