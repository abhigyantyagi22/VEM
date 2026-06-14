import React, { useCallback, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ConfirmModal from '../components/ConfirmModal';
import AddVehicleModal from '../components/AddVehicleModal';
import { downloadVehicleReport } from '../utils/reports';
import { fetchDrivers } from '../utils/drivers';

const TYPE_ICONS = { Car: '🚗', Bike: '🏍', Truck: '🚚', Van: '🚐', Other: '🛞' };

const VehicleList = () => {
  const { userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const fetchVehicles = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get('/vehicles');
      const vehiclesData = res.data || [];
      let driverMap = {};
      try {
        const drivers = await fetchDrivers();
        drivers.forEach(d => {
          if (d.vehicleId) driverMap[d.vehicleId] = d;
        });
      } catch (e) {
        console.error(e);
      }
      setVehicles(vehiclesData.map(v => ({
        ...v,
        assignedDriverName: driverMap[v.id]?.driverName || '',
      })));
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
      await downloadVehicleReport(vehicle.id, vehicle.vehicleName);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

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

      {showModal && (
        <AddVehicleModal onClose={() => setShowModal(false)} onAdded={fetchVehicles} />
      )}
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
};

export default VehicleList;