import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const EditVehicleModal = ({ vehicle, onClose, onSaved }) => {
  const [form, setForm] = useState({ vehicleName: '', vehicleNumber: '', vehicleType: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        vehicleName: vehicle.vehicleName || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        vehicleType: vehicle.vehicleType || '',
      });
    }
  }, [vehicle]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle) return;
    setSaving(true);
    try {
      const res = await api.put(`/vehicles/${vehicle.id}`, form);
      onSaved && onSaved(res.data || { ...vehicle, ...form });
      onClose && onClose();
    } catch (err) {
      console.error('Failed to update vehicle', err);
      alert('Failed to update vehicle. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const { theme } = useTheme();

  if (!vehicle) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={{ ...modalStyle, background: theme.bgModal }}>
        <h3 style={{ margin: 0, marginBottom: 8, color: theme.textPrimary }}>Edit Vehicle</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ ...labelStyle, color: theme.textAccent }}>Name</label>
          <input name="vehicleName" value={form.vehicleName} onChange={handleChange} style={{ ...inputStyle, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }} />

          <label style={{ ...labelStyle, color: theme.textAccent }}>Number</label>
          <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} style={{ ...inputStyle, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }} />

          <label style={{ ...labelStyle, color: theme.textAccent }}>Type</label>
          <input name="vehicleType" value={form.vehicleType} onChange={handleChange} style={{ ...inputStyle, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }} />

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={saving}>Cancel</button>
            <button type="submit" style={saveBtnStyle} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,12,15,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1200,
};

const modalStyle = {
  width: 460,
  padding: 18,
  borderRadius: 12,
  background: 'linear-gradient(180deg, #ffffff, #f8fffd)',
  boxShadow: '0 20px 40px rgba(8,15,20,0.25)',
  border: '1px solid rgba(15,118,110,0.06)',
};

const labelStyle = { display: 'block', marginTop: 8, marginBottom: 6, color: '#0f766e', fontWeight: 700 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6f7f2' };
const cancelBtnStyle = { padding: '8px 12px', borderRadius: 10, background: 'transparent', border: '1px solid #d1eae5', cursor: 'pointer' };
const saveBtnStyle = { padding: '8px 12px', borderRadius: 10, background: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' };

export default EditVehicleModal;
