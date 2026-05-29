import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Skeleton from '../components/Skeleton';

const Profile = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [form, setForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        setProfile(res.data);
        setForm(f => ({ ...f, name: res.data.name || '', phone: res.data.phone || '' }));
      })
      .catch(() => setMessage({ type: 'error', text: 'Could not load profile.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    const payload = { name: form.name, phone: form.phone };
    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/profile', payload);
      setProfile(res.data);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      const text = typeof err.response?.data === 'string' ? err.response.data : 'Could not update profile.';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, background: theme.bgCardGlass, border: `1px solid ${theme.border}` }}>
          <Skeleton width="140px" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="180px" height="14px" style={{ marginBottom: '32px' }} />
          <Skeleton width="100%" height="1px" style={{ marginBottom: '24px' }} />
          {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <Skeleton width="80px" height="12px" style={{ marginBottom: '8px' }} />
              <Skeleton width="100%" height="44px" borderRadius="12px" />
            </div>
          ))}
          <Skeleton width="100%" height="1px" style={{ margin: '24px 0' }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <Skeleton width="120px" height="12px" style={{ marginBottom: '8px' }} />
              <Skeleton width="100%" height="44px" borderRadius="12px" />
            </div>
          ))}
          <Skeleton width="100%" height="48px" borderRadius="14px" style={{ marginTop: '8px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, background: theme.bgCardGlass, border: `1px solid ${theme.border}` }}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={{ ...styles.subtitle, color: theme.textAccent }}>{profile.email}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <h2 style={{ ...styles.sectionTitle, color: theme.textPrimary }}>Account Details</h2>
            <label style={{ ...styles.label, color: theme.textSecondary }}>
              Full Name
              <input
                style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
              />
            </label>
            <label style={{ ...styles.label, color: theme.textSecondary }}>
              Phone Number
              <input
                style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit phone"
              />
            </label>
          </section>

          <div style={styles.divider} />

          <section style={styles.section}>
            <h2 style={{ ...styles.sectionTitle, color: theme.textPrimary }}>Change Password <span style={styles.optional}>(optional)</span></h2>
            <label style={{ ...styles.label, color: theme.textSecondary }}>
              Current Password
              <input
                style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                type="password"
                value={form.currentPassword}
                onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </label>
            <label style={{ ...styles.label, color: theme.textSecondary }}>
              New Password
              <input
                style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                type="password"
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </label>
            <label style={{ ...styles.label, color: theme.textSecondary }}>
              Confirm New Password
              <input
                style={{ ...styles.input, background: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }}
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </label>
          </section>

          {message && (
            <div style={message.type === 'success' ? styles.successBox : styles.errorBox}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={saving} style={styles.saveButton}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '10px 20px 40px',
  },
  card: {
    background: 'linear-gradient(130deg, rgba(255,255,255,0.92), rgba(236,253,250,0.78))',
    border: '1px solid rgba(153, 246, 228, 0.4)',
    borderRadius: '22px',
    boxShadow: '0 14px 36px rgba(15, 23, 42, 0.1)',
    padding: '32px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '28px',
    fontWeight: 800,
    background: 'linear-gradient(130deg, #0f172a, #0f766e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '0 0 28px',
    color: '#0f766e',
    fontWeight: 600,
    fontSize: '14px',
  },
  form: {
    display: 'grid',
    gap: '24px',
  },
  section: {
    display: 'grid',
    gap: '14px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  optional: {
    fontWeight: 400,
    fontSize: '13px',
    color: '#94a3b8',
  },
  label: {
    display: 'grid',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid #dbe3ee',
    background: '#f8fafc',
    fontSize: '15px',
    color: '#1f2937',
    outline: 'none',
    fontFamily: 'inherit',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.35), transparent)',
  },
  successBox: {
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(20, 184, 166, 0.1)',
    border: '1px solid rgba(20, 184, 166, 0.35)',
    color: '#0f766e',
    fontWeight: 600,
    fontSize: '14px',
  },
  errorBox: {
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#dc2626',
    fontWeight: 600,
    fontSize: '14px',
  },
  saveButton: {
    padding: '13px 24px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
  },
  center: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
  },
};

export default Profile;
