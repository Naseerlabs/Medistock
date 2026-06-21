import { useToast } from '../hooks/useToast';

const ICONS: Record<string, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const BG: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
  warning: 'bg-amber-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" role="alert" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 ${BG[toast.type]} text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-black/10 min-w-[300px] max-w-[420px]`}
          style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span className="text-lg shrink-0">{ICONS[toast.type]}</span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white shrink-0 text-lg leading-none">&times;</button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
