import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';

export default function AdminSettings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!password) { showToast('Enter a new password', 'warning'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    showToast('Password updated (demo)', 'success');
    setPassword('');
    setSaving(false);
  };

  return (
    <Layout title="Settings" subtitle="Application configuration">
      <div className="max-w-2xl space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Password</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password</label>
              <input type="text" className="input" placeholder="Enter new password"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={handleChangePassword} disabled={saving}
              className="btn-primary py-2.5">{saving ? '...' : 'Update'}</button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">System Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Version</span><span className="font-semibold">1.0.0</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Database</span><span className="font-semibold">Supabase (PostgreSQL)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Environment</span><span className="font-semibold">Development</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Logged in as</span><span className="font-semibold">{user?.name}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
