import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const getToday = () => new Date().toISOString().split('T')[0];

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const FuelLogs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fuelAmount: '',
    fuelRate: '',
    totalBill: '',
    kilometersRun: '',
    date: getToday(),
  });

  const formatRupees = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/fuel/${id}`);
      setLogs(res.data || []);
    } catch (e) {
      console.error(e);
      setError('Could not load fuel history.');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const stats = useMemo(() => {
    const totalBill = logs.reduce((sum, log) => sum + parseNumber(log.fuelCost), 0);
    const totalFuel = logs.reduce((sum, log) => sum + parseNumber(log.fuelAmount), 0);
    const avgRate = totalFuel > 0 ? totalBill / totalFuel : 0;

    return {
      totalBill,
      totalFuel,
      avgRate,
    };
  }, [logs]);

  const closeModal = () => {
    setShowModal(false);
    setEditingLog(null);
    setError('');
    setForm({ fuelAmount: '', fuelRate: '', totalBill: '', kilometersRun: '', date: getToday() });
  };

  const openAddModal = () => {
    setEditingLog(null);
    setError('');
    setForm({ fuelAmount: '', fuelRate: '', totalBill: '', kilometersRun: '', date: getToday() });
    setShowModal(true);
  };

  const openEditModal = (log) => {
    const fuelAmount = parseNumber(log.fuelAmount);
    const totalBill = parseNumber(log.fuelCost);
    const fuelRate = fuelAmount > 0 ? totalBill / fuelAmount : 0;

    setEditingLog(log);
    setError('');
    setForm({
      fuelAmount: fuelAmount ? String(fuelAmount) : '',
      fuelRate: fuelRate ? fuelRate.toFixed(2) : '',
      totalBill: totalBill ? String(totalBill) : '',
      kilometersRun: log.odometer ? String(log.odometer) : '',
      date: log.date || getToday(),
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'fuelAmount' || field === 'fuelRate') {
        const amount = parseNumber(next.fuelAmount);
        const rate = parseNumber(next.fuelRate);
        next.totalBill = amount > 0 && rate > 0 ? (amount * rate).toFixed(2) : '';
      }

      if (field === 'totalBill') {
        const amount = parseNumber(next.fuelAmount);
        const total = parseNumber(next.totalBill);
        next.fuelRate = amount > 0 && total > 0 ? (total / amount).toFixed(2) : '';
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fuelAmount = parseNumber(form.fuelAmount);
    const fuelRate = parseNumber(form.fuelRate);
    const totalBill = parseNumber(form.totalBill);

    if (fuelAmount <= 0 || fuelRate <= 0 || totalBill <= 0 || !form.date || !form.kilometersRun) {
      setError('Please fill all required fields with valid values.');
      return;
    }

    const payload = {
      vehicleId: Number(id),
      fuelAmount,
      fuelCost: totalBill,
      odometer: Number(form.kilometersRun),
      date: form.date,
    };

    try {
      setSaving(true);
      setError('');

      if (editingLog) {
        await api.put(`/fuel/${editingLog.id}`, payload);
      } else {
        await api.post('/fuel', payload);
      }

      await fetchLogs();
      closeModal();
    } catch (e) {
      console.error(e);
      setError('Could not save fuel log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this fuel log?')) {
      try {
        await api.delete(`/fuel/${logId}`);
        await fetchLogs();
      } catch (e) {
        console.error(e);
        setError('Could not delete fuel log. Please try again.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>Fuel Logs</h2>
          <p style={styles.subtitle}>Vehicle ID: {id}</p>
        </div>
        <button type="button" onClick={openAddModal} style={styles.addButton}>
          + Add Log
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Fuel Spent</div>
          <div style={styles.statValue}>{formatRupees(stats.totalBill)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Fuel Added</div>
          <div style={styles.statValue}>{stats.totalFuel.toFixed(2)} L</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Average Fuel Rate</div>
          <div style={styles.statValue}>{formatRupees(stats.avgRate)} /L</div>
        </div>
      </div>

      <div style={styles.historyCard}>
        <h3 style={styles.historyTitle}>Fuel History</h3>
        {logs.length === 0 ? (
          <p style={styles.emptyText}>No fuel logs yet. Click Add Log to create your first entry.</p>
        ) : (
          <table border="1" cellPadding="10" width="100%" style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th>Date</th>
                <th>Amount (L)</th>
                <th>Rate (/L)</th>
                <th>Total Bill</th>
                <th>Kilometers Run</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const amount = parseNumber(log.fuelAmount);
                const cost = parseNumber(log.fuelCost);
                const rate = amount > 0 ? cost / amount : 0;
                return (
                  <tr key={log.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <td style={styles.tableCell}>{log.date}</td>
                    <td style={styles.tableCell}>{amount}</td>
                    <td style={styles.tableCell}>{formatRupees(rate)}</td>
                    <td style={styles.tableCell}>{formatRupees(cost)}</td>
                    <td style={styles.tableCell}>{log.odometer}</td>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => openEditModal(log)} style={styles.editButton}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(log.id)} style={styles.deleteButton}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} role="presentation" onClick={closeModal}>
          <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="fuel-modal-title" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 id="fuel-modal-title" style={styles.modalTitle}>{editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'}</h3>
              <button type="button" style={styles.closeButton} onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <label style={styles.fieldLabel}>
                Fuel Amount (L)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.fuelAmount}
                  onChange={(e) => handleChange('fuelAmount', e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 20"
                />
              </label>

              <label style={styles.fieldLabel}>
                Fuel Rate (₹/L)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.fuelRate}
                  onChange={(e) => handleChange('fuelRate', e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 102.5"
                />
              </label>

              <label style={styles.fieldLabel}>
                Total Fuel Bill (₹)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.totalBill}
                  onChange={(e) => handleChange('totalBill', e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 2050"
                />
              </label>

              <label style={styles.fieldLabel}>
                Vehicle Ran (km)
                <input
                  type="number"
                  min="0"
                  required
                  value={form.kilometersRun}
                  onChange={(e) => handleChange('kilometersRun', e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 45200"
                />
              </label>

              <label style={styles.fieldLabel}>
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  style={styles.input}
                />
              </label>

              {error && <p style={styles.errorText}>{error}</p>}

              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.secondaryButton}>Cancel</button>
                <button type="submit" disabled={saving} style={styles.primaryButton}>
                  {saving ? 'Saving...' : editingLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gap: '18px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '34px',
    fontWeight: 800,
    background: 'linear-gradient(130deg, #0f172a, #0f766e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#0f766e',
    fontWeight: 600,
  },
  addButton: {
    padding: '12px 22px',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  statCard: {
    background: 'linear-gradient(130deg, rgba(255,255,255,0.88), rgba(236,253,250,0.7))',
    border: '1px solid rgba(153, 246, 228, 0.36)',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
  },
  statLabel: {
    color: '#0f766e',
    fontWeight: 600,
    fontSize: '14px',
  },
  statValue: {
    marginTop: '6px',
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: 800,
  },
  historyCard: {
    background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    borderRadius: '16px',
    padding: '14px',
    overflowX: 'auto',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
  },
  historyTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#1f2937',
  },
  emptyText: {
    margin: 0,
    color: '#64748b',
  },
  table: {
    borderCollapse: 'collapse',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(94, 234, 212, 0.34)',
  },
  tableHead: {
    background: 'linear-gradient(130deg, rgba(204,251,241,0.8), rgba(240,253,250,0.92))',
  },
  tableRow: {
    background: 'rgba(255, 255, 255, 0.62)',
  },
  tableRowAlt: {
    background: 'rgba(240, 253, 250, 0.62)',
  },
  tableCell: {
    borderColor: 'rgba(94, 234, 212, 0.28)',
  },
  editButton: {
    padding: '7px 12px',
    border: '1px solid rgba(45, 212, 191, 0.45)',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, rgba(240,253,250,0.92), rgba(204,251,241,0.85))',
    color: '#0f766e',
    fontWeight: 700,
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '7px 12px',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '999px',
    background: 'linear-gradient(130deg, rgba(255,240,240,0.96), rgba(254,242,242,0.92))',
    color: '#dc2626',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.45)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 3000,
  },
  modal: {
    width: '100%',
    maxWidth: '560px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  modalTitle: {
    margin: 0,
    color: '#0f172a',
  },
  closeButton: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid #dbe3ee',
    background: '#fff',
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  modalForm: {
    display: 'grid',
    gap: '12px',
  },
  fieldLabel: {
    display: 'grid',
    gap: '6px',
    color: '#334155',
    fontWeight: 700,
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  errorText: {
    margin: 0,
    color: '#dc2626',
    fontWeight: 700,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  secondaryButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#f8fafc',
    color: '#1f2937',
    fontWeight: 700,
    cursor: 'pointer',
  },
  primaryButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default FuelLogs;
