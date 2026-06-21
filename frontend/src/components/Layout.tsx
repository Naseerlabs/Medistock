import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export default function Layout({ children, title, subtitle, headerRight }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.is_admin ? 'admin' : 'department';
  const [dark, setDark] = useState(() => localStorage.getItem('medistock-dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('medistock-dark', String(dark));
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar role={role} />
      <div className="ml-[260px] min-h-screen flex flex-col overflow-x-hidden">
        <div className="page-content">
          {(title || subtitle || headerRight) && (
            <div className="flex items-center justify-between mb-6">
              <div>
                {title && <h1 className="text-xl font-bold text-slate-900">{title}</h1>}
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                {headerRight}
                <button onClick={() => setDark(!dark)} className="dark-toggle" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {dark ? '☀️' : '🌙'}
                </button>
                <button onClick={handleLogout}
                  className="btn-icon text-slate-400 hover:text-red-500" title="Logout" aria-label="Logout">
                  🚪
                </button>
              </div>
            </div>
          )}
          <div className="page-enter">{children}</div>
        </div>
      </div>
    </div>
  );
}
