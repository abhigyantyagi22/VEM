import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EditVehicleModal = ({ vehicle, onClose, onSaved }) => {
  const [form, setForm] = useState({ vehicleName: '', vehicleNumber: '', vehicleType: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    try {
      const res = await api.put(`/vehicles/${vehicle.id}`, form);
      onSaved && onSaved(res.data || { ...vehicle, ...form });
      onClose && onClose();
    } catch (err) {
      console.error('Failed to update vehicle', err);
      setError('Failed to update vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!vehicle) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '460px' }} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">Edit Vehicle</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" name="vehicleName" value={form.vehicleName} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label">Number</label>
            <input className="input" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label">Type</label>
            <input className="input" name="vehicleType" value={form.vehicleType} onChange={handleChange} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;