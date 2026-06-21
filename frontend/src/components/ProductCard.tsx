import { InventoryItem } from '../types';

interface ProductCardProps {
  item: InventoryItem;
  cartQty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

const CAT_ICONS: Record<string, { bg: string; icon: string }> = {
  'Printed Forms': { bg: 'bg-orange-100', icon: '📋' },
  'General Stationery': { bg: 'bg-blue-100', icon: '✏️' },
  'Medical Supplies': { bg: 'bg-red-100', icon: '🏥' },
  'Office Equipment': { bg: 'bg-purple-100', icon: '🖨️' },
};

export default function ProductCard({ item, cartQty, onAdd, onIncrement, onDecrement }: ProductCardProps) {
  const isLow = item.Current_Stock <= item.Low_Stock_Threshold;
  const isOut = item.Current_Stock <= 0;
  const style = CAT_ICONS[item.Category] || { bg: 'bg-slate-100', icon: '📦' };

  return (
    <div className="product-card">
      <div className={`product-icon ${style.bg}`}>
        {style.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-slate-900 leading-tight">{item.Item_Name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{item.Category}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`badge ${isOut ? 'badge-red' : isLow ? 'badge-amber' : 'badge-green'}`}>
          {isOut ? 'Out of stock' : `${item.Current_Stock} in stock`}
        </span>
        {cartQty > 0 ? (
          <div className="flex items-center gap-2">
            <button onClick={onDecrement}
              className="w-8 h-8 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors text-sm">
              −
            </button>
            <span className="w-5 text-center font-bold text-sm">{cartQty}</span>
            <button onClick={onIncrement}
              disabled={isOut || cartQty >= item.Current_Stock}
              className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-40">
              +
            </button>
          </div>
        ) : (
          <button onClick={onAdd} disabled={isOut}
            className="btn-outline-sm text-xs disabled:opacity-40">
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
