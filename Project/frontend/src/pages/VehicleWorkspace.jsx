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
  { key: 'fuel', label: 'Fuel', icon: '⛽' },
  { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { key: 'documents', label: 'Documents', icon: '📄' },
  { key: 'drivers', label: 'Drivers', icon: '✦' },
];

const VehicleWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [activeSection, setActiveSection] = useState('fuel');
  const [vehicle, setVehicle] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!userId) return;
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

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/reports/vehicle/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${vehicle?.vehicleName || 'vehicle'}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const renderContent = () => {
    if (activeSection === 'fuel') return <FuelLogs />;
    if (activeSection === 'maintenance') return <MaintenancePage />;
    if (activeSection === 'documents') return <DocumentsPage />;
    return <DriverManagement key={id} />;
  };

  return (
    <>
      <div className="page-shell" style={styles.page}>
        <header className="glass-card anim-up" style={styles.headerCard}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/vehicles')}>
            ← Vehicles
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="page-title" style={styles.vehicleName}>{vehicle?.vehicleName || 'Vehicle Workspace'}</h1>
            <p style={styles.vehicleMeta}>
              {vehicle ? `${vehicle.vehicleNumber} · ${vehicle.vehicleType}` : `Vehicle ID: ${id}`}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleDownloadReport} disabled={downloading}>
              {downloading ? '...' : '⬇ PDF Report'}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowEdit(true)} disabled={!vehicle}>
              ✎ Edit
            </button>
          </div>
        </header>

        <div className="anim-up d1" style={styles.tabs}>
          {SECTION_ITEMS.map((item) => {
            const isActive = item.key === activeSection;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                style={{ ...styles.tab, ...(isActive ? styles.tabActive : {}) }}
              >
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </button>
            );
          })}
        </div>

        <section className="glass-card anim-up d2" style={styles.contentCard} key={activeSection}>
          <h2 style={styles.sectionTitle}>{sectionTitle}</h2>
          {renderContent()}
        </section>
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
  page: { display: 'grid', gap: '16px' },
  headerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '18px 22px',
  },
  vehicleName: { fontSize: 'clamp(22px, 3vw, 30px)' },
  vehicleMeta: { margin: '4px 0 0', color: 'var(--text-2)', fontWeight: 600, fontSize: '13px' },
  headerActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 20px',
    borderRadius: '14px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass)',
    color: 'var(--text-2)',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'var(--accent-soft)',
    border: '1px solid var(--glass-border-bright)',
    color: 'var(--text-1)',
    boxShadow: 'var(--accent-glow)',
  },
  contentCard: { animation: 'fade-up 0.4s cubic-bezier(0.21, 0.8, 0.32, 1) both' },
  sectionTitle: { margin: '0 0 16px', fontSize: '20px', fontWeight: 800 },
};

export default VehicleWorkspace;