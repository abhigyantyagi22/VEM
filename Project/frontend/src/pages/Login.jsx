import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const token = typeof res.data === 'string' ? res.data : (res.data?.token || res.data?.accessToken || JSON.stringify(res.data));
      console.log('[Login] Login successful, token received:', token.substring(0, 50) + '...');
      login(token);
      console.log('[Login] Called login() with token');
      const stored = localStorage.getItem('token');
      console.log('[Login] Token in localStorage after login():', stored ? stored.substring(0, 50) + '...' : 'null');
      navigate('/dashboard');
    } catch (err) {
      console.error('[Login] Error:', err);
      // Do not display long backend error messages to users. Show a concise message.
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

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlur} />
      
      <div style={styles.content}>
        {/* Login Card */}
        <div style={styles.card}>
          {/* Branding Inside Card */}
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
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                style={styles.input}
              />
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
};

export default Login;
