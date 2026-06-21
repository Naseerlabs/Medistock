interface NumpadProps {
  onDigit: (d: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', '✓'],
];

export default function Numpad({ onDigit, onClear, onBackspace, disabled }: NumpadProps) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === '⌫') onBackspace();
    else if (key === '✓') onClear();
    else onDigit(key);
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto">
      {KEYS.flat().map(key => (
        <button
          key={key}
          onClick={() => handleKey(key)}
          disabled={disabled}
          className={`h-14 text-lg font-bold rounded-xl transition-all active:scale-95 select-none
            ${key === '⌫'
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : key === '✓'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300'}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
