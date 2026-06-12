import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const getStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: 'Weak', color: 'var(--danger)', pct: '33%' };
  if (score <= 3) return { label: 'Medium', color: 'var(--warning)', pct: '66%' };
  return { label: 'Strong', color: 'var(--success)', pct: '100%' };
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        setError('Invalid input. Please check the form and try again.');
      } else if (status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.orbA} aria-hidden="true" />
      <div style={styles.orbB} aria-hidden="true" />

      <div className="anim-pop" style={styles.card}>
        <div style={styles.branding}>
          <span style={styles.logo}>⬡</span>
          <h1 style={styles.brandText}>Wheel<span style={styles.brandAccent}>Sync</span></h1>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Start tracking your vehicles in minutes</p>

        <form onSubmit={handleRegister} style={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label className="field-label">Full Name</label>
            <input
              className="input"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Phone Number</label>
            <input
              className="input"
              type="tel"
              placeholder="10-digit number"
              value={formData.phone}
              maxLength={10}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <div style={styles.pwWrap}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {strength && (
              <div style={styles.strengthWrap}>
                <div style={styles.strengthTrack}>
                  <div style={{ ...styles.strengthFill, width: strength.pct, background: strength.color }} />
                </div>
                <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label">Confirm Password</label>
            <div style={styles.pwWrap}>
              <input
                className="input"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={styles.eyeBtn} tabIndex={-1}>
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {confirmPassword && confirmPassword !== formData.password && (
              <p style={styles.matchBad}>Passwords do not match</p>
            )}
            {confirmPassword && confirmPassword === formData.password && (
              <p style={styles.matchGood}>✓ Passwords match</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account? <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </p>
      </div>
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
    background: 'radial-gradient(circle, rgba(139,92,246,0.22), transparent 65%)',
    top: '-130px',
    right: '-100px',
    filter: 'blur(20px)',
    animation: 'float-y 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orbB: {
    position: 'absolute',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 65%)',
    bottom: '-160px',
    left: '-130px',
    filter: 'blur(20px)',
    animation: 'float-y 10s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    background: 'var(--glass-strong)',
    border: '1px solid var(--glass-border)',
    borderRadius: '26px',
    padding: '34px',
    boxShadow: 'var(--shadow-pop), inset 0 1px 0 var(--glass-highlight)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    position: 'relative',
    zIndex: 1,
  },
  branding: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '22px' },
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
  title: { margin: 0, fontSize: '25px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.4px' },
  subtitle: { margin: '6px 0 24px', textAlign: 'center', color: 'var(--text-2)', fontSize: '14px' },
  form: { display: 'grid', gap: '16px' },
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
  strengthWrap: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' },
  strengthTrack: {
    flex: 1,
    height: '5px',
    borderRadius: '999px',
    background: 'var(--glass-border)',
    overflow: 'hidden',
  },
  strengthFill: { height: '100%', borderRadius: '999px', transition: 'width 0.3s ease, background 0.3s ease' },
  strengthLabel: { fontSize: '12px', fontWeight: 700 },
  matchBad: { margin: '4px 0 0', fontSize: '12px', color: 'var(--danger)', fontWeight: 600 },
  matchGood: { margin: '4px 0 0', fontSize: '12px', color: 'var(--success)', fontWeight: 600 },
  switchText: { textAlign: 'center', marginTop: '22px', marginBottom: 0, color: 'var(--text-2)', fontSize: '14px' },
  switchLink: { color: 'var(--accent-1)', fontWeight: 700, textDecoration: 'none' },
};

export default Register;