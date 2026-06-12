import React from 'react';

const toastWrapper = {
  position: 'fixed',
  top: 92,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  pointerEvents: 'none',
};

const toastBox = {
  background: 'var(--glass-strong)',
  color: 'var(--text-1)',
  padding: '13px 20px',
  borderRadius: 14,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-pop)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  fontWeight: 700,
  fontSize: '14px',
  pointerEvents: 'auto',
  animation: 'slide-down 0.3s ease both',
};

const SessionExpiredToast = ({ message = 'Session expired — please log in' }) => (
  <div style={toastWrapper}>
    <div style={toastBox} role="alert" aria-live="assertive">
      ⏳ {message}
    </div>
  </div>
);

export default SessionExpiredToast;