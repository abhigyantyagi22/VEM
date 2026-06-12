import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/vehicles', label: 'Vehicles', icon: '▣' },
  { to: '/drivers', label: 'Drivers', icon: '✦' },
  { to: '/about', label: 'About', icon: '◎' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userId, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 760);
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && userId) {
        try {
          const res = await api.get(`/notifications/${userId}`);
          setNotifications(res.data);
        } catch {
          setNotifications([]);
        }
      }
    };
    fetchNotifications();
  }, [isAuthenticated, userId]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/vehicles') return location.pathname.startsWith('/vehicles');
    if (path === '/drivers') return location.pathname === '/drivers' || location.pathname.endsWith('/drivers');
    return location.pathname === path;
  };

  if (isAuthRoute) return null;

  return (
    <header style={styles.wrap}>
      <nav style={{ ...styles.bar, ...(isMobile ? styles.barMobile : {}) }} className="anim-up">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} style={styles.brand}>
          <span style={styles.brandMark}>⬡</span>
          {!isMobile && <span style={styles.brandText}>Wheel<span style={styles.brandAccent}>Sync</span></span>}
        </Link>

        {isAuthenticated ? (
          <>
            <div style={styles.links}>
              {NAV_LINKS.map(({ to, label, icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      ...styles.link,
                      ...(isMobile ? styles.linkMobile : {}),
                      ...(active ? styles.linkActive : {}),
                    }}
                  >
                    <span aria-hidden="true" style={styles.linkIcon}>{icon}</span>
                    {!isMobile && label}
                  </Link>
                );
              })}
            </div>

            <div style={styles.actions}>
              {notifications.length > 0 && (
                <span style={styles.badge} title={`${notifications.length} notifications`}>
                  {notifications.length}
                </span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={toggle}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀' : '☾'}
              </button>
              <Link to="/profile" title="Profile">
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  style={isActive('/profile') ? styles.profileActive : undefined}
                >
                  ⊙
                </button>
              </Link>
              <button type="button" className="btn btn-ghost" onClick={handleLogout} style={styles.logout}>
                {isMobile ? '⎋' : 'Logout'}
              </button>
            </div>
          </>
        ) : (
          <div style={styles.actions}>
            <Link to="/about" style={{ ...styles.link, ...(isActive('/about') ? styles.linkActive : {}) }}>About</Link>
            <Link to="/login"><button type="button" className="btn btn-ghost">Login</button></Link>
            <Link to="/register"><button type="button" className="btn btn-primary">Register</button></Link>
          </div>
        )}
      </nav>
    </header>
  );
};

const styles = {
  wrap: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'center',
    padding: '14px 16px 0',
    pointerEvents: 'none',
  },
  bar: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    width: '100%',
    maxWidth: '1180px',
    padding: '10px 16px',
    borderRadius: '20px',
    background: 'var(--glass-strong)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-card), inset 0 1px 0 var(--glass-highlight)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  },
  barMobile: { gap: '10px', padding: '8px 10px' },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  brandMark: {
    fontSize: '24px',
    background: 'var(--accent-grad)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  brandText: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.3px',
    color: 'var(--text-1)',
  },
  brandAccent: {
    background: 'var(--accent-grad)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    textDecoration: 'none',
    color: 'var(--text-2)',
    fontWeight: 650,
    fontSize: '14px',
    padding: '10px 16px',
    borderRadius: '13px',
    border: '1px solid transparent',
    transition: 'color 0.2s ease, background 0.2s ease, border-color 0.2s ease',
  },
  linkMobile: { padding: '10px 12px', fontSize: '16px' },
  linkActive: {
    color: 'var(--text-1)',
    background: 'var(--accent-soft)',
    border: '1px solid var(--glass-border-bright)',
    boxShadow: 'var(--accent-glow)',
  },
  linkIcon: { fontSize: '13px', opacity: 0.9 },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  badge: {
    minWidth: '24px',
    height: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 7px',
    borderRadius: '999px',
    background: 'var(--danger-grad, linear-gradient(135deg, #fb7185, #e11d48))',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800,
    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
  },
  profileActive: {
    borderColor: 'var(--glass-border-bright)',
    boxShadow: 'var(--accent-glow)',
    color: 'var(--accent-1)',
  },
  logout: { fontSize: '13px' },
};

export default Navbar;
