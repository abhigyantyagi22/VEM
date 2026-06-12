import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_ICONS = { Car: '🚗', Bike: '🏍', Truck: '🚚', Van: '🚐', Other: '🛞' };
const VEHICLE_TYPES = ['Car', 'Bike', 'Truck', 'Van', 'Other'];

const VehicleList = () => {
  const { userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicleName: '', vehicleNumber: '', vehicleType: '', purchaseDate: '' });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/vehicles?userId=${userId}`);
      const vehiclesData = res.data || [];
      try {
        const driversRes = await api.get('/drivers');
        const drivers = driversRes.data || [];
        const driverMap = {};
        drivers.forEach(d => {
          if (d.vehicleId) driverMap[d.vehicleId] = d;
        });
        setVehicles(vehiclesData.map(v => ({
          ...v,
          assignedDriverName: driverMap[v.id]?.driverName || '',
        })));
      } catch {
        const enriched = await Promise.all(vehiclesData.map(async (v) => {
          try {
            const drv = await api.get(`/drivers/${v.id}`);
            const driver = Array.isArray(drv.data) && drv.data.length > 0 ? drv.data[0] : null;
            return { ...v, assignedDriverName: driver ? driver.driverName : '' };
          } catch {
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

  const handleDelete = (vehicle) => {
    setConfirm({
      message: `"${vehicle.vehicleName}" and all its logs will be permanently deleted.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/vehicles/${vehicle.id}`);
          fetchVehicles();
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const handleDownloadReport = async (vehicle) => {
    setDownloadingId(vehicle.id);
    try {
      const res = await api.get(`/reports/vehicle/${vehicle.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${vehicle.vehicleName}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

  const renderModal = () => (
    <div className="modal-overlay" role="presentation" onClick={closeModal}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="add-vehicle-title" className="modal-title">Add Vehicle</h2>
          <button type="button" onClick={closeModal} className="modal-close" aria-label="Close">×</button>
        </div>
        <form onSubmit={handleAdd} style={styles.modalForm}>
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
          {vehicleError && <div className="alert alert-error">{vehicleError}</div>}
          <div style={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addingVehicle}>
              {addingVehicle ? 'Adding...' : '+ Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="page-shell" style={styles.page}>
      <div className="row-between anim-up">
        <div>
          <p className="eyebrow">Garage</p>
          <h1 className="page-title">My Vehicles</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state anim-up d1">
          <span className="icon">⬡</span>
          No vehicles yet — click “Add Vehicle” to get started.
        </div>
      ) : (
        <div style={styles.grid}>
          {vehicles.map((v, i) => (
            <div key={v.id} className={`glass-card hoverable anim-up d${Math.min(i + 1, 5)}`} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.typeIcon} aria-hidden="true">{TYPE_ICONS[v.vehicleType] || '🛞'}</span>
                <div style={{ minWidth: 0 }}>
                  <button
                    type="button"
                    style={styles.nameLink}
                    onClick={() => navigate(`/vehicles/${v.id}/manage`)}
                    title="Open workspace"
                  >
                    {v.vehicleName}
                  </button>
                  <p style={styles.meta}>{v.vehicleNumber} · {v.vehicleType}</p>
                </div>
              </div>

              <div style={styles.chipRow}>
                {v.assignedDriverName
                  ? <span className="chip chip-success">✦ {v.assignedDriverName}</span>
                  : <span className="chip">No driver assigned</span>}
                {v.purchaseDate && <span className="chip">Since {v.purchaseDate}</span>}
              </div>

              <div style={styles.actions}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/vehicles/${v.id}/manage`)}>
                  Open Workspace
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDownloadReport(v)}
                  disabled={downloadingId === v.id}
                >
                  {downloadingId === v.id ? '...' : '⬇ PDF'}
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(v)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && renderModal()}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

const styles = {
  page: { display: 'grid', gap: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' },
  card: { display: 'grid', gap: '16px', alignContent: 'start' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '14px' },
  typeIcon: {
    fontSize: '26px',
    width: '54px',
    height: '54px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '16px',
    background: 'var(--accent-soft)',
    border: '1px solid var(--glass-border-bright)',
    flexShrink: 0,
  },
  nameLink: {
    fontSize: '19px',
    fontWeight: 800,
    color: 'var(--text-1)',
    border: 'none',
    background: 'transparent',
    padding: 0,
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.2px',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  meta: { margin: '3px 0 0', color: 'var(--text-2)', fontSize: '13px', fontWeight: 600 },
  chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  modalForm: { display: 'grid', gap: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
};

export default VehicleList;