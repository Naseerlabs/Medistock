import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  role: 'department' | 'admin';
}

function House() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function Cart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function Clock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function User() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Box() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function People() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function Chart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function Medical() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function Headphones() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const DEPT_LINKS = [
  { path: '/store', label: 'Dashboard', icon: House },
  { path: '/orders', label: 'My Orders', icon: Cart },
  { path: '/orders', label: 'Request History', icon: Clock },
  { path: '/profile', label: 'Profile', icon: User },
];

const ADMIN_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: House },
  { path: '/admin/orders', label: 'Orders', icon: Cart },
  { path: '/admin/inventory', label: 'Inventory', icon: Box },
  { path: '/admin/categories', label: 'Categories', icon: Clock },
  { path: '/admin/staff', label: 'Users', icon: People },
  { path: '/admin/reports', label: 'Reports', icon: Chart },
  { path: '/admin/stock-movements', label: 'Movements', icon: User },
  { path: '/admin/settings', label: 'Settings', icon: Headphones },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ role }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = role === 'admin' ? ADMIN_LINKS : DEPT_LINKS;

  const handleNav = (path: string) => {
    if (path === '#') return;
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar">
      {/* Top section */}
      <div className="sidebar-logo">
        {role === 'department' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Medical />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 leading-tight">{user?.department_name || 'Department'}</p>
              <p className="text-xs text-slate-500">{user?.name || 'Staff'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
              <img src="/logo.png" alt="MediStock" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">MediStock</p>
              <p className="text-xs text-slate-500">Hospital Supply</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <button
              key={`${link.path}-${link.label}-${i}`}
              onClick={() => handleNav(link.path)}
              className={`sidebar-link w-full text-left ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="icon"><Icon /></span>
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      {role === 'department' ? (
        <div className="sidebar-footer">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <span className="text-slate-400"><Headphones /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">Need Help?</p>
              <p className="text-xs text-slate-400">Contact support</p>
            </div>
            <span className="text-slate-300"><ChevronRight /></span>
          </div>
        </div>
      ) : (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
            <span className="text-slate-400"><ChevronDown /></span>
          </div>
        </div>
      )}
    </div>
  );
}
