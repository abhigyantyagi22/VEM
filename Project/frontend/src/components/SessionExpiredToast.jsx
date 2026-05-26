import React from 'react';

const toastWrapper = {
  position: 'fixed',
  top: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  pointerEvents: 'none',
};

const toastBox = {
  background: 'rgba(17,24,39,0.95)',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 10,
  boxShadow: '0 6px 18px rgba(2,6,23,0.4)',
  fontWeight: 600,
  pointerEvents: 'auto',
};

const SessionExpiredToast = ({ message = 'Session expired — please log in' }) => {
  return (
    <div style={toastWrapper}>
      <div style={toastBox} role="alert" aria-live="assertive">
        {message}
      </div>
    </div>
  );
};

export default SessionExpiredToast;
