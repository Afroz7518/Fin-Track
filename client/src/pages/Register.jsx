import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/');
  };

  const renderInputField = (icon, name, type, placeholder, label) => (
    <div className="form-group" key={name}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
          {icon}
        </span>
        <input
          type={name === 'password' || name === 'confirmPassword' ? (showPass ? 'text' : 'password') : type}
          name={name}
          id={`register-${name}`}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="form-control"
          style={{ paddingLeft: '38px', paddingRight: name === 'password' ? '38px' : undefined }}
          autoComplete={name === 'password' ? 'new-password' : undefined}
        />
        {name === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
          >
            {showPass ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        )}
      </div>
      {errors[name] && <span className="form-error">⚠ {errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
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
          <h1>Create your account ✨</h1>
          <p>Start tracking your finances for free</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {renderInputField(<MdPerson />, 'name', 'text', 'John Doe', 'Full Name')}
          {renderInputField(<MdEmail />, 'email', 'email', 'you@example.com', 'Email Address')}
          {renderInputField(<MdLock />, 'password', 'password', 'Min. 6 characters', 'Password')}
          {renderInputField(<MdLock />, 'confirmPassword', 'password', 'Repeat password', 'Confirm Password')}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="register-submit-btn"
            style={{ marginTop: '8px' }}
          >
            {loading ? <><div className="spinner" /> Creating account...</> : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
