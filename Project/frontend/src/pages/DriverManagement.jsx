import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';

const DriverManagement = () => {
    const { id } = useParams();
    const { userId } = useAuth();
    const { theme } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [allDrivers, setAllDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [form, setForm] = useState({ driverName: '', licenseNumber: '', contact: '', vehicleId: '' });
    const [addingDriver, setAddingDriver] = useState(false);
    const [driverError, setDriverError] = useState('');
    const [selectedUnassignedDriver, setSelectedUnassignedDriver] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                if (!userId) {
                    console.log('[DriverManagement] Skipping fetch: userId not available');
                    return;
                }
                const res = await api.get(`/vehicles?userId=${userId}`);
                setVehicles(res.data);
            } catch(e) {
                console.error(e);
            }
        };
        fetchVehicles();
    }, [userId]);

    const fetchAllDrivers = async () => {
        try {
            // Try to fetch all drivers directly
            try {
                const res = await api.get('/drivers');
                const vehicleById = new Map((vehicles || []).map(v => [String(v.id), v]));
                const list = (res.data || []).map(d => ({
                    ...d,
                    vehicleId: d.vehicleId || '',
                    vehicleName: d.vehicleId ? (vehicleById.get(String(d.vehicleId))?.vehicleName || '') : '',
                    vehicleNumber: d.vehicleId ? (vehicleById.get(String(d.vehicleId))?.vehicleNumber || '') : '',
                }));
                setAllDrivers(list);
                return;
            } catch (e) {
                // Fall back to per-vehicle fetch
            }

            const allDriversList = [];
            for (const vehicle of vehicles) {
                try {
                    const res = await api.get(`/drivers/${vehicle.id}`);
                    res.data.forEach(driver => {
                        allDriversList.push({ ...driver, vehicleId: vehicle.id, vehicleName: vehicle.vehicleName, vehicleNumber: vehicle.vehicleNumber });
                    });
                } catch(e) {
                    console.error(e);
                }
            }
            setAllDrivers(allDriversList);
        } catch(e) { 
            console.error(e); 
        }
    };

    useEffect(() => {
        if (vehicles.length > 0) {
            fetchAllDrivers();
        }
    }, [vehicles]);

    const resetForm = () => {
        setForm({ driverName: '', licenseNumber: '', contact: '', vehicleId: '' });
        setDriverError('');
        setEditingDriver(null);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const isValidContact = (contact) => {
        return /^\d{10}$/.test(contact);
    };

    const isDuplicateLicense = (licenseNumber, excludeId = null) => {
        return allDrivers.some(d => d.licenseNumber === licenseNumber && d.id !== excludeId);
    };

    const vehicleAlreadyHasDriver = (vehicleId, excludeDriverId = null) => {
        if (!vehicleId) {
            return false;
        }
        return allDrivers.some(d => d.vehicleId === parseInt(vehicleId) && d.id !== excludeDriverId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddingDriver(true);
        setDriverError('');
        
        // Frontend validations
        if (!isValidContact(form.contact)) {
            setDriverError('Contact must be exactly 10 digits');
            setAddingDriver(false);
            return;
        }
        
        if (isDuplicateLicense(form.licenseNumber, editingDriver)) {
            setDriverError('A driver with this license number already exists');
            setAddingDriver(false);
            return;
        }

        // Check if vehicle already has a driver (only if adding new driver or changing vehicle)
        if (!editingDriver || (editingDriver && allDrivers.find(d => d.id === editingDriver)?.vehicleId !== parseInt(form.vehicleId))) {
            if (vehicleAlreadyHasDriver(form.vehicleId, editingDriver)) {
                setDriverError('This vehicle already has a driver assigned. Each vehicle can only have one driver.');
                setAddingDriver(false);
                return;
            }
        }

        try {
            const payload = { driverName: form.driverName, licenseNumber: form.licenseNumber, contact: form.contact };
            if (form.vehicleId) payload.vehicleId = Number(form.vehicleId);

            if (editingDriver) {
                // Update driver
                await api.put(`/drivers/${editingDriver}`, payload);
            } else {
                // Add new driver (may be unassigned)
                await api.post('/drivers', payload);
            }
            fetchAllDrivers();
            closeModal();
        } catch(e) {
            console.error(e);
            const message = e.response?.data || e.message || 'Please check the details and try again.';
            setDriverError(`${editingDriver ? 'Could not update' : 'Could not add'} driver. ${message}`);
        } finally {
            setAddingDriver(false);
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver.id);
        setForm({
            driverName: driver.driverName,
            licenseNumber: driver.licenseNumber,
            contact: driver.contact,
            vehicleId: driver.vehicleId,
        });
        setShowModal(true);
    };

    const handleDelete = async (driverId) => {
        if (window.confirm('Delete driver?')) {
            try {
                await api.delete(`/drivers/${driverId}`);
                fetchAllDrivers();
            } catch(e) { console.error(e); }
        }
    };

    const assignUnassignedToVehicle = async () => {
        if (!id || !selectedUnassignedDriver) return;
        try {
            const selectedDriver = allDrivers.find(d => String(d.id) === String(selectedUnassignedDriver));
            if (!selectedDriver) {
                alert('Selected driver not found');
                return;
            }

            await api.put(`/drivers/${selectedUnassignedDriver}/assign`, {
                vehicleId: Number(id),
            });
            // Refresh lists
            fetchAllDrivers();
            setSelectedUnassignedDriver('');
            alert('Driver assigned to vehicle');
        } catch (e) {
            console.error(e);
            const message = e.response?.data || e.message || 'Could not assign driver';
            alert(message);
        }
    };

    const renderModal = () => (
        <div style={styles.modalOverlay} role="presentation" onClick={closeModal}>
            <div style={{ ...styles.modal, background: theme.bgModal }} role="dialog" aria-modal="true" aria-labelledby="add-driver-title" onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 id="add-driver-title" style={{ ...styles.modalTitle, color: theme.textPrimary }}>{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
                    <button type="button" onClick={closeModal} style={styles.closeButton} aria-label="Close">×</button>
                </div>
                <form onSubmit={handleSubmit} style={styles.modalForm}>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Driver Name
                        <input
                            type="text"
                            value={form.driverName}
                            onChange={e => setForm({ ...form, driverName: e.target.value })}
                            placeholder="John Doe"
                            required
                            style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                        />
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        License Number
                        <input
                            type="text"
                            value={form.licenseNumber}
                            onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                            placeholder="DL0123456789"
                            required
                            style={{
                                ...styles.input,
                                background: theme.bgInput,
                                color: theme.textPrimary,
                                borderColor: isDuplicateLicense(form.licenseNumber, editingDriver) ? '#ff4757' : theme.borderInput,
                            }}
                        />
                        {isDuplicateLicense(form.licenseNumber, editingDriver) && (
                            <small style={{ color: '#ff4757', fontWeight: '500', marginTop: '5px', display: 'block' }}>
                                ⚠️ This license number is already in use
                            </small>
                        )}
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Contact Info (10 digits)
                        <input
                            type="tel"
                            value={form.contact}
                            onChange={e => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setForm({ ...form, contact: value });
                            }}
                            placeholder="9876543210"
                            maxLength="10"
                            required
                            style={{
                                ...styles.input,
                                background: theme.bgInput,
                                color: theme.textPrimary,
                                borderColor: form.contact && !isValidContact(form.contact) ? '#ff4757' : theme.borderInput,
                            }}
                        />
                        {form.contact && !isValidContact(form.contact) && (
                            <small style={{ color: '#ff4757', fontWeight: '500', marginTop: '5px', display: 'block' }}>
                                ⚠️ Please enter exactly 10 digits
                            </small>
                        )}
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Vehicle
                        <select
                            value={form.vehicleId}
                            onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                            style={{
                                ...styles.input,
                                background: theme.bgInput,
                                color: theme.textPrimary,
                                borderColor: vehicleAlreadyHasDriver(form.vehicleId, editingDriver) ? '#ff4757' : theme.borderInput,
                            }}
                        >
                            <option value="">No Vehicle</option>
                            {vehicles.map(v => {
                                const hasDriver = allDrivers.some(d => d.vehicleId === v.id);
                                return (
                                    <option key={v.id} value={v.id}>
                                        {v.vehicleName} - {v.vehicleNumber} {hasDriver ? '(Driver assigned)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        {vehicleAlreadyHasDriver(form.vehicleId, editingDriver) && !editingDriver && (
                            <small style={{ color: '#ff4757', fontWeight: '500', marginTop: '5px', display: 'block' }}>
                                ⚠️ This vehicle already has a driver assigned
                            </small>
                        )}
                    </label>
                    {driverError && <p style={styles.errorText}>{driverError}</p>}
                    <div style={styles.modalActions}>
                        <button type="button" onClick={closeModal} style={styles.secondaryButton}>Cancel</button>
                        <button type="submit" disabled={addingDriver} style={styles.primaryButton}>
                            {addingDriver ? 'Saving...' : (editingDriver ? 'Update Driver' : '+ Add Driver')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const scopedDrivers = id
        ? allDrivers.filter((driver) => String(driver.vehicleId) === String(id))
        : allDrivers;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>{id ? 'Assigned Driver' : 'Driver Management'}</h2>
                <button 
                    type="button" 
                    onClick={() => { setEditingDriver(null); resetForm(); setShowModal(true); }}
                    style={styles.addButton}
                >
                    {id ? 'Assign / Change Driver' : '+ Add Driver'}
                </button>
            </div>

            <ul style={styles.driverList}>
                {scopedDrivers.map(d => (
                    <li key={d.id} style={{ ...styles.driverItem, background: theme.bgItem, border: `1px solid ${theme.border}` }}>
                        <div style={styles.driverInfo}>
                            <strong style={{ ...styles.driverName, color: theme.textPrimary }}>{d.driverName}</strong>
                            <br />
                            <small style={styles.driverMeta}>License: {d.licenseNumber} | Contact: {d.contact}</small>
                            <br />
                            <small style={styles.vehicleMeta}>
                                Vehicle: {d.vehicleId ? `${d.vehicleName || 'Unknown'} - ${d.vehicleNumber || 'N/A'}` : '-'}
                            </small>
                        </div>
                        <div style={styles.actionButtons}>
                            <button 
                                onClick={() => handleEdit(d)} 
                                style={styles.editButton}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(d.id)} 
                                style={styles.deleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {scopedDrivers.length === 0 && (
                <div style={styles.emptyState}>
                    <p>{id ? 'No driver assigned yet. Click "Assign / Change Driver" to continue.' : 'No drivers added yet. Click "Add Driver" to get started!'}</p>
                </div>
            )}

            {/* When viewing a vehicle, allow assigning an unassigned driver at the bottom */}
            {id && (
                <div style={{marginTop: '20px'}}>
                    <h3 style={{marginBottom: '8px', color: '#0f766e'}}>Assign existing unassigned driver</h3>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        <select value={selectedUnassignedDriver} onChange={(e) => setSelectedUnassignedDriver(e.target.value)} style={{ ...styles.selectBox, background: theme.bgSelectBox, color: theme.textPrimary, borderColor: theme.borderSubtle }}>
                            <option value="">Select an unassigned driver</option>
                            {allDrivers.filter(d => !d.vehicleId).map(d => (
                                <option key={d.id} value={d.id}>{d.driverName} — {d.licenseNumber}</option>
                            ))}
                        </select>
                        <button onClick={assignUnassignedToVehicle} style={styles.primaryButton}>Assign to this vehicle</button>
                    </div>
                </div>
            )}

            {showModal && renderModal()}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '20px 40px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        gap: '20px',
    },
    title: {
        margin: 0,
        fontSize: '28px',
        fontWeight: '800',
        background: 'linear-gradient(130deg, #0f172a, #0f766e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    addButton: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        fontWeight: '700',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
    },
    selectorWrapper: {
        display: 'none',
    },
    label: {
        marginRight: '12px',
        fontWeight: 'bold',
        color: '#636e72',
    },
    selectBox: {
        padding: '10px 15px',
        borderRadius: '10px',
        border: '1px solid #dfe6e9',
        background: '#f8f9fa',
        color: '#2d3436',
        fontSize: '15px',
        outline: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        minWidth: '220px',
    },
    driverList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    driverItem: {
        border: '1px solid rgba(153, 246, 228, 0.4)',
        padding: '16px 18px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(236,253,250,0.72))',
        boxShadow: '0 14px 28px rgba(15, 23, 42, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        flexWrap: 'wrap',
        gap: '12px',
    },
    driverInfo: {
        display: 'grid',
        gap: '4px',
    },
    driverName: {
        fontSize: '22px',
        color: '#0f172a',
        letterSpacing: '0.1px',
    },
    driverMeta: {
        color: '#475569',
        fontWeight: '600',
    },
    vehicleMeta: {
        color: '#0f766e',
        fontWeight: '700',
    },
    actionButtons: {
        display: 'flex',
        gap: '8px',
    },
    editButton: {
        padding: '8px 14px',
        color: '#0f766e',
        background: 'linear-gradient(135deg, rgba(240,253,250,0.92), rgba(204,251,241,0.85))',
        border: '1px solid rgba(45, 212, 191, 0.45)',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    deleteButton: {
        padding: '8px 14px',
        color: 'white',
        background: 'linear-gradient(135deg, #fb7185, #e11d48)',
        border: '1px solid rgba(244, 63, 94, 0.45)',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    noVehicleText: {
        display: 'none',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#0f766e',
        background: 'linear-gradient(130deg, rgba(236,253,250,0.8), rgba(240,249,255,0.84))',
        borderRadius: '16px',
        border: '2px dashed rgba(45, 212, 191, 0.45)',
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.36)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 2000,
    },
    modal: {
        width: '100%',
        maxWidth: '520px',
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: '22px',
        border: '1px solid rgba(255, 255, 255, 0.78)',
        boxShadow: '0 30px 70px rgba(15, 23, 42, 0.22)',
        padding: '28px',
        textAlign: 'left',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    modalTitle: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '800',
        color: '#1f2937',
    },
    closeButton: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid #e2e8f0',
        background: '#fff',
        color: '#475569',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: '700',
        lineHeight: 1,
    },
    modalForm: {
        display: 'grid',
        gap: '16px',
    },
    fieldLabel: {
        display: 'grid',
        gap: '8px',
        color: '#475569',
        fontWeight: '700',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '13px 14px',
        borderRadius: '12px',
        border: '1px solid #dbe3ee',
        background: '#f8fafc',
        color: '#1f2937',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '8px',
    },
    primaryButton: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        fontWeight: '700',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 8px 20px rgba(0, 114, 255, 0.3)',
    },
    secondaryButton: {
        padding: '12px 24px',
        background: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '15px',
    },
    errorText: {
        margin: 0,
        color: '#dc3545',
        fontWeight: '700',
        fontSize: '14px',
    },
};

export default DriverManagement;
