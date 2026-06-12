import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const expiryChip = (dateStr) => {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0) return <span className="chip chip-danger">Expired</span>;
  if (days <= 30) return <span className="chip chip-warn">{days}d left</span>;
  return <span className="chip chip-success">Valid</span>;
};

const DocumentsPage = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState({ insuranceExpiry: '', pucExpiry: '', registrationExpiry: '' });
  const [confirm, setConfirm] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchDoc = async () => {
    try {
      const res = await api.get(`/documents?vehicleId=${id}`);
      if (res.data) {
        setDoc({
          insuranceExpiry: res.data.insuranceExpiry || '',
          pucExpiry: res.data.pucExpiry || '',
          registrationExpiry: res.data.registrationExpiry || '',
        });
      }
    } catch (e) {
      if (e?.response?.status !== 404) {
        console.error(e);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/documents/history?vehicleId=${id}`);
      setHistory(res.data || []);
    } catch (e) {
      console.error(e);
      setError('Could not load document history. Please refresh and try again.');
    }
  };

  useEffect(() => {
    fetchDoc();
    fetchHistory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = { ...doc, vehicleId: id };
      if (editingDocumentId) {
        await api.put(`/documents/${editingDocumentId}`, payload);
        setSuccessMessage('Document details updated.');
      } else {
        await api.post('/documents', payload);
        setSuccessMessage('Document details saved and added to history.');
      }
      setEditingDocumentId(null);
      await fetchDoc();
      await fetchHistory();
    } catch (e) {
      console.error(e);
      setError('Could not save documents. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingDocumentId(entry.id);
    setDoc({
      insuranceExpiry: entry.insuranceExpiry || '',
      pucExpiry: entry.pucExpiry || '',
      registrationExpiry: entry.registrationExpiry || '',
    });
    setError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingDocumentId(null);
    setDoc({ insuranceExpiry: '', pucExpiry: '', registrationExpiry: '' });
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = (documentId) => {
    setConfirm({
      message: 'This document record will be permanently deleted.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/documents/${documentId}`);
          setEditingDocumentId(null);
          setDoc({ insuranceExpiry: '', pucExpiry: '', registrationExpiry: '' });
          setError('');
          setSuccessMessage('');
          await fetchDoc();
          await fetchHistory();
        } catch (e) {
          console.error(e);
          setError('Could not delete document. Please try again.');
        }
      },
    });
  };

  return (
    <div style={styles.container}>
      <p style={styles.subtitle}>Track insurance, PUC, and registration expiry dates.</p>

      <form onSubmit={handleSubmit} className="glass-inset" style={styles.formCard}>
        <div style={styles.formGrid}>
          <div className="field">
            <label className="field-label">Insurance Expiry {expiryChip(doc.insuranceExpiry)}</label>
            <input
              className="input"
              type="date"
              value={doc.insuranceExpiry}
              onChange={(e) => setDoc({ ...doc, insuranceExpiry: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">PUC Expiry {expiryChip(doc.pucExpiry)}</label>
            <input
              className="input"
              type="date"
              value={doc.pucExpiry}
              onChange={(e) => setDoc({ ...doc, pucExpiry: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Registration Expiry {expiryChip(doc.registrationExpiry)}</label>
            <input
              className="input"
              type="date"
              value={doc.registrationExpiry}
              onChange={(e) => setDoc({ ...doc, registrationExpiry: e.target.value })}
              required
            />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div style={styles.formActions}>
          {editingDocumentId && (
            <button type="button" className="btn btn-ghost" onClick={handleCancelEdit}>Cancel Edit</button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingDocumentId ? 'Update Documents' : 'Save Documents'}
          </button>
        </div>
      </form>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Document History</h3>
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <span className="icon" style={{ fontSize: '32px' }}>📄</span>
            No document records yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Insurance</th>
                  <th>PUC</th>
                  <th>Registration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div style={styles.cellStack}>
                        {entry.insuranceExpiry || 'N/A'} {expiryChip(entry.insuranceExpiry)}
                      </div>
                    </td>
                    <td>
                      <div style={styles.cellStack}>
                        {entry.pucExpiry || 'N/A'} {expiryChip(entry.pucExpiry)}
                      </div>
                    </td>
                    <td>
                      <div style={styles.cellStack}>
                        {entry.registrationExpiry || 'N/A'} {expiryChip(entry.registrationExpiry)}
                      </div>
                    </td>
                    <td>
                      <div style={styles.rowActions}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(entry)}>Edit</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  section: { display: 'grid', gap: '12px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 800 },
  cellStack: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  rowActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
};

export default DocumentsPage;