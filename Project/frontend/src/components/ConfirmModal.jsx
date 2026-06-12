import React from 'react';

const ConfirmModal = ({ message, onConfirm, onCancel, confirmLabel = 'Delete' }) => (
  <div className="modal-overlay" role="presentation" onClick={onCancel} style={{ zIndex: 9000 }}>
    <div
      className="modal-card"
      style={{ maxWidth: '400px', textAlign: 'center' }}
      role="dialog"
      aria-modal="true"
      onClick={e => e.stopPropagation()}
    >
      <div style={iconWrap}>
        <span style={{ fontSize: '22px' }}>🗑</span>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '19px', fontWeight: 800 }}>Are you sure?</h3>
      <p style={{ margin: '0 0 24px', color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const iconWrap = {
  width: '54px',
  height: '54px',
  borderRadius: '50%',
  background: 'var(--danger-soft)',
  border: '1px solid rgba(251, 113, 133, 0.3)',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 16px',
};

export default ConfirmModal;