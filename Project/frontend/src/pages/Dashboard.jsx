import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import AddVehicleModal from '../components/AddVehicleModal';
import Skeleton from '../components/Skeleton';
import { formatRupees } from '../utils/format';
import { downloadVehicleReport } from '../utils/reports';

const Dashboard = () => {
  const { userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [fleetData, setFleetData] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicle(res.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching vehicles:', err);
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    api.get('/dashboard/fleet')
      .then(res => setFleetData(res.data))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedVehicle) return;
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/${selectedVehicle}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedVehicle]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadReport = async () => {
    if (!selectedVehicle) return;
    setDownloadingPdf(true);
    try {
      const vehicle = vehicles.find(v => String(v.id) === String(selectedVehicle));
      await downloadVehicleReport(selectedVehicle, vehicle?.vehicleName);
      showToast('success', 'PDF report downloaded.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not generate the PDF report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendDigest = async () => {
    setSendingDigest(true);
    try {
      await api.post('/digest/send');
      showToast('success', 'Monthly digest sent to your email.');
    } catch (err) {
      console.error(err);
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Could not send the digest email.';
      showToast('error', msg);
    } finally {
      setSendingDigest(false);
    }
  };

  const chartData = dashboardData?.monthlyExpenses
    ? Object.entries(dashboardData.monthlyExpenses)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, cost]) => ({ month, cost }))
    : [];

  const handleVehicleAdded = (vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
    setSelectedVehicle(vehicle.id);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="page-shell" style={styles.page}>
        <div className="row-between">
          <Skeleton width="280px" height="40px" borderRadius="12px" />
          <Skeleton width="150px" height="46px" borderRadius="14px" />
        </div>
        <div className="grid-stats">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card" style={{ padding: '22px' }}>
              <Skeleton width="60%" height="12px" />
              <Skeleton width="45%" height="32px" style={{ marginTop: '12px' }} />
            </div>
          ))}
        </div>
        <div className="glass-card">
          <Skeleton width="200px" height="20px" style={{ marginBottom: '24px' }} />
          <Skeleton width="100%" height="280px" borderRadius="14px" />
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="page-shell" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <h1 className="page-title anim-up" style={{ fontSize: '40px' }}>Welcome to WheelSync</h1>
        <p className="page-sub anim-up d1" style={{ fontSize: '17px' }}>Your garage is empty — add your first vehicle to begin.</p>
        <div className="glass-card anim-up d2" style={styles.emptyCard}>
          <span style={{ fontSize: '52px', display: 'block', animation: 'float-y 3.5s ease-in-out infinite' }}>⬡</span>
          <h2 style={{ margin: '14px 0 8px' }}>Get Started</h2>
          <p style={{ color: 'var(--text-2)', margin: '0 0 22px' }}>
            Add a vehicle to unlock expense tracking, fuel efficiency analytics, maintenance alerts, and PDF reports.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowVehicleModal(true)}>
            + Add Your First Vehicle
          </button>
        </div>
        {showVehicleModal && (
          <AddVehicleModal onClose={() => setShowVehicleModal(false)} onAdded={handleVehicleAdded} />
        )}
      </div>
    );
  }

  return (
    <div className="page-shell" style={styles.page}>
      {toast && (
        <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`} style={styles.toast}>
          {toast.text}
        </div>
      )}

      <div className="row-between anim-up">
        <div>
          <p className="eyebrow">Fleet Command</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={handleSendDigest} disabled={sendingDigest}>
            {sendingDigest ? 'Sending...' : '✉ Email My Digest'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
            + Add Vehicle
          </button>
        </div>
      </div>

      {fleetData && (
        <>
          <div className="grid-stats">
            <div className="glass-card stat-card hoverable anim-up d1">
              <span className="stat-label">Fleet Total Cost</span>
              <span className="stat-value">{formatRupees(fleetData.totalFleetExpense)}</span>
            </div>
            <div className="glass-card stat-card hoverable anim-up d2">
              <span className="stat-label">Fuel Spend</span>
              <span className="stat-value">{formatRupees(fleetData.totalFuelCost)}</span>
            </div>
            <div className="glass-card stat-card hoverable anim-up d3">
              <span className="stat-label">Maintenance Spend</span>
              <span className="stat-value">{formatRupees(fleetData.totalMaintenanceCost)}</span>
            </div>
            <div className="glass-card stat-card hoverable anim-up d4">
              <span className="stat-label">Vehicles</span>
              <span className="stat-value">{fleetData.totalVehicles}</span>
            </div>
          </div>

          {fleetData.upcomingAlerts && fleetData.upcomingAlerts.length > 0 && (
            <div className="glass-card anim-up d2" style={styles.alertsCard}>
              <p className="eyebrow" style={{ color: 'var(--warning)' }}>Upcoming Alerts</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {fleetData.upcomingAlerts.map((msg, i) => (
                  <div key={i} className="alert alert-warn">⚠ {msg}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="glass-card anim-up d2" style={styles.selectorCard}>
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label className="field-label" style={{ margin: 0 }}>Vehicle</label>
            <select
              className="input"
              style={{ width: 'auto', minWidth: '230px' }}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicleName} — {v.vehicleNumber}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleDownloadReport} disabled={downloadingPdf}>
            {downloadingPdf ? 'Generating...' : '⬇ Download PDF Report'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid-stats">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card" style={{ padding: '22px' }}>
              <Skeleton width="60%" height="12px" />
              <Skeleton width="45%" height="32px" style={{ marginTop: '12px' }} />
            </div>
          ))}
        </div>
      ) : dashboardData ? (
        <>
          <div className="grid-stats">
            <div className="glass-card stat-card hoverable anim-up d1">
              <span className="stat-label">Total Cost of Ownership</span>
              <span className="stat-value">{formatRupees(dashboardData.totalExpense)}</span>
              <span style={styles.statHint}>fuel + maintenance, lifetime</span>
            </div>
            <div className="glass-card stat-card hoverable anim-up d2">
              <span className="stat-label">Fuel Efficiency</span>
              <span className="stat-value">
                {dashboardData.mileage || 0}<span className="stat-unit">km/L</span>
              </span>
              <span style={styles.statHint}>from logged refuels</span>
            </div>
            <div className="glass-card stat-card hoverable anim-up d3">
              <span className="stat-label">Cost per KM</span>
              <span className="stat-value">{formatRupees(dashboardData.costPerKm)}</span>
              <span style={styles.statHint}>all running costs / km</span>
            </div>
          </div>

          <div className="glass-card anim-up d3">
            <h3 style={styles.sectionTitle}>Monthly Expense Trend</h3>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 330 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-3)" tick={{ fill: 'var(--text-2)', fontWeight: 600, fontSize: 12 }} />
                    <YAxis stroke="var(--text-3)" tick={{ fill: 'var(--text-2)', fontWeight: 600, fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                      contentStyle={{
                        background: 'var(--glass-strong)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        backdropFilter: 'blur(16px)',
                        color: 'var(--text-1)',
                      }}
                      labelStyle={{ color: 'var(--text-2)', fontWeight: 700 }}
                      itemStyle={{ color: 'var(--accent-1)', fontWeight: 700 }}
                      formatter={(value) => [formatRupees(value), 'Expense']}
                    />
                    <Bar dataKey="cost" fill="url(#vemBarGrad)" radius={[8, 8, 0, 0]} maxBarSize={56} />
                    <defs>
                      <linearGradient id="vemBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.75} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">
                <span className="icon">📊</span>
                No expense logs yet — add fuel or maintenance records to see analytics.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="icon">🔍</span>
          No data found for this vehicle.
        </div>
      )}

      {fleetData?.vehicleExpenses && fleetData.vehicleExpenses.length > 0 && (
        <div className="glass-card anim-up d4">
          <h3 style={styles.sectionTitle}>Cost of Ownership by Vehicle</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {fleetData.vehicleExpenses.map((v, i) => {
              const pct = fleetData.totalFleetExpense > 0
                ? (v.totalExpense / fleetData.totalFleetExpense) * 100
                : 0;
              return (
                <div key={v.vehicleId} style={styles.barRow}>
                  <div style={styles.barLabel}>
                    <span style={styles.barName}>{v.vehicleName}</span>
                    <span style={styles.barNum}>{v.vehicleNumber}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${pct.toFixed(1)}%`,
                        opacity: Math.max(0.45, 1 - i * 0.12),
                      }}
                    />
                  </div>
                  <div style={styles.barMeta}>
                    <span style={styles.barAmt}>{formatRupees(v.totalExpense)}</span>
                    {(v.kmPerL > 0 || v.costPerKm > 0) && (
                      <span style={styles.barChips}>
                        {v.kmPerL > 0 && <span className="chip">{v.kmPerL} km/L</span>}
                        {v.costPerKm > 0 && <span className="chip">{formatRupees(v.costPerKm)}/km</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showVehicleModal && (
        <AddVehicleModal onClose={() => setShowVehicleModal(false)} onAdded={handleVehicleAdded} />
      )}
    </div>
  );
};

const styles = {
  page: { display: 'grid', gap: '22px' },
  toast: {
    position: 'fixed',
    top: '92px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3000,
    animation: 'slide-down 0.3s ease both',
    boxShadow: 'var(--shadow-pop)',
  },
  emptyCard: { maxWidth: '480px', margin: '36px auto 0', textAlign: 'center' },
  alertsCard: { display: 'grid', gap: '4px' },
  selectorCard: { padding: '18px 24px' },
  sectionTitle: { margin: '0 0 20px', fontSize: '18px', fontWeight: 800 },
  statHint: { fontSize: '12px', color: 'var(--text-3)', fontWeight: 600 },
  modalForm: { display: 'grid', gap: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
  barRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(120px, 180px) 1fr minmax(150px, auto)',
    alignItems: 'center',
    gap: '14px',
  },
  barLabel: { display: 'grid', gap: '2px', minWidth: 0 },
  barName: {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  barNum: { fontSize: '12px', color: 'var(--text-3)' },
  barTrack: {
    height: '10px',
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'var(--accent-grad)',
    borderRadius: '999px',
    animation: 'bar-grow 0.8s cubic-bezier(0.21, 0.8, 0.32, 1) both',
  },
  barMeta: { display: 'grid', gap: '4px', justifyItems: 'end' },
  barAmt: { fontWeight: 800, fontSize: '14px', color: 'var(--text-1)' },
  barChips: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },
};

export default Dashboard;