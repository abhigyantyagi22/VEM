import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const MaintenancePage = () => {
    const { id } = useParams();
    const [logs, setLogs] = useState([]);
    const [form, setForm] = useState({ serviceType: '', cost: '', date: '', nextDue: '' });
    const [editingLogId, setEditingLogId] = useState(null);
    const today = new Date();

    const formatRupees = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/maintenance?vehicleId=${id}`);
            setLogs(res.data);
        } catch(e) { console.error(e); }
    };

    useEffect(() => { fetchLogs(); }, [id]);

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
        } catch(e) { console.error(e); }
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

    const handleDelete = async (logId) => {
        if (window.confirm('Are you sure you want to delete this maintenance record?')) {
            try {
                await api.delete(`/maintenance/${logId}`);
                setEditingLogId(null);
                setForm({ serviceType: '', cost: '', date: '', nextDue: '' });
                fetchLogs();
            } catch(e) { console.error(e); }
        }
    };

    const upcomingLogs = logs
        .filter((log) => log.nextDue && new Date(log.nextDue) >= today)
        .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

    return (
        <div style={styles.container}>
            <div style={styles.pageHeader}>
                <h2 style={styles.title}>Maintenance</h2>
                <p style={styles.subtitle}>Vehicle ID: {id}</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.formCard}>
                <input
                    type="text"
                    placeholder="Service Type"
                    value={form.serviceType}
                    onChange={e => setForm({...form, serviceType: e.target.value})}
                    required
                    style={styles.input}
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Cost (₹)"
                    value={form.cost}
                    onChange={e => setForm({...form, cost: e.target.value})}
                    required
                    style={styles.input}
                />
                <input
                    type="date"
                    placeholder="Date"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                    style={styles.input}
                />
                <input
                    type="date"
                    placeholder="Next Due"
                    value={form.nextDue}
                    onChange={e => setForm({...form, nextDue: e.target.value})}
                    style={styles.input}
                />
                <div style={styles.formActions}>
                    {editingLogId && (
                        <button type="button" onClick={handleCancelEdit} style={styles.secondaryButton}>Cancel Edit</button>
                    )}
                    <button type="submit" style={styles.addButton}>{editingLogId ? 'Update Record' : 'Add Record'}</button>
                </div>
            </form>

            <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Upcoming Maintenance</h3>
                {upcomingLogs.length === 0 ? (
                    <p style={styles.emptyText}>No upcoming maintenance due dates found.</p>
                ) : (
                    <ul style={styles.upcomingList}>
                        {upcomingLogs.map((log) => (
                            <li key={`upcoming-${log.id}`} style={styles.upcomingItem}>
                                <div style={styles.upcomingTextGroup}>
                                    <span style={styles.upcomingService}>{log.serviceType}</span>
                                    <span style={styles.upcomingDate}>Due: {log.nextDue}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" onClick={() => handleEdit(log)} style={styles.editButton}>Edit</button>
                                    <button type="button" onClick={() => handleDelete(log.id)} style={styles.deleteButton}>🗑️ Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Maintenance History</h3>
                <table border="1" cellPadding="10" width="100%" style={styles.table}>
                    <thead style={styles.tableHead}>
                        <tr>
                            <th>Date</th>
                            <th>Service</th>
                            <th>Cost (₹)</th>
                            <th>Next Due</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => {
                            const isPastDue = log.nextDue && new Date(log.nextDue) < new Date();
                            return (
                                <tr key={log.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                    <td style={styles.tableCell}>{log.date}</td>
                                    <td style={styles.tableCell}>{log.serviceType}</td>
                                    <td style={styles.tableCell}>{formatRupees(log.cost)}</td>
                                    <td style={{ ...styles.tableCell, ...(isPastDue ? styles.pastDueText : {}) }}>{log.nextDue || 'N/A'}</td>
                                    <td style={styles.tableCell}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button type="button" onClick={() => handleEdit(log)} style={styles.editButton}>Edit</button>
                                            <button type="button" onClick={() => handleDelete(log.id)} style={styles.deleteButton}>🗑️ Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1040px',
        margin: '0 auto',
        display: 'grid',
        gap: '16px',
    },
    pageHeader: {
        display: 'grid',
        gap: '4px',
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
    formCard: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
        border: '1px solid rgba(153, 246, 228, 0.4)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(45, 212, 191, 0.35)',
        background: 'rgba(255, 255, 255, 0.85)',
        boxSizing: 'border-box',
    },
    addButton: {
        padding: '10px 14px',
        borderRadius: '999px',
        border: 'none',
        background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
        color: '#fff',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        flexWrap: 'wrap',
        gridColumn: '1 / -1',
    },
    secondaryButton: {
        padding: '10px 14px',
        borderRadius: '999px',
        border: '1px solid rgba(45, 212, 191, 0.35)',
        background: 'rgba(255, 255, 255, 0.85)',
        color: '#0f766e',
        fontWeight: 700,
        cursor: 'pointer',
    },
    sectionCard: {
        borderRadius: '16px',
        background: 'linear-gradient(130deg, rgba(255,255,255,0.9), rgba(236,253,250,0.74))',
        border: '1px solid rgba(153, 246, 228, 0.4)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
        padding: '14px',
        overflowX: 'auto',
    },
    sectionTitle: {
        marginTop: 0,
        color: '#0f172a',
    },
    emptyText: {
        margin: 0,
        color: '#0f766e',
    },
    upcomingList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gap: '8px',
    },
    upcomingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '12px',
        background: 'rgba(240, 253, 250, 0.8)',
        border: '1px solid rgba(153, 246, 228, 0.36)',
    },
    upcomingTextGroup: {
        display: 'grid',
        gap: '2px',
    },
    upcomingService: {
        fontWeight: 700,
        color: '#0f172a',
    },
    upcomingDate: {
        color: '#0f766e',
        fontWeight: 700,
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
    pastDueText: {
        color: '#e11d48',
        fontWeight: 700,
    },
};

export default MaintenancePage;
