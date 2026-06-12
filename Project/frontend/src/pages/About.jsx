import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const FEATURES = [
  {
    icon: '⛽',
    title: 'Fuel Intelligence',
    text: 'Log every refuel and instantly see km/L efficiency, average fuel rate, and per-kilometre running cost for each vehicle.',
  },
  {
    icon: '🔧',
    title: 'Maintenance Tracking',
    text: 'Record services with due-date reminders. Overdue work is flagged on your dashboard before it becomes a breakdown.',
  },
  {
    icon: '📄',
    title: 'Document Vault',
    text: 'Track insurance, PUC, and registration expiry dates so legal compliance never slips through the cracks.',
  },
  {
    icon: '📊',
    title: 'Cost Analytics',
    text: 'Total cost of ownership, monthly spend trends, and fleet-wide expense breakdowns — computed automatically.',
  },
  {
    icon: '🧾',
    title: 'PDF Reports',
    text: 'Export a clean, shareable PDF report of any vehicle’s complete fuel and maintenance history in one click.',
  },
  {
    icon: '📬',
    title: 'Monthly Email Digest',
    text: 'A summary of last month’s spend, your costliest vehicle, and upcoming due dates — delivered to your inbox.',
  },
];

const STACK = [
  { label: 'Frontend', value: 'React + Vite' },
  { label: 'Backend', value: 'Spring Boot 3 (Java 21)' },
  { label: 'Database', value: 'MySQL' },
  { label: 'Auth', value: 'JWT + Spring Security' },
  { label: 'Hosting', value: 'Vercel + Render' },
];

const About = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell" style={styles.page}>
      <section className="anim-up" style={styles.hero}>
        <p className="eyebrow">About WheelSync</p>
        <h1 className="page-title" style={styles.heroTitle}>
          Your fleet, beyond the spreadsheet.
        </h1>
        <p style={styles.heroText}>
          WheelSync is a vehicle expense and maintenance tracker built for owners and small fleets.
          It turns raw fuel and service logs into the numbers that actually matter — efficiency,
          cost per kilometre, and total cost of ownership — and warns you before services and
          documents fall overdue.
        </p>
        {!isAuthenticated && (
          <div style={styles.heroCta}>
            <Link to="/register"><button type="button" className="btn btn-primary btn-lg">Get Started Free</button></Link>
            <Link to="/login"><button type="button" className="btn btn-ghost btn-lg">Sign In</button></Link>
          </div>
        )}
      </section>

      <section style={styles.grid}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`glass-card hoverable anim-up d${Math.min(i + 1, 5)}`} style={styles.featureCard}>
            <span style={styles.featureIcon} aria-hidden="true">{f.icon}</span>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureText}>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="glass-card anim-up d3" style={styles.stackCard}>
        <p className="eyebrow">Under the hood</p>
        <div style={styles.stackRow}>
          {STACK.map((s) => (
            <div key={s.label} style={styles.stackItem}>
              <span style={styles.stackLabel}>{s.label}</span>
              <span style={styles.stackValue}>{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Built with care for people who'd rather drive than do data entry. © {new Date().getFullYear()} WheelSync
        </p>
      </footer>
    </div>
  );
};

const styles = {
  page: { display: 'grid', gap: '34px' },
  hero: { textAlign: 'center', padding: '34px 16px 6px', maxWidth: '760px', margin: '0 auto' },
  heroTitle: { fontSize: 'clamp(32px, 5.5vw, 52px)', lineHeight: 1.12 },
  heroText: { color: 'var(--text-2)', fontSize: '17px', lineHeight: 1.7, marginTop: '18px' },
  heroCta: { display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' },
  featureCard: { display: 'grid', gap: '10px', alignContent: 'start' },
  featureIcon: { fontSize: '30px', lineHeight: 1 },
  featureTitle: { margin: 0, fontSize: '18px', fontWeight: 800 },
  featureText: { margin: 0, color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.65 },
  stackCard: { textAlign: 'center' },
  stackRow: { display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginTop: '6px' },
  stackItem: {
    display: 'grid',
    gap: '4px',
    padding: '14px 22px',
    borderRadius: '14px',
    background: 'var(--input-bg)',
    border: '1px solid var(--glass-border)',
    minWidth: '150px',
  },
  stackLabel: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' },
  stackValue: { fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' },
  footer: { textAlign: 'center', padding: '8px 0 20px' },
  footerText: { color: 'var(--text-3)', fontSize: '13px', margin: 0 },
};

export default About;
