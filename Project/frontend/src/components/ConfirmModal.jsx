import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmModal = ({ message, onConfirm, onCancel, confirmLabel = 'Delete' }) => {
  const { theme } = useTheme();

  return (
    <div style={overlay} role="presentation" onClick={onCancel}>
      <div
        style={{ ...modal, background: theme.bgModal, border: `1px solid ${theme.border}` }}
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <div style={iconWrap}>
          <span style={iconStyle}>🗑</span>
        </div>
        <h3 style={{ margin: '0 0 8px', color: theme.textPrimary, fontSize: '18px', fontWeight: 800, textAlign: 'center' }}>
          Are you sure?
        </h3>
        <p style={{ margin: '0 0 24px', color: theme.textSecondary, fontSize: '14px', lineHeight: 1.6, textAlign: 'center' }}>
          {message}
        </p>
        <div style={actions}>
          <button type="button" onClick={onCancel} style={{ ...cancelBtn, background: theme.bgSecondaryBtn, color: theme.textSecondary, border: `1px solid ${theme.borderSubtle}` }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={deleteBtn}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.5)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 9000,
};
const modal = {
  width: '100%',
  maxWidth: '400px',
  borderRadius: '20px',
  padding: '28px 24px 24px',
  boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
};
const iconWrap = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};
const iconStyle = { fontSize: '22px' };
const actions = { display: 'flex', gap: '10px' };
const cancelBtn = {
  flex: 1,
  padding: '11px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '14px',
};
const deleteBtn = {
  flex: 1,
  padding: '11px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #fb7185, #e11d48)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(225,29,72,0.35)',
};

export default ConfirmModal;
