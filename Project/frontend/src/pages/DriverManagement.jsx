import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import ConfirmModal from '../components/ConfirmModal';

const DriverManagement = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const [confirm, setConfirm] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState({ driverName: '', licenseNumber: '', contact: '', vehicleId: '' });
  const [addingDriver, setAddingDriver] = useState(false);
  const [driverError, setDriverError] = useState('');
  const [selectedUnassignedDriver, setSelectedUnassignedDriver] = useState('');
  const [assignMessage, setAssignMessage] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        if (!userId) return;
        const res = await api.get(`/vehicles?userId=${userId}`);
        setVehicles(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchVehicles();
  }, [userId]);

  const fetchAllDrivers = async () => {
    try {
      try {
        const res = await api.get('/drivers');
        const vehicleById = new Map((vehicles || []).map(v => [String(v.id), v]));
        const list = (res.data || []).map(d => ({
          ...d,
          vehicleId: d.vehicleId || '',
          vehicleName: d.vehicleId ? (vehicleById.get(String(d.vehicleId))?.vehicleName || '') : '',
          vehicleNumber: d.vehicleId ? (vehicleById.get(String(d.vehicleId))?.vehicleNumber || '') : '',
        }));
        setAllDrivers(list);
        return;
      } catch {
        // fall back to per-vehicle fetch
      }

      const allDriversList = [];
      for (const vehicle of vehicles) {
        try {
          const res = await api.get(`/drivers/${vehicle.id}`);
          res.data.forEach(driver => {
            allDriversList.push({ ...driver, vehicleId: vehicle.id, vehicleName: vehicle.vehicleName, vehicleNumber: vehicle.vehicleNumber });
          });
        } catch (e) {
          console.error(e);
        }
      }
      setAllDrivers(allDriversList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (vehicles.length > 0) {
      fetchAllDrivers();
    }
  }, [vehicles]);

  const resetForm = () => {
    setForm({ driverName: '', licenseNumber: '', contact: '', vehicleId: '' });
    setDriverError('');
    setEditingDriver(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const isValidContact = (contact) => /^\d{10}$/.test(contact);

  const isDuplicateLicense = (licenseNumber, excludeId = null) =>
    allDrivers.some(d => d.licenseNumber === licenseNumber && d.id !== excludeId);

  const vehicleAlreadyHasDriver = (vehicleId, excludeDriverId = null) => {
    if (!vehicleId) return false;
    return allDrivers.some(d => d.vehicleId === parseInt(vehicleId) && d.id !== excludeDriverId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddingDriver(true);
    setDriverError('');

    if (!isValidContact(form.contact)) {
      setDriverError('Contact must be exactly 10 digits');
      setAddingDriver(false);
      return;
    }
    if (isDuplicateLicense(form.licenseNumber, editingDriver)) {
      setDriverError('A driver with this license number already exists');
      setAddingDriver(false);
      return;
    }
    if (!editingDriver || (editingDriver && allDrivers.find(d => d.id === editingDriver)?.vehicleId !== parseInt(form.vehicleId))) {
      if (vehicleAlreadyHasDriver(form.vehicleId, editingDriver)) {
        setDriverError('This vehicle already has a driver assigned. Each vehicle can only have one driver.');
        setAddingDriver(false);
        return;
      }
    }

    try {
      const payload = { driverName: form.driverName, licenseNumber: form.licenseNumber, contact: form.contact };
      if (form.vehicleId) payload.vehicleId = Number(form.vehicleId);

      if (editingDriver) {
        await api.put(`/drivers/${editingDriver}`, payload);
      } else {
        await api.post('/drivers', payload);
      }
      fetchAllDrivers();
      closeModal();
    } catch (e) {
      console.error(e);
      const message = e.response?.data || e.message || 'Please check the details and try again.';
      setDriverError(`${editingDriver ? 'Could not update' : 'Could not add'} driver. ${message}`);
    } finally {
      setAddingDriver(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver.id);
    setForm({
      driverName: driver.driverName,
      licenseNumber: driver.licenseNumber,
      contact: driver.contact,
      vehicleId: driver.vehicleId,
    });
    setShowModal(true);
  };

  const handleDelete = (driverId) => {
    setConfirm({
      message: 'This driver will be permanently deleted.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/drivers/${driverId}`);
          fetchAllDrivers();
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const assignUnassignedToVehicle = async () => {
    if (!id || !selectedUnassignedDriver) return;
    try {
      const selectedDriver = allDrivers.find(d => String(d.id) === String(selectedUnassignedDriver));
      if (!selectedDriver) {
        setAssignMessage({ type: 'error', text: 'Selected driver not found.' });
        return;
      }
      await api.put(`/drivers/${selectedUnassignedDriver}/assign`, { vehicleId: Number(id) });
      fetchAllDrivers();
      setSelectedUnassignedDriver('');
      setAssignMessage({ type: 'success', text: 'Driver assigned to this vehicle.' });
    } catch (e) {
      console.error(e);
      const message = e.response?.data || e.message || 'Could not assign driver';
      setAssignMessage({ type: 'error', text: String(message) });
    }
  };

  const renderModal = () => (
    <div className="modal-overlay" role="presentation" onClick={closeModal}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-driver-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="add-driver-title" className="modal-title">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
          <button type="button" onClick={closeModal} className="modal-close" aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div className="field">
            <label className="field-label">Driver Name</label>
            <input
              className="input"
              type="text"
              value={form.driverName}
              onChange={e => setForm({ ...form, driverName: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="field">
            <label className="field-label">License Number</label>
            <input
              className="input"
              type="text"
              value={form.licenseNumber}
              onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
              placeholder="DL0123456789"
              required
              style={isDuplicateLicense(form.licenseNumber, editingDriver) ? styles.inputError : undefined}
            />
            {isDuplicateLicense(form.licenseNumber, editingDriver) && (
              <small style={styles.fieldError}>⚠ This license number is already in use</small>
            )}
          </div>
          <div className="field">
            <label className="field-label">Contact (10 digits)</label>
            <input
              className="input"
              type="tel"
              value={form.contact}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, contact: value });
              }}
              placeholder="9876543210"
              maxLength="10"
              required
              style={form.contact && !isValidContact(form.contact) ? styles.inputError : undefined}
            />
            {form.contact && !isValidContact(form.contact) && (
              <small style={styles.fieldError}>⚠ Please enter exactly 10 digits</small>
            )}
          </div>
          <div className="field">
            <label className="field-label">Vehicle</label>
            <select
              className="input"
              value={form.vehicleId}
              onChange={e => setForm({ ...form, vehicleId: e.target.value })}
              style={vehicleAlreadyHasDriver(form.vehicleId, editingDriver) ? styles.inputError : undefined}
            >
              <option value="">No Vehicle</option>
              {vehicles.map(v => {
                const hasDriver = allDrivers.some(d => d.vehicleId === v.id);
                return (
                  <option key={v.id} value={v.id}>
                    {v.vehicleName} — {v.vehicleNumber} {hasDriver ? '(Driver assigned)' : ''}
                  </option>
                );
              })}
            </select>
            {vehicleAlreadyHasDriver(form.vehicleId, editingDriver) && !editingDriver && (
              <small style={styles.fieldError}>⚠ This vehicle already has a driver assigned</small>
            )}
          </div>
          {driverError && <div className="alert alert-error">{driverError}</div>}
          <div style={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addingDriver}>
              {addingDriver ? 'Saving...' : editingDriver ? 'Update Driver' : '+ Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const scopedDrivers = id
    ? allDrivers.filter((driver) => String(driver.vehicleId) === String(id))
    : allDrivers;

  const isStandalone = !id;

  return (
    <div className={isStandalone ? 'page-shell' : undefined} style={styles.container}>
      <div className="row-between">
        {isStandalone ? (
          <div className="anim-up">
            <p className="eyebrow">Team</p>
            <h1 className="page-title">Drivers</h1>
          </div>
        ) : (
          <p style={styles.subtitle}>Driver assigned to this vehicle.</p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setEditingDriver(null); resetForm(); setShowModal(true); }}
        >
          {id ? 'Assign / Change Driver' : '+ Add Driver'}
        </button>
      </div>

      {scopedDrivers.length === 0 ? (
        <div className="empty-state">
          <span className="icon">✦</span>
          {id
            ? 'No driver assigned yet. Click "Assign / Change Driver" to continue.'
            : 'No drivers added yet. Click "Add Driver" to get started.'}
        </div>
      ) : (
        <div style={styles.grid}>
          {scopedDrivers.map((d, i) => (
            <div key={d.id} className={`glass-card hoverable anim-up d${Math.min(i + 1, 5)}`} style={styles.driverCard}>
              <div style={styles.driverTop}>
                <span style={styles.avatar} aria-hidden="true">{(d.driverName || '?').charAt(0).toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={styles.driverName}>{d.driverName}</h3>
                  <p style={styles.driverMeta}>{d.contact}</p>
                </div>
              </div>
              <div style={styles.chipRow}>
                <span className="chip">🪪 {d.licenseNumber}</span>
                {d.vehicleId
                  ? <span className="chip chip-success">⬡ {d.vehicleName || 'Unknown'} · {d.vehicleNumber || 'N/A'}</span>
                  : <span className="chip chip-warn">Unassigned</span>}
              </div>
              <div style={styles.actions}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(d)}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {id && (
        <div className="glass-inset" style={styles.assignBox}>
          <p style={styles.assignTitle}>Assign an existing unassigned driver</p>
          <div style={styles.assignRow}>
            <select
              className="input"
              style={{ flex: 1, minWidth: '220px' }}
              value={selectedUnassignedDriver}
              onChange={(e) => setSelectedUnassignedDriver(e.target.value)}
            >
              <option value="">Select an unassigned driver</option>
              {allDrivers.filter(d => !d.vehicleId).map(d => (
                <option key={d.id} value={d.id}>{d.driverName} — {d.licenseNumber}</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={assignUnassignedToVehicle}>
              Assign to this vehicle
            </button>
          </div>
          {assignMessage && (
            <div className={`alert ${assignMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {assignMessage.text}
            </div>
          )}
        </div>
      )}

      {showModal && renderModal()}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

const styles = {
  container: { display: 'grid', gap: '20px' },
  subtitle: { margin: 0, color: 'var(--text-2)', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' },
  driverCard: { display: 'grid', gap: '14px', alignContent: 'start', padding: '20px' },
  driverTop: { display: 'flex', alignItems: 'center', gap: '13px' },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '20px',
    fontWeight: 800,
    color: '#06121f',
    background: 'var(--accent-grad)',
    flexShrink: 0,
  },
  driverName: { margin: 0, fontSize: '17px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  driverMeta: { margin: '2px 0 0', color: 'var(--text-2)', fontSize: '13px', fontWeight: 600 },
  chipRow: { display: 'flex', gap: '7px', flexWrap: 'wrap' },
  actions: { display: 'flex', gap: '8px' },
  assignBox: { display: 'grid', gap: '12px', padding: '18px' },
  assignTitle: { margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--text-1)' },
  assignRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  inputError: { borderColor: 'var(--danger)' },
  fieldError: { color: 'var(--danger)', fontWeight: 600, fontSize: '12px' },
  modalForm: { display: 'grid', gap: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
};

export default DriverManagement;