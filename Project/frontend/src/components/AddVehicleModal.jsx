import React, { useState } from 'react';
import api from '../services/api';

const VEHICLE_TYPES = ['Car', 'Bike', 'Truck', 'Van', 'Other'];

const EMPTY = { vehicleName: '', vehicleNumber: '', vehicleType: '', purchaseDate: '' };

const AddVehicleModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/vehicles', form);
      onAdded?.(res.data);
      onClose?.();
    } catch (err) {
      console.error(err);
      const message = err.response?.data || err.message || 'Please check the details and try again.';
      setError(`Could not add vehicle. ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="add-vehicle-title" className="modal-title">Add Vehicle</h2>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div className="field">
            <label className="field-label">Vehicle Name</label>
            <input
              className="input"
              type="text"
              value={form.vehicleName}
              onChange={e => setForm({ ...form, vehicleName: e.target.value })}
              placeholder="Honda City"
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Vehicle Number</label>
            <input
              className="input"
              type="text"
              value={form.vehicleNumber}
              onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
              placeholder="MH 12 AB 1234"
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Vehicle Type</label>
            <select
              className="input"
              value={form.vehicleType}
              onChange={e => setForm({ ...form, vehicleType: e.target.value })}
              required
            >
              <option value="">Select type</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Purchase Date</label>
            <input
              className="input"
              type="date"
              value={form.purchaseDate}
              onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding...' : '+ Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;