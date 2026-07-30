import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/authForm.css';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.error_invalid'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card">
          <span className="eyebrow">GBSG</span>
          <h1>{t('auth.login_title')}</h1>
          <p className="auth-card__subtitle">{t('auth.login_subtitle')}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {t('auth.email')}
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </label>
            <label>
              {t('auth.password')}
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--gold" disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.submit')}
            </button>
          </form>

          <p className="auth-card__footer">
            {t('auth.no_account')} <NavLink to="/register">{t('auth.register_link')}</NavLink>
          </p>
        </div>
      </div>
    </section>
  );
}
