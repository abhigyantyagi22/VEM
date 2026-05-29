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
  if (score <= 2) return { label: 'Weak', color: '#ef4444', pct: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#f59e0b', pct: '66%' };
  return { label: 'Strong', color: '#10b981', pct: '100%' };
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
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
      <div style={styles.backgroundBlur} />
      
      <div style={styles.content}>
        {/* Register Card */}
        <div style={styles.card}>
          {/* Branding Inside Card */}
          <div style={styles.cardBranding}>
            <div style={styles.logo}>🛞</div>
            <h1 style={styles.brandText}>WheelSync</h1>
          </div>

          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Join us to track your vehicles</p>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleChange('phone', digits);
                }}
                required
                maxLength={10}
                style={{
                  ...styles.input,
                  borderColor: formData.phone && formData.phone.length !== 10
                    ? 'rgba(239,68,68,0.6)'
                    : 'rgba(20,184,166,0.4)',
                }}
              />
              {formData.phone.length > 0 && formData.phone.length < 10 && (
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                  {10 - formData.phone.length} more digit{10 - formData.phone.length !== 1 ? 's' : ''} needed
                </p>
              )}
              {formData.phone.length === 10 && (
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>✓ Valid</p>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                style={styles.input}
              />
              {(() => {
                const s = getStrength(formData.password);
                if (!s) return <p style={styles.passwordHint}>At least 6 characters</p>;
                return (
                  <div>
                    <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ height: '100%', width: s.pct, background: s.color, borderRadius: '999px', transition: 'width 0.3s ease, background 0.3s ease' }} />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', fontWeight: 700, color: s.color }}>{s.label}</p>
                  </div>
                );
              })()}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{...styles.registerButton, opacity: isLoading ? 0.7 : 1}}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.divider} />

          <p style={styles.loginText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
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
  cardBranding: {
    display: 'grid',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: '8px',
  },
  logo: {
    fontSize: '20px',
    color: '#14b8a6',
    fontWeight: 800,
    textShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
    textAlign: 'center',
  },
  brandText: {
    margin: '0',
    fontSize: '20px',
    fontWeight: 800,
    color: '#06b6d4',
    textAlign: 'center',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.09))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '28px',
    padding: '16px 80px',
    maxWidth: '95vw',
    width: '100%',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    display: 'grid',
    gap: '4px',
    marginBottom: '6px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    color: '#0d5d56',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#0a3d3a',
    fontWeight: 500,
  },
  form: {
    display: 'grid',
    gap: '6px',
  },
  fieldGroup: {
    display: 'grid',
    gap: '2px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#0a3d3a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '9px 16px',
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
  passwordHint: {
    margin: '0',
    fontSize: '10px',
    color: '#0a3d3a',
    fontWeight: 500,
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
  registerButton: {
    width: '100%',
    padding: '9px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#000000',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    marginTop: '0',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.4), transparent)',
    margin: '4px 0',
  },
  loginText: {
    margin: 0,
    fontSize: '10px',
    color: '#0a3d3a',
    fontWeight: 500,
    textAlign: 'center',
  },
  loginLink: {
    color: '#000000',
    textDecoration: 'none',
    fontWeight: 700,
    transition: 'all 0.3s ease',
  },
};

export default Register;
