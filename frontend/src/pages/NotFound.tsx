import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const home = user?.is_admin ? '/admin/dashboard' : '/store';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-600/30 mx-auto mb-6">
          M
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 mb-2">404</h1>
        <p className="text-lg text-slate-500 mb-6">This page doesn't exist</p>
        <button onClick={() => navigate(home)} className="btn-primary">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
