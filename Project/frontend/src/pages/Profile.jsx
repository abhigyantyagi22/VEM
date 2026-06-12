import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [form, setForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

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
        <div className="glass-card" style={styles.card}>
          <Skeleton width="140px" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="180px" height="14px" style={{ marginBottom: '32px' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <Skeleton width="100px" height="12px" style={{ marginBottom: '8px' }} />
              <Skeleton width="100%" height="46px" borderRadius="13px" />
            </div>
          ))}
          <Skeleton width="100%" height="50px" borderRadius="14px" style={{ marginTop: '8px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="glass-card anim-up" style={styles.card}>
        <div style={styles.head}>
          <span style={styles.avatar} aria-hidden="true">{(profile.name || profile.email || '?').charAt(0).toUpperCase()}</span>
          <div>
            <h1 style={styles.title}>{profile.name || 'My Profile'}</h1>
            <p style={styles.email}>{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <p className="eyebrow">Account Details</p>
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                className="input"
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit phone"
              />
            </div>
          </section>

          <div style={styles.divider} />

          <section style={styles.section}>
            <p className="eyebrow">Change Password <span style={styles.optional}>(optional)</span></p>
            <div className="field">
              <label className="field-label">Current Password</label>
              <input
                className="input"
                type="password"
                value={form.currentPassword}
                onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className="field">
              <label className="field-label">New Password</label>
              <input
                className="input"
                type="password"
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className="field">
              <label className="field-label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </section>

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: '560px', margin: '0 auto', width: '100%' },
  card: { padding: '32px' },
  head: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '26px',
    fontWeight: 800,
    color: '#06121f',
    background: 'var(--accent-grad)',
    flexShrink: 0,
    boxShadow: 'var(--accent-glow)',
  },
  title: { margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px' },
  email: { margin: '4px 0 0', color: 'var(--accent-1)', fontWeight: 600, fontSize: '14px' },
  form: { display: 'grid', gap: '22px' },
  section: { display: 'grid', gap: '14px' },
  divider: { height: '1px', background: 'var(--glass-border)' },
  optional: { color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 },
};

export default Profile;