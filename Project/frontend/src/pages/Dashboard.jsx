import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import VehicleIssueChatbot from '../components/VehicleIssueChatbot';
import { useTheme } from '../context/ThemeContext';

const NAV_GRADIENT = 'linear-gradient(130deg, rgba(15, 23, 42, 0.72), rgba(15, 118, 110, 0.4))';
const NAV_ACTIVE_GRADIENT = 'linear-gradient(130deg, rgba(20, 184, 166, 0.84), rgba(13, 148, 136, 0.72))';

const Dashboard = () => {
    const { userId } = useAuth();
    const { theme } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({
        vehicleName: '',
        vehicleNumber: '',
        vehicleType: '',
        purchaseDate: '',
    });
    const [addingVehicle, setAddingVehicle] = useState(false);
    const [vehicleError, setVehicleError] = useState('');
    const [fleetData, setFleetData] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            if (!userId) {
                console.log('[Dashboard] Skipping fetchVehicles: userId is', userId);
                setLoading(false);
                return;
            }
            try {
                console.log('[Dashboard] Fetching vehicles for userId:', userId);
                const res = await api.get(`/vehicles?userId=${userId}`);
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

    const chartData = dashboardData?.monthlyExpenses 
        ? Object.entries(dashboardData.monthlyExpenses).map(([month, cost]) => ({ month, cost }))
        : [];

    const formatRupees = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    };

    const resetVehicleForm = () => {
        setVehicleForm({
            vehicleName: '',
            vehicleNumber: '',
            vehicleType: '',
            purchaseDate: '',
        });
        setVehicleError('');
    };

    const closeVehicleModal = () => {
        setShowVehicleModal(false);
        resetVehicleForm();
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setAddingVehicle(true);
        setVehicleError('');

        try {
            const res = await api.post('/vehicles', { ...vehicleForm, userId });
            setVehicles(prev => [...prev, res.data]);
            setSelectedVehicle(res.data.id);
            closeVehicleModal();
        } catch (err) {
            console.error(err);
            const message = err.response?.data || err.message || 'Please check the details and try again.';
            setVehicleError(`Could not add vehicle. ${message}`);
        } finally {
            setAddingVehicle(false);
        }
    };

    const renderVehicleModal = () => (
        <div style={styles.modalOverlay} role="presentation" onClick={closeVehicleModal}>
            <div style={{ ...styles.modal, background: theme.bgModal }} role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title" onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 id="add-vehicle-title" style={{ ...styles.modalTitle, color: theme.textPrimary }}>Add Vehicle</h2>
                    <button type="button" onClick={closeVehicleModal} style={styles.closeButton} aria-label="Close">×</button>
                </div>
                <form onSubmit={handleAddVehicle} style={styles.modalForm}>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Vehicle Name
                        <input
                            type="text"
                            value={vehicleForm.vehicleName}
                            onChange={e => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })}
                            placeholder="Honda City"
                            required
                            style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                        />
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Vehicle Number
                        <input
                            type="text"
                            value={vehicleForm.vehicleNumber}
                            onChange={e => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                            placeholder="MH 12 AB 1234"
                            required
                            style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                        />
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Vehicle Type
                        <select
                            value={vehicleForm.vehicleType}
                            onChange={e => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                            required
                            style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                        >
                            <option value="">Select type</option>
                            <option value="Car">Car</option>
                            <option value="Bike">Bike</option>
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    <label style={{ ...styles.fieldLabel, color: theme.textSecondary }}>
                        Purchase Date
                        <input
                            type="date"
                            value={vehicleForm.purchaseDate}
                            onChange={e => setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })}
                            required
                            style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                        />
                    </label>
                    {vehicleError && <p style={styles.errorText}>{vehicleError}</p>}
                    <div style={styles.modalActions}>
                        <button type="button" onClick={closeVehicleModal} style={styles.secondaryButton}>Cancel</button>
                        <button type="submit" disabled={addingVehicle} style={styles.primaryButton}>
                            {addingVehicle ? 'Adding...' : '+ Add Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (loading && vehicles.length === 0) {
        return <div style={styles.centerText}><h3>Loading your smart dashboard...</h3></div>;
    }

    if (vehicles.length === 0) {
        return (
            <div style={styles.emptyStateContainer}>
                <h1 style={styles.gradientText}>Welcome to WheelSync! 🛞</h1>
                <p style={styles.subText}>You currently have zero vehicles registered in your garage.</p>
                <div style={styles.emptyCard}>
                    <h2 style={{color: '#2d3436'}}>Get Started</h2>
                    <p style={{color: '#636e72'}}>Add your first vehicle to unlock real-time expense tracking, maintenance alerts, and analytics.</p>
                    <button type="button" onClick={() => setShowVehicleModal(true)} style={styles.primaryButton}>
                        + Add Vehicle
                    </button>
                </div>
                {showVehicleModal && renderVehicleModal()}
                <VehicleIssueChatbot />
            </div>
        );
    }

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.header}>
                <h1 style={styles.gradientText}>Vehicle Analytics Dashboard</h1>
                <button 
                    type="button" 
                    onClick={() => setShowVehicleModal(true)} 
                    style={styles.addVehicleButton}
                >
                    + Add Vehicle
                </button>
            </div>

            {fleetData && (
                <div style={fleetStyles.section}>
                    <h2 style={fleetStyles.heading}>Fleet Overview</h2>
                    <div style={fleetStyles.statsRow}>
                        <div style={fleetStyles.card}>
                            <div style={fleetStyles.cardLabel}>Total Fleet Expense</div>
                            <div style={fleetStyles.cardValue}>{formatRupees(fleetData.totalFleetExpense)}</div>
                        </div>
                        <div style={fleetStyles.card}>
                            <div style={fleetStyles.cardLabel}>Fuel Spend</div>
                            <div style={fleetStyles.cardValue}>{formatRupees(fleetData.totalFuelCost)}</div>
                        </div>
                        <div style={fleetStyles.card}>
                            <div style={fleetStyles.cardLabel}>Maintenance Spend</div>
                            <div style={fleetStyles.cardValue}>{formatRupees(fleetData.totalMaintenanceCost)}</div>
                        </div>
                        <div style={fleetStyles.card}>
                            <div style={fleetStyles.cardLabel}>Vehicles</div>
                            <div style={fleetStyles.cardValue}>{fleetData.totalVehicles}</div>
                        </div>
                    </div>

                    {fleetData.vehicleExpenses && fleetData.vehicleExpenses.length > 0 && (
                        <div style={fleetStyles.breakdown}>
                            <div style={fleetStyles.breakdownTitle}>Expense by Vehicle</div>
                            {fleetData.vehicleExpenses.map((v, i) => {
                                const pct = fleetData.totalFleetExpense > 0
                                    ? (v.totalExpense / fleetData.totalFleetExpense) * 100
                                    : 0;
                                return (
                                    <div key={v.vehicleId} style={fleetStyles.barRow}>
                                        <div style={fleetStyles.barLabel}>
                                            <span style={fleetStyles.barName}>{v.vehicleName}</span>
                                            <span style={fleetStyles.barNum}>{v.vehicleNumber}</span>
                                        </div>
                                        <div style={fleetStyles.barTrack}>
                                            <div style={{ ...fleetStyles.barFill, width: `${pct.toFixed(1)}%`, opacity: 1 - i * 0.15 }} />
                                        </div>
                                        <div style={fleetStyles.barAmt}>{formatRupees(v.totalExpense)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {fleetData.upcomingAlerts && fleetData.upcomingAlerts.length > 0 && (
                        <div style={fleetStyles.alerts}>
                            <div style={fleetStyles.alertsTitle}>Upcoming Alerts</div>
                            {fleetData.upcomingAlerts.map((msg, i) => (
                                <div key={i} style={fleetStyles.alertItem}>⚠ {msg}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div style={styles.selectorWrapper}>
                <label style={styles.label}>Select Vehicle:</label>
                <div style={styles.selectBoxContainer}>
                    <select 
                        style={styles.selectBox} 
                        value={selectedVehicle} 
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.vehicleName} - {v.vehicleNumber}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={styles.centerText}><h4>Loading vehicle metrics...</h4></div>
            ) : dashboardData ? (
                <div style={styles.content}>
                    <div style={styles.statsGrid}>
                        <div style={{...styles.statCard, borderTop: '4px solid #14b8a6', background: theme.bgCard }}>
                            <h3 style={{ ...styles.cardTitle, color: theme.textSecondary }}>Total Expense</h3>
                            <p style={{ ...styles.cardValue, color: theme.textPrimary }}>{formatRupees(dashboardData.totalExpense)}</p>
                        </div>
                        <div style={{...styles.statCard, borderTop: '4px solid #0f766e', background: theme.bgCard }}>
                            <h3 style={{ ...styles.cardTitle, color: theme.textSecondary }}>Vehicle Mileage</h3>
                            <p style={{ ...styles.cardValue, color: theme.textPrimary }}>{dashboardData.mileage || 0} <span style={styles.unit}>km/l</span></p>
                        </div>
                        <div style={{...styles.statCard, borderTop: '4px solid #14b8a6', background: theme.bgCard }}>
                            <h3 style={{ ...styles.cardTitle, color: theme.textSecondary }}>Cost per Km</h3>
                            <p style={{ ...styles.cardValue, color: theme.textPrimary }}>{formatRupees(dashboardData.costPerKm)}</p>
                        </div>
                    </div>

                    <div style={{ ...styles.chartSection, background: theme.bgCard }}>
                        <h3 style={{ ...styles.chartTitle, color: theme.textPrimary }}>Monthly Expense Overview</h3>
                        {chartData.length > 0 ? (
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                        <XAxis dataKey="month" stroke="#888" tick={{fill: '#636e72', fontWeight: 600}} />
                                        <YAxis stroke="#888" tick={{fill: '#636e72', fontWeight: 600}} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e1e5eb', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: '#0f766e', fontWeight: 'bold' }}
                                            formatter={(value) => [formatRupees(value), 'Expense']}
                                        />
                                        <Bar dataKey="cost" fill="url(#colorCost)" radius={[6, 6, 0, 0]} />
                                        <defs>
                                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.95}/>
                                                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.85}/>
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={styles.noData}>
                                <div style={{fontSize: '40px', marginBottom: '10px'}}>📊</div>
                                No expense logs yet. Add fuel or maintenance records to see analytics!
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={styles.centerText}><h4>No data found for this vehicle.</h4></div>
            )}

            {showVehicleModal && renderVehicleModal()}
            <VehicleIssueChatbot />
        </div>
    );
};

const styles = {
    dashboardContainer: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '10px 40px 40px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '20px',
    },
    gradientText: {
        margin: 0,
        fontSize: '32px',
        fontWeight: '800',
        background: NAV_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    addVehicleButton: {
        padding: '12px 24px',
        background: NAV_ACTIVE_GRADIENT,
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        fontWeight: '700',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
    },
    selectorWrapper: {
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        padding: '10px 20px',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #edf2f7',
        marginBottom: '40px',
        width: 'fit-content',
    },
    label: {
        marginRight: '12px',
        fontWeight: 'bold',
        color: '#636e72',
    },
    selectBoxContainer: {
        position: 'relative',
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
        appearance: 'none',
        minWidth: '220px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '25px',
        marginBottom: '40px',
    },
    statCard: {
        background: '#fff',
        padding: '30px 25px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid #f1f3f5',
    },
    cardTitle: {
        margin: '0 0 10px 0',
        fontSize: '15px',
        color: '#636e72',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        fontWeight: '700',
    },
    cardValue: {
        margin: 0,
        fontSize: '40px',
        fontWeight: '800',
        color: '#2d3436',
    },
    unit: {
        fontSize: '16px',
        color: '#a0aec0',
        fontWeight: '600',
    },
    chartSection: {
        background: '#fff',
        padding: '35px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #f1f3f5',
    },
    chartTitle: {
        margin: '0 0 30px 0',
        color: '#2d3436',
        fontSize: '20px',
        fontWeight: '700',
    },
    emptyStateContainer: {
        textAlign: 'center',
        padding: '80px 20px',
    },
    subText: {
        fontSize: '18px',
        color: '#636e72',
        marginTop: '15px',
        fontWeight: '500',
    },
    emptyCard: {
        background: '#fff',
        maxWidth: '500px',
        margin: '40px auto',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
        border: '1px solid #f8f9fa',
    },
    primaryButton: {
        display: 'inline-block',
        marginTop: '30px',
        padding: '16px 36px',
        background: NAV_ACTIVE_GRADIENT,
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '700',
        borderRadius: '30px',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
    },
    secondaryButton: {
        padding: '14px 24px',
        background: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '15px',
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
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '8px',
    },
    errorText: {
        margin: 0,
        color: '#dc3545',
        fontWeight: '700',
        fontSize: '14px',
    },
    centerText: {
        textAlign: 'center',
        padding: '50px',
        color: '#636e72',
    },
    noData: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#a0aec0',
        fontWeight: '500',
        fontSize: '16px',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '2px dashed #e2e8f0',
    }
};

const fleetStyles = {
    section: {
        background: '#fff',
        borderRadius: '22px',
        border: '1px solid #f1f3f5',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        padding: '28px',
        marginBottom: '8px',
    },
    heading: {
        margin: '0 0 20px',
        fontSize: '20px',
        fontWeight: 700,
        color: '#0f172a',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
    },
    card: {
        background: 'linear-gradient(130deg, rgba(236,253,250,0.8), rgba(240,249,255,0.7))',
        border: '1px solid rgba(153, 246, 228, 0.4)',
        borderRadius: '14px',
        padding: '16px 18px',
    },
    cardLabel: {
        fontSize: '12px',
        fontWeight: 700,
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '6px',
    },
    cardValue: {
        fontSize: '22px',
        fontWeight: 800,
        color: '#0f172a',
    },
    breakdown: {
        marginBottom: '20px',
    },
    breakdownTitle: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#475569',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
    },
    barRow: {
        display: 'grid',
        gridTemplateColumns: '180px 1fr 110px',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    barLabel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        minWidth: 0,
    },
    barName: {
        fontWeight: 700,
        fontSize: '14px',
        color: '#1e293b',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    barNum: {
        fontSize: '12px',
        color: '#94a3b8',
    },
    barTrack: {
        height: '10px',
        background: '#f1f5f9',
        borderRadius: '999px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #14b8a6, #0f766e)',
        borderRadius: '999px',
        transition: 'width 0.4s ease',
    },
    barAmt: {
        textAlign: 'right',
        fontWeight: 700,
        fontSize: '14px',
        color: '#0f172a',
    },
    alerts: {
        background: 'rgba(254, 243, 199, 0.6)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'grid',
        gap: '8px',
    },
    alertsTitle: {
        fontSize: '13px',
        fontWeight: 700,
        color: '#92400e',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
    },
    alertItem: {
        fontSize: '14px',
        color: '#78350f',
        fontWeight: 500,
    },
};

export default Dashboard;
