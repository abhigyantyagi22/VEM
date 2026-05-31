import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { ThemeProvider } from './context/ThemeContext';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VehicleList = lazy(() => import('./pages/VehicleList'));
const DriverManagement = lazy(() => import('./pages/DriverManagement'));
const FuelLogs = lazy(() => import('./pages/FuelLogs'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const VehicleWorkspace = lazy(() => import('./pages/VehicleWorkspace'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const routeFallbackStyles = {
  minHeight: '35vh',
  display: 'grid',
  placeItems: 'center',
  color: '#475569',
  fontWeight: 700,
};

const appShellStyles = {
  padding: '78px 20px 110px',
};

const authShellStyles = {
  padding: 0,
  height: '100vh',
  overflow: 'hidden',
};

const AppContent = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <Navbar />
      <div style={isAuthRoute ? authShellStyles : appShellStyles}>
        <Suspense fallback={<div style={routeFallbackStyles}>Loading page...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/vehicles" element={<PrivateRoute><VehicleList /></PrivateRoute>} />
            <Route path="/vehicles/:id/manage" element={<PrivateRoute><VehicleWorkspace /></PrivateRoute>} />
            <Route path="/drivers" element={<PrivateRoute><DriverManagement /></PrivateRoute>} />
            <Route path="/vehicles/:id/drivers" element={<PrivateRoute><DriverManagement /></PrivateRoute>} />
            <Route path="/vehicles/:id/fuel" element={<PrivateRoute><FuelLogs /></PrivateRoute>} />
            <Route path="/vehicles/:id/maintenance" element={<PrivateRoute><MaintenancePage /></PrivateRoute>} />
            <Route path="/vehicles/:id/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
