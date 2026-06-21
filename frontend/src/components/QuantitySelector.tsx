interface QuantitySelectorProps {
  quantity: number;
  stock: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}

export default function QuantitySelector({
  quantity, stock, onIncrease, onDecrease, min = 1,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold
          active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-none"
      >
        −
      </button>
      <span className="w-8 text-center text-lg font-bold text-slate-800">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= stock}
        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold
          active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-none"
      >
        +
      </button>
    </div>
  );
}
