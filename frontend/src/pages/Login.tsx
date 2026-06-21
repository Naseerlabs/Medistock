import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'department' | 'admin'>('department');
  const [staffId, setStaffId] = useState(['', '', '']);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({ staffId: false, password: false });

  const staffIdError = submitted && staffId.join('').length !== 3;
  const passwordError = submitted && !password;

  const handleIdDigit = (idx: number, val: string) => {
    if (val.length <= 1 && /^\d*$/.test(val)) {
      const next = [...staffId];
      next[idx] = val;
      setStaffId(next);
      if (val && idx < 2) {
        const nextInput = document.getElementById(`staff-${idx + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !staffId[idx] && idx > 0) {
      const prev = document.getElementById(`staff-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const id = staffId.join('');
    if (id.length !== 3) { setError('Enter your 3-digit Staff ID'); return; }
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    setError('');
    try {
      await login(id, password, role);
      navigate(role === 'admin' ? '/admin/dashboard' : '/store');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen login-gradient login-pattern flex items-center justify-center p-4">
      <div className="login-card p-8 sm:p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30 mb-4">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">MediStock</h1>
          <p className="text-sm text-slate-500 mt-1">Hospital Inventory Management</p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1 mb-6">
          <button onClick={() => setRole('department')}
            className={`login-tab ${role === 'department' ? 'active' : 'inactive'}`}>
            👥 Department
          </button>
          <button onClick={() => setRole('admin')}
            className={`login-tab ${role === 'admin' ? 'active' : 'inactive'}`}>
            ⚙️ Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Staff ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Staff ID</label>
            <div className="flex justify-center gap-3">
              {[0, 1, 2].map(i => (
                <input
                  key={i} id={`staff-${i}`}
                  type="text" inputMode="numeric" maxLength={1}
                  value={staffId[i]}
                  onChange={e => handleIdDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onBlur={() => setTouched(prev => ({ ...prev, staffId: true }))}
                  className={`input-staff text-center ${staffIdError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  autoComplete="off"
                />
              ))}
            </div>
            {staffIdError && <p className="text-xs text-red-500 mt-1.5 text-center">Enter all 3 digits</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                className={`input pr-10 ${passwordError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="Enter password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {passwordError && <p className="text-xs text-red-500 mt-1.5">Password is required</p>}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3.5 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Having trouble? <span className="text-blue-600 font-medium cursor-pointer hover:underline">Contact support</span>
        </p>
      </div>

      <p className="absolute bottom-4 text-xs text-white/50">© 2026 MediStock. All rights reserved.</p>
    </div>
  );
}
