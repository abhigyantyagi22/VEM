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

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
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
    <div className="modal-overlay" onClick={closeForgot}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        {forgotStep === 1 && (
          <>
            <div className="modal-head">
              <h3 className="modal-title">Forgot Password</h3>
              <button type="button" className="modal-close" onClick={closeForgot} aria-label="Close">×</button>
            </div>
            <p style={styles.modalSub}>Enter the email and registered phone number to verify your identity.</p>
            <form onSubmit={handleVerifyPhone} style={styles.modalForm}>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="field">
                <label className="field-label">Registered Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                />
              </div>
              {forgotError && <div className="alert alert-error">{forgotError}</div>}
              <div style={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={closeForgot}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </>
        )}

        {forgotStep === 2 && (
          <>
            <div className="modal-head">
              <h3 className="modal-title">Create New Password</h3>
              <button type="button" className="modal-close" onClick={closeForgot} aria-label="Close">×</button>
            </div>
            <p style={styles.modalSub}>Phone verified ✓ — enter your new password below.</p>
            <form onSubmit={handleResetPassword} style={styles.modalForm}>
              <div className="field">
                <label className="field-label">New Password</label>
                <div style={styles.pwWrap}>
                  <input
                    className="input"
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px' }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPw(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Confirm New Password</label>
                <div style={styles.pwWrap}>
                  <input
                    className="input"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmNew}
                    onChange={e => setConfirmNew(e.target.value)}
                    required
                    style={{ paddingRight: '48px' }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                    {showConfirmPw ? '🙈' : '👁'}
                  </button>
                </div>
                {confirmNew && confirmNew !== newPassword && (
                  <p style={styles.matchBad}>Passwords do not match</p>
                )}
                {confirmNew && confirmNew === newPassword && (
                  <p style={styles.matchGood}>✓ Passwords match</p>
                )}
              </div>
              {forgotError && <div className="alert alert-error">{forgotError}</div>}
              <div style={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setForgotStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}

        {forgotStep === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 className="modal-title" style={{ marginBottom: '8px' }}>Password Reset!</h3>
            <p style={styles.modalSub}>Your password has been updated successfully.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={closeForgot}
              style={{ marginTop: '20px', width: '100%' }}
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
      <div style={styles.orbA} aria-hidden="true" />
      <div style={styles.orbB} aria-hidden="true" />

      <div className="anim-pop" style={styles.card}>
        <div style={styles.branding}>
          <span style={styles.logo}>⬡</span>
          <h1 style={styles.brandText}>Wheel<span style={styles.brandAccent}>Sync</span></h1>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to manage your fleet</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label className="field-label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <div style={styles.labelRow}>
              <label className="field-label">Password</label>
              <button type="button" onClick={openForgot} style={styles.forgotLink}>Forgot password?</button>
            </div>
            <div style={styles.pwWrap}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={styles.switchText}>
          New to WheelSync? <Link to="/register" style={styles.switchLink}>Create an account</Link>
        </p>
      </div>

      {showForgot && renderForgotModal()}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  orbA: {
    position: 'absolute',
    width: '460px',
    height: '460px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.22), transparent 65%)',
    top: '-120px',
    left: '-100px',
    filter: 'blur(20px)',
    animation: 'float-y 7s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orbB: {
    position: 'absolute',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 65%)',
    bottom: '-160px',
    right: '-120px',
    filter: 'blur(20px)',
    animation: 'float-y 9s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '430px',
    background: 'var(--glass-strong)',
    border: '1px solid var(--glass-border)',
    borderRadius: '26px',
    padding: '38px 34px',
    boxShadow: 'var(--shadow-pop), inset 0 1px 0 var(--glass-highlight)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    position: 'relative',
    zIndex: 1,
  },
  branding: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '26px',
  },
  logo: {
    fontSize: '30px',
    background: 'var(--accent-grad)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  brandText: { margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--text-1)' },
  brandAccent: {
    background: 'var(--accent-grad)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  title: { margin: 0, fontSize: '26px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.4px' },
  subtitle: { margin: '6px 0 26px', textAlign: 'center', color: 'var(--text-2)', fontSize: '14px' },
  form: { display: 'grid', gap: '18px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-1)',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
  },
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    opacity: 0.7,
  },
  switchText: { textAlign: 'center', marginTop: '24px', marginBottom: 0, color: 'var(--text-2)', fontSize: '14px' },
  switchLink: { color: 'var(--accent-1)', fontWeight: 700, textDecoration: 'none' },
  modalSub: { color: 'var(--text-2)', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.6 },
  modalForm: { display: 'grid', gap: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
  matchBad: { margin: '4px 0 0', fontSize: '12px', color: 'var(--danger)', fontWeight: 600 },
  matchGood: { margin: '4px 0 0', fontSize: '12px', color: 'var(--success)', fontWeight: 600 },
};

export default Login;