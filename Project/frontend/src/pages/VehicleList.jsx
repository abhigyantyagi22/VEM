import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';

const VehicleList = () => {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicleName: '', vehicleNumber: '', vehicleType: '', purchaseDate: '' });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    if (!userId) {
      console.log('[VehicleList] Skipping fetch: userId not available');
      return;
    }
    try {
      const res = await api.get(`/vehicles?userId=${userId}`);
      const vehiclesData = res.data || [];

      // Try fetching all drivers to map assigned drivers to vehicles (backend may support /drivers)
      try {
        const driversRes = await api.get('/drivers');
        const drivers = driversRes.data || [];
        const driverMap = {};
        drivers.forEach(d => {
          if (d.vehicleId) driverMap[d.vehicleId] = d;
        });
        const enriched = vehiclesData.map(v => ({
          ...v,
          assignedDriverName: driverMap[v.id]?.driverName || ''
        }));
        setVehicles(enriched);
      } catch (e) {
        // Fallback: fetch per-vehicle drivers (older API shape)
        const enriched = await Promise.all(vehiclesData.map(async (v) => {
          try {
            const drv = await api.get(`/drivers/${v.id}`);
            const driver = Array.isArray(drv.data) && drv.data.length > 0 ? drv.data[0] : null;
            return { ...v, assignedDriverName: driver ? driver.driverName : '' };
          } catch (err) {
            return { ...v, assignedDriverName: '' };
          }
        }));
        setVehicles(enriched);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const resetForm = () => {
    setForm({ vehicleName: '', vehicleNumber: '', vehicleType: '', purchaseDate: '' });
    setVehicleError('');
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddingVehicle(true);
    setVehicleError('');
    try {
      await api.post('/vehicles', { ...form, userId });
      fetchVehicles();
      closeModal();
    } catch (e) {
      console.error('Error adding vehicle', e);
      const message = e.response?.data || e.message || 'Please check the details and try again.';
      setVehicleError(`Could not add vehicle. ${message}`);
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete vehicle?')) {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    }
  };

  const renderModal = () => (
    <div style={styles.modalOverlay} role="presentation" onClick={closeModal}>
      <div style={{ ...styles.modal, background: theme.bgModal }} role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title" onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 id="add-vehicle-title" style={{ ...styles.modalTitle, color: theme.textPrimary }}>Add Vehicle</h2>
          <button type="button" onClick={closeModal} style={styles.closeButton} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleAdd} style={styles.modalForm}>
          <label style={styles.fieldLabel}>
            Vehicle Name
            <input
              type="text"
              value={form.vehicleName}
              onChange={e => setForm({ ...form, vehicleName: e.target.value })}
              placeholder="Honda City"
              required
              style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
            />
          </label>
          <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
            Vehicle Number
            <input
              type="text"
              value={form.vehicleNumber}
              onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
              placeholder="MH 12 AB 1234"
              required
              style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
            />
          </label>
          <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
            Vehicle Type
            <select
              value={form.vehicleType}
              onChange={e => setForm({ ...form, vehicleType: e.target.value })}
              required
              style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
            >
              <option value="">Select type</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
            Purchase Date
            <input
              type="date"
              value={form.purchaseDate}
              onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
              required
              style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
            />
          </label>
          {vehicleError && <p style={styles.errorText}>{vehicleError}</p>}
          <div style={styles.modalActions}>
            <button type="button" onClick={closeModal} style={styles.secondaryButton}>Cancel</button>
            <button type="submit" disabled={addingVehicle} style={styles.primaryButton}>
              {addingVehicle ? 'Adding...' : '+ Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Vehicles</h2>
        <button 
          type="button" 
          onClick={() => setShowModal(true)} 
          style={styles.addButton}
        >
          + Add Vehicle
        </button>
      </div>

      <ul style={styles.vehicleList}>
        {vehicles.map(v => (
          <li key={v.id} style={{ ...styles.vehicleItem, background: theme.bgItem, border: `1px solid ${theme.border}` }}>
            <div style={styles.vehicleInfo}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <button type="button" style={styles.vehicleNameLink} onClick={() => navigate(`/vehicles/${v.id}/manage`)}>
                  {v.vehicleName}
                </button>
                <span style={styles.driverAssigned}>{v.assignedDriverName ? `Driver: ${v.assignedDriverName}` : ''}</span>
              </div>
              <span style={styles.vehicleMeta}>{v.vehicleNumber} · {v.vehicleType}</span>
            </div>
            <div style={styles.actionGroup}>
              <button onClick={() => navigate(`/vehicles/${v.id}/manage`)} style={styles.actionButton}>Open Workspace</button>
              <button onClick={() => handleDelete(v.id)} style={styles.deleteButton}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {vehicles.length === 0 && (
        <div style={styles.emptyState}>
          <p>No vehicles added yet. Click "Add Vehicle" to get started!</p>
        </div>
      )}

      {showModal && renderModal()}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px 40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(130deg, #0f172a, #0f766e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
  },
  vehicleList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  vehicleItem: {
    border: '1px solid rgba(153, 246, 228, 0.4)',
    padding: '16px 18px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(236,253,250,0.72))',
    boxShadow: '0 14px 28px rgba(15, 23, 42, 0.1)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    flexWrap: 'wrap',
    gap: '12px',
  },
  vehicleInfo: {
    display: 'grid',
    gap: '4px',
  },
  vehicleName: {
    fontSize: '22px',
    color: '#0f172a',
    letterSpacing: '0.1px',
  },
  vehicleNameLink: {
    fontSize: '28px',
    color: '#0f172a',
    letterSpacing: '0.1px',
    fontWeight: 800,
    border: 'none',
    background: 'transparent',
    padding: 0,
    textAlign: 'left',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(15, 118, 110, 0.35)',
    textUnderlineOffset: '4px',
  },
  vehicleMeta: {
    color: '#0f766e',
    fontSize: '14px',
    fontWeight: '700',
  },
  driverAssigned: {
    color: '#475569',
    fontSize: '14px',
    fontWeight: '700',
    background: 'rgba(15,118,110,0.06)',
    padding: '6px 10px',
    borderRadius: '999px',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    border: '1px solid rgba(45, 212, 191, 0.65)',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.28)',
  },
  deleteButton: {
    padding: '8px 14px',
    color: 'white',
    background: 'linear-gradient(135deg, #fb7185, #e11d48)',
    border: '1px solid rgba(244, 63, 94, 0.45)',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#0f766e',
    background: 'linear-gradient(130deg, rgba(236,253,250,0.8), rgba(240,249,255,0.84))',
    borderRadius: '16px',
    border: '2px dashed rgba(45, 212, 191, 0.45)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.36)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 2000,
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    background: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '22px',
    border: '1px solid rgba(255, 255, 255, 0.78)',
    boxShadow: '0 30px 70px rgba(15, 23, 42, 0.22)',
    padding: '28px',
    textAlign: 'left',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#1f2937',
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: 1,
  },
  modalForm: {
    display: 'grid',
    gap: '16px',
  },
  fieldLabel: {
    display: 'grid',
    gap: '8px',
    color: '#475569',
    fontWeight: '700',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '12px',
    border: '1px solid #dbe3ee',
    background: '#f8fafc',
    color: '#1f2937',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 8px 20px rgba(0, 114, 255, 0.3)',
  },
  secondaryButton: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
  },
  errorText: {
    margin: 0,
    color: '#dc3545',
    fontWeight: '700',
    fontSize: '14px',
  },
};

export default VehicleList;
