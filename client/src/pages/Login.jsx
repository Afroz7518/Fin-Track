import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, #fff, var(--color-primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinTrack
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '-2px' }}>Personal Expense Tracker</p>
          </div>
        </div>

        <div className="auth-title">
          <h1>Welcome back 👋</h1>
          <p>Sign in to manage your finances</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-expense-bg)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px',
            color: 'var(--color-expense-light)', fontSize: '0.85rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                name="email"
                id="login-email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                id="login-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="login-submit-btn"
            style={{ marginTop: '8px' }}
          >
            {loading ? <><div className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create one free →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
