import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';

const NavLinkItem = ({ to, label, icon, isMobile, active, baseStyles, mobileStyles, activePillStyles }) => {
  return (
    <Link
      to={to}
      style={{
        ...baseStyles,
        ...(isMobile ? mobileStyles : {}),
        color: active ? '#ecfeff' : 'rgba(240, 253, 250, 0.78)',
      }}
    >
      {active && <div style={activePillStyles} />}
      <span style={{ ...styles.icon, ...(isMobile ? styles.iconMobile : {}) }} aria-hidden="true">{icon}</span>
      <span style={{ position: 'relative', zIndex: 2 }}>{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userId, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
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
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/drivers') {
      return location.pathname === '/drivers' || location.pathname.endsWith('/drivers');
    }
    if (path === '/vehicles') {
      return location.pathname === '/vehicles' || location.pathname.startsWith('/vehicles/');
    }
    return location.pathname === path;
  };

  return (
    <>
      <div style={styles.brandChip}>
        <span style={styles.brandDot} aria-hidden="true">◉</span>
        <div>
          <p style={styles.brandLabel}>Smart</p>
          <h2 style={styles.brandTitle}>Tracker</h2>
        </div>
      </div>

      {!isAuthRoute && (
        <div style={styles.navContainer}>
          <nav style={{ ...styles.nav, ...(isMobile ? styles.navMobile : {}) }}>
          {isAuthenticated ? (
            <>
              <div style={styles.linkGroup}>
                <NavLinkItem
                  to="/dashboard"
                  label={isMobile ? 'Home' : 'Dashboard'}
                  icon="⌂"
                  isMobile={isMobile}
                  active={isActive('/dashboard')}
                  baseStyles={styles.navLink}
                  mobileStyles={styles.navLinkMobile}
                  activePillStyles={styles.activePill}
                />
                <NavLinkItem
                  to="/vehicles"
                  label={isMobile ? 'Vehicles' : 'My Vehicles'}
                  icon="▣"
                  isMobile={isMobile}
                  active={isActive('/vehicles')}
                  baseStyles={styles.navLink}
                  mobileStyles={styles.navLinkMobile}
                  activePillStyles={styles.activePill}
                />
                <NavLinkItem
                  to="/drivers"
                  label="Drivers"
                  icon="👤"
                  isMobile={isMobile}
                  active={isActive('/drivers')}
                  baseStyles={styles.navLink}
                  mobileStyles={styles.navLinkMobile}
                  activePillStyles={styles.activePill}
                />
                <NavLinkItem
                  to="/profile"
                  label={isMobile ? 'Me' : 'Profile'}
                  icon="⊙"
                  isMobile={isMobile}
                  active={isActive('/profile')}
                  baseStyles={styles.navLink}
                  mobileStyles={styles.navLinkMobile}
                  activePillStyles={styles.activePill}
                />
              </div>

              <button
                type="button"
                onClick={toggle}
                style={{ ...styles.logoutBtn, ...(isMobile ? styles.logoutBtnMobile : {}), fontSize: isMobile ? '14px' : '15px' }}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀' : '🌙'}
              </button>
              <button onClick={handleLogout} style={{ ...styles.logoutBtn, ...(isMobile ? styles.logoutBtnMobile : {}) }}>
                {isMobile ? '⎋' : 'Logout'}
              </button>

              {notifications.length > 0 && (
                <div style={styles.alertBadge} aria-label="Notifications">
                  <span style={{ position: 'relative', top: '-1px' }}>●</span> {notifications.length}
                </div>
              )}
            </>
          ) : (
            <div style={styles.linkGroup}>
              <NavLinkItem
                to="/login"
                label="Login"
                icon="↦"
                isMobile={isMobile}
                active={isActive('/login')}
                baseStyles={styles.navLink}
                mobileStyles={styles.navLinkMobile}
                activePillStyles={styles.activePill}
              />
              <Link to="/register" style={{ ...styles.navLink, ...styles.registerBtn }}>
                Register
              </Link>
            </div>
          )}
          </nav>
        </div>
      )}
    </>
  );
};

const styles = {
  brandChip: {
    position: 'fixed',
    top: '14px',
    left: '14px',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px 9px',
    borderRadius: '16px',
    background: 'linear-gradient(125deg, rgba(15, 23, 42, 0.86), rgba(15, 118, 110, 0.82))',
    border: '1px solid rgba(153, 246, 228, 0.36)',
    boxShadow: '0 14px 24px rgba(15, 23, 42, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  brandDot: {
    color: '#5eead4',
    fontSize: '13px',
    lineHeight: 1,
  },
  brandLabel: {
    margin: 0,
    color: 'rgba(224, 242, 254, 0.84)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    lineHeight: 1,
  },
  navContainer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: '12px',
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    pointerEvents: 'none',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(130deg, rgba(15, 23, 42, 0.72), rgba(15, 118, 110, 0.4))',
    backdropFilter: 'blur(18px) saturate(170%)',
    WebkitBackdropFilter: 'blur(18px) saturate(170%)',
    padding: '8px 10px',
    borderRadius: '999px',
    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(153, 246, 228, 0.25)',
    width: 'fit-content',
    minWidth: 'min(560px, calc(100vw - 28px))',
    position: 'relative',
    pointerEvents: 'auto',
  },
  brandTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '800',
    color: '#f0fdfa',
    letterSpacing: '0.2px',
    lineHeight: 1.1,
  },
  linkGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
  },
  navLink: {
    textDecoration: 'none',
    fontWeight: '650',
    fontSize: '14px',
    padding: '10px 14px',
    borderRadius: '999px',
    transition: 'color 0.2s ease',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    minWidth: '108px',
    letterSpacing: '0.2px',
  },
  navLinkMobile: {
    minWidth: 'unset',
    padding: '9px 11px',
    fontSize: '12px',
    gap: '6px',
  },
  icon: {
    position: 'relative',
    zIndex: 2,
    fontSize: '14px',
    opacity: 1,
    fontWeight: '600',
  },
  iconMobile: {
    fontSize: '11px',
  },
  activePill: {
    inset: '0',
    position: 'absolute',
    background: 'linear-gradient(130deg, rgba(20, 184, 166, 0.84), rgba(13, 148, 136, 0.72))',
    border: '1px solid rgba(153, 246, 228, 0.5)',
    backdropFilter: 'blur(14px) saturate(130%)',
    WebkitBackdropFilter: 'blur(14px) saturate(130%)',
    borderRadius: '999px',
    boxShadow: 'inset 0 1px 0 rgba(224, 242, 254, 0.56), 0 8px 20px rgba(13, 148, 136, 0.4)',
    zIndex: 1,
  },
  alertBadge: {
    position: 'absolute',
    top: '-10px',
    right: '10px',
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 5px 14px rgba(239, 68, 68, 0.35)',
  },
  registerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    zIndex: 2,
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    color: '#ccfbf1',
    border: '1px solid rgba(153, 246, 228, 0.22)',
    padding: '10px 16px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  logoutBtnMobile: {
    padding: '9px 11px',
    minWidth: '46px',
    fontSize: '12px',
  },
  navMobile: {
    minWidth: 'calc(100vw - 22px)',
    padding: '7px 8px',
    gap: '8px',
  },
};

export default Navbar;
