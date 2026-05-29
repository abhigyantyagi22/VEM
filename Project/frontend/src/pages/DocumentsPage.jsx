import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const DocumentsPage = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [doc, setDoc] = useState({ insuranceExpiry: '', pucExpiry: '', registrationExpiry: '' });
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
      // When no snapshot exists yet, the API can return 404.
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

  const formatDate = (value) => (value ? value : 'N/A');

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

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document record?')) {
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
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Documents Tracker</h2>
      <p style={styles.subtitle}>Vehicle ID: {id}</p>

      <form onSubmit={handleSubmit} style={{ ...styles.form, background: theme.bgCardGlass, border: `1px solid ${theme.border}` }}>
        <label style={{ ...styles.label, color: theme.textAccent }}>
          Insurance Expiry
          <input
            type="date"
            style={{ ...styles.input, background: theme.bgInputAlt, borderColor: theme.borderInputAlt, color: theme.textPrimary }}
            value={doc.insuranceExpiry}
            onChange={(e) => setDoc({ ...doc, insuranceExpiry: e.target.value })}
            required
          />
        </label>

        <label style={{ ...styles.label, color: theme.textAccent }}>
          PUC Expiry
          <input
            type="date"
            style={{ ...styles.input, background: theme.bgInputAlt, borderColor: theme.borderInputAlt, color: theme.textPrimary }}
            value={doc.pucExpiry}
            onChange={(e) => setDoc({ ...doc, pucExpiry: e.target.value })}
            required
          />
        </label>

        <label style={{ ...styles.label, color: theme.textAccent }}>
          Registration Expiry
          <input
            type="date"
            style={{ ...styles.input, background: theme.bgInputAlt, borderColor: theme.borderInputAlt, color: theme.textPrimary }}
            value={doc.registrationExpiry}
            onChange={(e) => setDoc({ ...doc, registrationExpiry: e.target.value })}
            required
          />
        </label>

        {error && <p style={styles.errorText}>{error}</p>}
        {successMessage && <p style={styles.successText}>{successMessage}</p>}

        <div style={styles.formActions}>
          {editingDocumentId && (
            <button type="button" style={styles.secondaryButton} onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
          <button type="submit" style={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : editingDocumentId ? 'Update Document Details' : 'Save Document Details'}
          </button>
        </div>
      </form>

      <h3 style={{ ...styles.sectionTitle, color: theme.textPrimary }}>Saved History</h3>
      {history.length === 0 ? (
        <p style={styles.emptyText}>No document history yet. Add your first entry above.</p>
      ) : (
        <table border="1" cellPadding="10" width="100%" style={{ ...styles.table, background: theme.bgTable }}>
          <thead style={{ background: theme.bgTableHead }}>
            <tr>
              <th>Version</th>
              <th>Insurance Expiry</th>
              <th>PUC Expiry</th>
              <th>Registration Expiry</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={entry.id || `${entry.vehicleId}-${index}`} style={{ background: index % 2 === 0 ? theme.bgTableRowEven : theme.bgTableRowOdd, color: theme.textPrimary }}>
                <td style={styles.tableCell}>{history.length - index}</td>
                <td style={styles.tableCell}>{formatDate(entry.insuranceExpiry)}</td>
                <td style={styles.tableCell}>{formatDate(entry.pucExpiry)}</td>
                <td style={styles.tableCell}>{formatDate(entry.registrationExpiry)}</td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEdit(entry)} style={styles.editButton}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(entry.id)} style={styles.deleteButton}>
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '980px',
    margin: '0 auto',
    display: 'grid',
    gap: '16px',
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
    margin: 0,
    color: '#0f766e',
    fontWeight: 600,
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    alignItems: 'end',
    background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
    gridColumn: '1 / -1',
  },
  label: {
    display: 'grid',
    gap: '6px',
    color: '#0f766e',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    background: 'rgba(255, 255, 255, 0.85)',
    boxSizing: 'border-box',
  },
  saveButton: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
  },
  secondaryButton: {
    padding: '10px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#0f766e',
    fontWeight: 700,
    cursor: 'pointer',
  },
  sectionTitle: {
    marginBottom: '4px',
    color: '#0f172a',
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
    padding: '8px 12px',
    borderRadius: '999px',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    background: 'linear-gradient(130deg, rgba(255,255,255,0.96), rgba(236,253,250,0.92))',
    color: '#0f766e',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  deleteButton: {
    padding: '8px 12px',
    borderRadius: '999px',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    background: 'linear-gradient(130deg, rgba(255,240,240,0.96), rgba(254,242,242,0.92))',
    color: '#dc2626',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emptyText: {
    margin: 0,
    color: '#0f766e',
  },
  errorText: {
    margin: 0,
    color: '#dc2626',
    fontWeight: 700,
    gridColumn: '1 / -1',
  },
  successText: {
    margin: 0,
    color: '#16a34a',
    fontWeight: 700,
    gridColumn: '1 / -1',
  },
};

export default DocumentsPage;
