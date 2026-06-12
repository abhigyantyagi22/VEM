import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const getToday = () => new Date().toISOString().split('T')[0];

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatRupees = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const FuelLogs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [confirm, setConfirm] = useState(null);
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
    const totalKm = logs.reduce((sum, log) => sum + parseNumber(log.distanceDriven), 0);
    const avgRate = totalFuel > 0 ? totalBill / totalFuel : 0;
    const kmPerL = totalFuel > 0 && totalKm > 0 ? totalKm / totalFuel : 0;
    return { totalBill, totalFuel, avgRate, kmPerL };
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
      kilometersRun: log.distanceDriven ? String(log.distanceDriven) : '',
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
      distanceDriven: Number(form.kilometersRun),
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

  const handleDelete = (logId) => {
    setConfirm({
      message: 'This fuel log will be permanently deleted.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/fuel/${logId}`);
          await fetchLogs();
        } catch (e) {
          console.error(e);
          setError('Could not delete fuel log. Please try again.');
        }
      },
    });
  };

  return (
    <div style={styles.container}>
      <div className="row-between">
        <p style={styles.subtitle}>Track refuels, efficiency, and spend.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={openAddModal}>
          + Add Log
        </button>
      </div>

      <div className="grid-stats">
        <div className="glass-inset" style={styles.stat}>
          <span style={styles.statLabel}>Total Fuel Spent</span>
          <span style={styles.statValue}>{formatRupees(stats.totalBill)}</span>
        </div>
        <div className="glass-inset" style={styles.stat}>
          <span style={styles.statLabel}>Fuel Added</span>
          <span style={styles.statValue}>{stats.totalFuel.toFixed(2)} L</span>
        </div>
        <div className="glass-inset" style={styles.stat}>
          <span style={styles.statLabel}>Avg Rate</span>
          <span style={styles.statValue}>{formatRupees(stats.avgRate)}<span style={styles.unit}>/L</span></span>
        </div>
        <div className="glass-inset" style={styles.stat}>
          <span style={styles.statLabel}>Efficiency</span>
          <span style={styles.statValue}>{stats.kmPerL ? stats.kmPerL.toFixed(2) : '—'}<span style={styles.unit}>km/L</span></span>
        </div>
      </div>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {logs.length === 0 ? (
        <div className="empty-state">
          <span className="icon">⛽</span>
          No fuel logs yet — click “Add Log” to create your first entry.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (L)</th>
                <th>Rate (/L)</th>
                <th>Total Bill</th>
                <th>KM Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const amount = parseNumber(log.fuelAmount);
                const cost = parseNumber(log.fuelCost);
                const rate = amount > 0 ? cost / amount : 0;
                return (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{amount}</td>
                    <td>{formatRupees(rate)}</td>
                    <td style={{ fontWeight: 700 }}>{formatRupees(cost)}</td>
                    <td>{log.distanceDriven}</td>
                    <td>
                      <div style={styles.rowActions}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEditModal(log)}>Edit</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(log.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" role="presentation" onClick={closeModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="fuel-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="fuel-modal-title" className="modal-title">{editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div className="field">
                  <label className="field-label">Fuel Amount (L)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.fuelAmount}
                    onChange={(e) => handleChange('fuelAmount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Rate (₹/L)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.fuelRate}
                    onChange={(e) => handleChange('fuelRate', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div className="field">
                  <label className="field-label">Total Bill (₹)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.totalBill}
                    onChange={(e) => handleChange('totalBill', e.target.value)}
                    placeholder="auto-calculated"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Kilometers Run</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    required
                    value={form.kilometersRun}
                    onChange={(e) => setForm((p) => ({ ...p, kilometersRun: e.target.value }))}
                    placeholder="km since last refuel"
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Date</label>
                <input
                  className="input"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingLog ? 'Update Log' : 'Add Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

const styles = {
  container: { display: 'grid', gap: '18px' },
  subtitle: { margin: 0, color: 'var(--text-2)', fontSize: '14px' },
  stat: { display: 'grid', gap: '6px' },
  statLabel: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-1)' },
  statValue: { fontSize: '21px', fontWeight: 800, color: 'var(--text-1)' },
  unit: { fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', marginLeft: '3px' },
  rowActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  modalForm: { display: 'grid', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
};

export default FuelLogs;