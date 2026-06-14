import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { formatRupees } from '../utils/format';

const MaintenancePage = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ serviceType: '', cost: '', date: '', nextDue: '' });
  const [editingLogId, setEditingLogId] = useState(null);
  const today = new Date();

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get(`/maintenance?vehicleId=${id}`);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, vehicleId: id };
      if (editingLogId) {
        await api.put(`/maintenance/${editingLogId}`, payload);
      } else {
        await api.post('/maintenance', payload);
      }
      setForm({ serviceType: '', cost: '', date: '', nextDue: '' });
      setEditingLogId(null);
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (log) => {
    setEditingLogId(log.id);
    setForm({
      serviceType: log.serviceType || '',
      cost: log.cost?.toString?.() || '',
      date: log.date || '',
      nextDue: log.nextDue || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setForm({ serviceType: '', cost: '', date: '', nextDue: '' });
  };

  const handleDelete = (logId) => {
    setConfirm({
      message: 'This maintenance record will be permanently deleted.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/maintenance/${logId}`);
          setEditingLogId(null);
          setForm({ serviceType: '', cost: '', date: '', nextDue: '' });
          fetchLogs();
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const upcomingLogs = logs
    .filter((log) => log.nextDue && new Date(log.nextDue) >= today)
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

  return (
    <div style={styles.container}>
      <p style={styles.subtitle}>Log services and stay ahead of due dates.</p>

      <form onSubmit={handleSubmit} className="glass-inset" style={styles.formCard}>
        <div style={styles.formGrid}>
          <div className="field">
            <label className="field-label">Service Type</label>
            <input
              className="input"
              type="text"
              placeholder="Oil change, brake pads..."
              value={form.serviceType}
              onChange={e => setForm({ ...form, serviceType: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Cost (₹)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.cost}
              onChange={e => setForm({ ...form, cost: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Service Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Next Due (optional)</label>
            <input
              className="input"
              type="date"
              value={form.nextDue}
              onChange={e => setForm({ ...form, nextDue: e.target.value })}
            />
          </div>
        </div>
        <div style={styles.formActions}>
          {editingLogId && (
            <button type="button" className="btn btn-ghost" onClick={handleCancelEdit}>Cancel Edit</button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingLogId ? 'Update Record' : '+ Add Record'}
          </button>
        </div>
      </form>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Upcoming Maintenance</h3>
        {upcomingLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <span className="icon" style={{ fontSize: '32px' }}>🗓</span>
            No upcoming due dates.
          </div>
        ) : (
          <div style={styles.upcomingList}>
            {upcomingLogs.map((log) => {
              const days = Math.ceil((new Date(log.nextDue) - today) / 86400000);
              return (
                <div key={`upcoming-${log.id}`} className="glass-inset" style={styles.upcomingItem}>
                  <div style={{ display: 'grid', gap: '4px', minWidth: 0 }}>
                    <span style={styles.upcomingService}>{log.serviceType}</span>
                    <span style={styles.upcomingDate}>Due {log.nextDue}</span>
                  </div>
                  <div style={styles.upcomingRight}>
                    <span className={`chip ${days <= 7 ? 'chip-danger' : days <= 30 ? 'chip-warn' : 'chip-success'}`}>
                      {days <= 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(log)}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(log.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Maintenance History</h3>
        {logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <span className="icon" style={{ fontSize: '32px' }}>🔧</span>
            No maintenance records yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Next Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isPastDue = log.nextDue && new Date(log.nextDue) < new Date();
                  return (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>{log.serviceType}</td>
                      <td style={{ fontWeight: 700 }}>{formatRupees(log.cost)}</td>
                      <td>
                        {log.nextDue
                          ? isPastDue
                            ? <span className="chip chip-danger">{log.nextDue} · overdue</span>
                            : log.nextDue
                          : '—'}
                      </td>
                      <td>
                        <div style={styles.rowActions}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(log)}>Edit</button>
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
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

const styles = {
  container: { display: 'grid', gap: '20px' },
  subtitle: { margin: 0, color: 'var(--text-2)', fontSize: '14px' },
  formCard: { display: 'grid', gap: '16px', padding: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  section: { display: 'grid', gap: '12px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 800 },
  upcomingList: { display: 'grid', gap: '10px' },
  upcomingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  upcomingService: { fontWeight: 700, color: 'var(--text-1)', fontSize: '15px' },
  upcomingDate: { fontSize: '13px', color: 'var(--text-2)' },
  upcomingRight: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  rowActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
};

export default MaintenancePage;