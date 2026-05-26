import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import FuelLogs from './FuelLogs';
import MaintenancePage from './MaintenancePage';
import DocumentsPage from './DocumentsPage';
import DriverManagement from './DriverManagement';
import EditVehicleModal from '../components/EditVehicleModal';

const SECTION_ITEMS = [
  { key: 'fuel', label: 'Fuel' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'documents', label: 'Documents' },
  { key: 'drivers', label: 'Drivers' },
];

const VehicleWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [activeSection, setActiveSection] = useState('fuel');
  const [vehicle, setVehicle] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!userId) {
          console.log('[VehicleWorkspace] Skipping fetch: userId not available');
          return;
        }
        const res = await api.get(`/vehicles?userId=${userId}`);
        const selected = (res.data || []).find((item) => String(item.id) === String(id));
        setVehicle(selected || null);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVehicle();
  }, [id, userId]);

  const sectionTitle = useMemo(() => {
    const section = SECTION_ITEMS.find((item) => item.key === activeSection);
    return section ? section.label : 'Fuel';
  }, [activeSection]);

  const renderContent = () => {
    if (activeSection === 'fuel') {
      return <FuelLogs />;
    }
    if (activeSection === 'maintenance') {
      return <MaintenancePage />;
    }
    if (activeSection === 'documents') {
      return <DocumentsPage />;
    }
    // Pass vehicle id so DriverManagement shows scoped assigned drivers and can create unassigned drivers
    return <DriverManagement key={id} />;
  };

  return (
    <>
      <div style={styles.page}>
      <header style={styles.headerCard}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={() => navigate('/vehicles')} style={styles.backButton}>
            ← Back to Vehicles
          </button>
          <div>
            <h1 style={styles.vehicleName}>{vehicle?.vehicleName || 'Vehicle Workspace'}</h1>
            <p style={styles.vehicleMeta}>{vehicle ? `${vehicle.vehicleNumber} · ${vehicle.vehicleType}` : `Vehicle ID: ${id}`}</p>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            style={styles.editButton}
            disabled={!vehicle}
            aria-label="Edit vehicle"
          >
            Edit
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sideNav}>
          <p style={styles.sideLabel}>Quick Navigation</p>
          {SECTION_ITEMS.map((item) => {
            const isActive = item.key === activeSection;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                style={isActive ? styles.navItemActive : styles.navItem}
              >
                {item.label}
              </button>
            );
          })}
        </aside>

        <section style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>{sectionTitle}</h2>
          {renderContent()}
        </section>
      </div>
      </div>
      {showEdit && (
      <EditVehicleModal
        vehicle={vehicle}
        onClose={() => setShowEdit(false)}
        onSaved={(updated) => setVehicle(updated)}
      />
      )}
    </>
  );
};

const styles = {
  page: {
    maxWidth: '1250px',
    margin: '0 auto',
    display: 'grid',
    gap: '14px',
  },
  headerCard: {
    borderRadius: '18px',
    background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    border: '1px solid rgba(45, 212, 191, 0.35)',
    borderRadius: '999px',
    padding: '7px 12px',
    background: 'rgba(240, 253, 250, 0.9)',
    color: '#0f766e',
    fontWeight: 700,
    cursor: 'pointer',
  },
  vehicleName: {
    margin: '10px 0 4px',
    fontSize: '32px',
    background: 'linear-gradient(130deg, #0f172a, #0f766e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  vehicleMeta: {
    margin: 0,
    color: '#0f766e',
    fontWeight: 700,
  },

  editButton: {
    borderRadius: 12,
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr)',
    gap: '14px',
    alignItems: 'start',
  },
  sideNav: {
    borderRadius: '16px',
    background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
    padding: '12px',
    display: 'grid',
    gap: '8px',
    position: 'sticky',
    top: '96px',
  },
  sideLabel: {
    margin: '0 0 4px',
    color: '#0f766e',
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.25px',
    textTransform: 'uppercase',
  },
  navItem: {
    border: '1px solid rgba(45, 212, 191, 0.35)',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'left',
    background: 'rgba(255, 255, 255, 0.74)',
    color: '#0f766e',
    fontWeight: 700,
    cursor: 'pointer',
  },
  navItemActive: {
    border: '1px solid rgba(45, 212, 191, 0.52)',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'left',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(15, 118, 110, 0.25)',
  },
  contentCard: {
    borderRadius: '16px',
    background: 'linear-gradient(130deg, rgba(255,255,255,0.88), rgba(240,253,250,0.66))',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
    padding: '14px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#0f172a',
    fontSize: '22px',
  },
};

export default VehicleWorkspace;
