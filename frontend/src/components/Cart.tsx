import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  totalItems: number;
  disabled?: boolean;
}

export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout, totalItems, disabled }: CartProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-bold text-slate-900">{totalItems} items</span>
          </div>
          <button onClick={() => items.forEach(i => onRemove(i.itemId))}
            className="text-xs text-red-500 font-semibold hover:text-red-700">Clear All</button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-2 mb-4 pr-1">
          {items.map(item => (
            <div key={item.itemId} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
              <span className="text-sm font-medium text-slate-700 truncate flex-1 mr-3">{item.itemName}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateQuantity(item.itemId, -1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold flex items-center justify-center active:scale-95 text-sm">
                  −
                </button>
                <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.itemId, 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold flex items-center justify-center active:scale-95 text-sm disabled:opacity-30">
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onCheckout} disabled={disabled || totalItems === 0}
          className="w-full btn-success py-3.5 text-base">
          Checkout ({totalItems} items)
        </button>
      </div>
    </div>
  );
}
