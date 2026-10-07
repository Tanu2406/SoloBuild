// ============================================================
// SoloBuildAI — Login / Register Page
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

type Mode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', timezone: 'UTC' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password, timezone: form.timezone });
      }
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / branding */}
        <div style={styles.brand}>
          <div style={styles.logoMark}>S</div>
          <span style={styles.logoText}>SoloBuildAI</span>
        </div>

        <h1 style={styles.heading}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={styles.subheading}>
          {mode === 'login'
            ? 'Sign in to continue to your workspace'
            : 'Get started with AI-powered hiring'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {mode === 'register' && (
            <Field
              id="auth-name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Jane Doe"
              error={errors.name}
              autoComplete="name"
            />
          )}
          <Field
            id="auth-email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
          />
          <Field
            id="auth-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            error={errors.password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            id="auth-switch-mode-btn"
            type="button"
            style={styles.switchLink}
            onClick={() => {
              setMode(m => (m === 'login' ? 'register' : 'login'));
              setErrors({});
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

// ——— Simple field sub-component ———
interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}

const Field: React.FC<FieldProps> = ({ id, label, type, value, onChange, placeholder, error, autoComplete }) => (
  <div style={styles.fieldWrap}>
    <label htmlFor={id} style={styles.label}>{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={{ ...styles.input, borderColor: error ? 'var(--color-error, #ef4444)' : 'var(--border-default, #e2e8f0)' }}
    />
    {error && <span style={styles.errorText}>{error}</span>}
  </div>
);

// ——— Inline styles (uses design tokens where possible, falls back to values) ———
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    padding: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '18px',
  },
  logoText: {
    color: '#f8fafc',
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '-0.3px',
  },
  heading: {
    color: '#f8fafc',
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 6px',
    letterSpacing: '-0.4px',
  },
  subheading: {
    color: 'rgba(248,250,252,0.5)',
    fontSize: '14px',
    margin: '0 0 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'rgba(248,250,252,0.75)',
    fontSize: '13px',
    fontWeight: 500,
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  },
  errorText: {
    color: '#f87171',
    fontSize: '12px',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    fontFamily: 'inherit',
  },
  switchText: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'rgba(248,250,252,0.5)',
    fontSize: '13px',
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    padding: 0,
    fontFamily: 'inherit',
  },
};

export default AuthPage;
