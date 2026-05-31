import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = phone verify, 2 = new password, 3 = success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const token = typeof res.data === 'string' ? res.data : (res.data?.token || res.data?.accessToken || JSON.stringify(res.data));
      login(token);
      navigate('/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        setError('Invalid email or password.');
      } else if (status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Login failed. Please check email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openForgot = () => {
    setForgotEmail(email.trim());
    setForgotPhone('');
    setNewPassword('');
    setConfirmNew('');
    setForgotError('');
    setForgotStep(1);
    setShowForgot(true);
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotError('');
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(forgotPhone)) {
      setForgotError('Phone number must be exactly 10 digits.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/verify-phone', { email: forgotEmail.trim(), phone: forgotPhone });
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data || 'Verification failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNew) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/reset-password', { email: forgotEmail.trim(), password: newPassword });
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data || 'Could not reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForgotModal = () => (
    <div style={styles.modalOverlay} onClick={closeForgot}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        {/* Step 1 — Phone Verification */}
        {forgotStep === 1 && (
          <>
            <h3 style={styles.modalTitle}>Forgot Password</h3>
            <p style={styles.modalSub}>Enter the email and registered phone number to verify your identity.</p>
            <form onSubmit={handleVerifyPhone} style={styles.modalForm}>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  style={styles.modalInput}
                  placeholder="you@example.com"
                />
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Registered Phone Number</label>
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  maxLength={10}
                  style={styles.modalInput}
                  placeholder="10-digit number"
                />
              </div>
              {forgotError && <p style={styles.modalError}>{forgotError}</p>}
              <div style={styles.modalActions}>
                <button type="button" onClick={closeForgot} style={styles.modalCancelBtn}>Cancel</button>
                <button type="submit" disabled={forgotLoading} style={styles.modalPrimaryBtn}>
                  {forgotLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 2 — New Password */}
        {forgotStep === 2 && (
          <>
            <h3 style={styles.modalTitle}>Create New Password</h3>
            <p style={styles.modalSub}>Phone verified ✓ — Enter your new password below.</p>
            <form onSubmit={handleResetPassword} style={styles.modalForm}>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>New Password</label>
                <div style={styles.pwWrap}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ ...styles.modalInput, paddingRight: '44px' }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPw(p => !p)} style={styles.modalEyeBtn} tabIndex={-1}>
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Confirm New Password</label>
                <div style={styles.pwWrap}>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmNew}
                    onChange={e => setConfirmNew(e.target.value)}
                    required
                    style={{ ...styles.modalInput, paddingRight: '44px' }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} style={styles.modalEyeBtn} tabIndex={-1}>
                    {showConfirmPw ? '🙈' : '👁'}
                  </button>
                </div>
                {confirmNew && confirmNew !== newPassword && (
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Passwords do not match</p>
                )}
                {confirmNew && confirmNew === newPassword && (
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>✓ Passwords match</p>
                )}
              </div>
              {forgotError && <p style={styles.modalError}>{forgotError}</p>}
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setForgotStep(1)} style={styles.modalCancelBtn}>Back</button>
                <button type="submit" disabled={forgotLoading} style={styles.modalPrimaryBtn}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3 — Success */}
        {forgotStep === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ ...styles.modalTitle, marginBottom: '8px' }}>Password Reset!</h3>
            <p style={styles.modalSub}>Your password has been updated successfully.</p>
            <button
              type="button"
              onClick={() => { closeForgot(); }}
              style={{ ...styles.modalPrimaryBtn, marginTop: '20px', width: '100%' }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlur} />

      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.cardBranding}>
            <div style={styles.logo}>🛞</div>
            <h1 style={styles.brandText}>WheelSync</h1>
          </div>

          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Sign in to manage your vehicles</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  style={{ ...styles.input, paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <button type="button" onClick={openForgot} style={styles.forgotLink}>
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{...styles.loginButton, opacity: isLoading ? 0.7 : 1}}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.divider} />

          <p style={styles.registerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.registerLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {showForgot && renderForgotModal()}
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 50%, #14b8a6 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundBlur: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(15, 118, 110, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  card: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.09))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '28px',
    padding: '24px 80px',
    maxWidth: '95vw',
    width: '100%',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
  },
  cardBranding: {
    display: 'grid',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: '10px',
  },
  logo: {
    fontSize: '24px',
    color: '#14b8a6',
    fontWeight: 800,
    textShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
    textAlign: 'center',
  },
  brandText: {
    margin: '0',
    fontSize: '24px',
    fontWeight: 800,
    color: '#06b6d4',
    textAlign: 'center',
  },
  cardHeader: {
    display: 'grid',
    gap: '4px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    color: '#0d5d56',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#0a3d3a',
    fontWeight: 500,
  },
  form: {
    display: 'grid',
    gap: '10px',
  },
  fieldGroup: {
    display: 'grid',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0a3d3a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    lineHeight: 1,
    color: '#0a3d3a',
  },
  forgotLink: {
    background: 'transparent',
    border: 'none',
    color: '#0a3d3a',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'right',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  input: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(20, 184, 166, 0.4)',
    background: 'rgba(255, 255, 255, 0.88)',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#0a3d3a',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#b91c1c',
    fontSize: '13px',
    fontWeight: 600,
  },
  loginButton: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#000000',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    marginTop: '2px',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.4), transparent)',
    margin: '8px 0',
  },
  registerText: {
    margin: 0,
    fontSize: '12px',
    color: '#0a3d3a',
    fontWeight: 500,
    textAlign: 'center',
  },
  registerLink: {
    color: '#000000',
    textDecoration: 'none',
    fontWeight: 700,
    transition: 'all 0.3s ease',
  },
  // Forgot Password Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 9000,
  },
  modalCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '22px',
    padding: '28px 28px 24px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
    border: '1px solid rgba(20,184,166,0.2)',
  },
  modalTitle: {
    margin: '0 0 6px',
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
  },
  modalSub: {
    margin: '0 0 20px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.5,
  },
  modalForm: {
    display: 'grid',
    gap: '14px',
  },
  modalField: {
    display: 'grid',
    gap: '5px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  modalInput: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid #dbe3ee',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#1f2937',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  pwWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  modalEyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: 0,
    color: '#475569',
  },
  modalError: {
    margin: 0,
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: 600,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  modalCancelBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#f1f5f9',
    color: '#475569',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalPrimaryBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(15,118,110,0.3)',
  },
};

export default Login;
