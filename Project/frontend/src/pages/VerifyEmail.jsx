import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token found.');
      return;
    }
    api.get(`/auth/verify?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data || 'Verification failed. The link may be expired.');
      });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.blur} />
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.branding}>
            <span style={styles.logo}>🛞</span>
            <h1 style={styles.brand}>WheelSync</h1>
          </div>

          {status === 'loading' && (
            <div style={styles.body}>
              <div style={styles.icon}>⏳</div>
              <h2 style={styles.title}>Verifying your email...</h2>
            </div>
          )}

          {status === 'success' && (
            <div style={styles.body}>
              <div style={styles.icon}>✅</div>
              <h2 style={styles.title}>Email verified!</h2>
              <p style={styles.subtitle}>Your account is now active. You can sign in.</p>
              <button type="button" onClick={() => navigate('/login')} style={styles.btn}>
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={styles.body}>
              <div style={styles.icon}>❌</div>
              <h2 style={styles.title}>Verification failed</h2>
              <p style={styles.subtitle}>{message}</p>
              <button type="button" onClick={() => navigate('/login')} style={styles.btn}>
                Back to Login
              </button>
            </div>
          )}
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
  blur: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(20,184,166,0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.09))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.28)',
    borderRadius: '28px',
    padding: '32px 40px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  branding: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logo: { fontSize: '22px' },
  brand: { margin: 0, fontSize: '22px', fontWeight: 800, color: '#06b6d4' },
  body: { display: 'grid', gap: '12px', justifyItems: 'center' },
  icon: { fontSize: '48px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 800, color: '#0d5d56' },
  subtitle: { margin: 0, fontSize: '14px', color: '#0a3d3a', lineHeight: 1.6 },
  btn: {
    marginTop: '8px',
    padding: '12px 32px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15,118,110,0.35)',
  },
};

export default VerifyEmail;
