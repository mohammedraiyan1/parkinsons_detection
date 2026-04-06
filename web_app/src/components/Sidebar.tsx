import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/tests', icon: '◈', label: 'Assessments' },
  { to: '/report', icon: '◉', label: 'Report' },
  { to: '/history', icon: '◷', label: 'History' },
  { to: '/profile', icon: '◎', label: 'Profile' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const name = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="nav-logo">
        <div className="nav-logo-icon">🧠</div>
        <span className="nav-logo-text">NeuroCheck</span>
      </div>

      <span className="nav-section-label">Navigation</span>
      <nav>
        {NAV.map(({ to, icon, label }) => (
          <Link key={to} to={to} className={`nav-item ${pathname === to ? 'active' : ''}`}>
            <span className="nav-item-icon" style={{ fontFamily: 'monospace' }}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="nav-user">
        <div className="nav-user-info">
          <div className="nav-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="nav-user-name">{name}</div>
            <div className="nav-user-email">{user?.email}</div>
          </div>
        </div>
        <button className="nav-signout" onClick={async () => { await signOut(); navigate('/'); }}>
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  );
}
