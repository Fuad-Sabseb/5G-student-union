import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { IconShieldLock } from '../components/TechIcons';
import '../styles/authForm.css';

export function extractNameFromGmail(email) {
  if (!email || !email.includes('@')) return '';
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/\d+$/, '');
  const parts = cleaned.split(/[._\-\+]+/).filter(Boolean);
  if (parts.length === 0) {
    const raw = localPart.replace(/[._\-\+]+/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export default function Login() {
  const { t } = useTranslation();
  const { member, login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to intended target or home
  useEffect(() => {
    if (member) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [member, navigate, location]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('auth.error_invalid'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setError('');
    setSubmitting(true);
    try {
      await googleLogin(idToken);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError('Google sign-in failed. Please try again or use email/password login.');
  };

  const isGatedNotice = location.state?.from;

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card card--elevated">
          <div className="auth-card__header">
            <span className="eyebrow">Gamtaa Barattoota Shanan Gibee</span>
            <h1>{t('auth.login_title')}</h1>
            <p className="auth-card__subtitle">{t('auth.login_subtitle')}</p>
          </div>

          {isGatedNotice && (
            <div className="auth-gate-banner">
              <span className="auth-gate-banner__icon">
                <IconShieldLock size={22} color="var(--color-star-gold)" />
              </span>
              <div>
                <strong>{t('auth.portal_access_required')}</strong>
                <p>{t('auth.portal_access_desc')}</p>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {t('auth.email')}
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('auth.password')}</span>
                <NavLink to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-star-gold)', textDecoration: 'none', fontWeight: 600 }}>
                  {t('auth.forgot_password') || 'Forgot?'}
                </NavLink>
              </div>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--gold btn--full" disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.submit')}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>{t('auth.or_with_google')}</span>
          </div>

          {/* Secure Google Sign-in */}
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText={t('auth.continue_google')}
            disabled={submitting}
          />

          <p className="auth-card__footer">
            {t('auth.no_account')} <NavLink to="/register">{t('auth.register_link')}</NavLink>
          </p>
        </div>
      </div>
    </section>
  );
}
