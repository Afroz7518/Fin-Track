import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdReceiptLong, MdBarChart,
  MdLogout, MdClose, MdLightMode, MdDarkMode,
} from 'react-icons/md';

const NAV_ITEMS = [
  { icon: <MdDashboard />, label: 'Dashboard', path: '/' },
  { icon: <MdReceiptLong />, label: 'Transactions', path: '/transactions' },
  { icon: <MdBarChart />, label: 'Reports', path: '/reports' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [open]);

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        {/* Logo row */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💰</div>
          <div className="sidebar-logo-text">
            <h2>FinTrack</h2>
            <p>Expense Tracker</p>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p style={{
            fontSize: '0.68rem', fontWeight: 700,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 8px 8px', marginTop: '8px',
          }}>
            Main Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="sidebar-theme-toggle">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle-btn"
          >
            <span className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
              <MdDarkMode />
            </span>
            <span className="theme-toggle-track">
              <span className={`theme-toggle-thumb ${theme === 'light' ? 'light' : ''}`} />
            </span>
            <span className={`theme-toggle-icon ${theme === 'light' ? 'active' : ''}`}>
              <MdLightMode />
            </span>
          </button>
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <h4>{user?.name}</h4>
            <p>{user?.email}</p>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Logout"
            style={{ flexShrink: 0 }}
          >
            <MdLogout />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

