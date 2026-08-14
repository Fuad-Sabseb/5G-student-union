import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import GoogleAccountChooserModal from '../components/GoogleAccountChooserModal';
import { IconShieldLock } from '../components/TechIcons';
import '../styles/authForm.css';

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

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
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);

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

  const handleGoogleAccountSelected = async (googlePayload) => {
    setError('');
    setSubmitting(true);
    try {
      await googleLogin(googlePayload);
      setGoogleChooserOpen(false);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

          {/* Google Sign-in Trigger at Bottom */}
          <button
            type="button"
            className="btn btn--google"
            onClick={() => setGoogleChooserOpen(true)}
            disabled={submitting}
          >
            <GoogleIcon />
            <span>{t('auth.continue_google')}</span>
          </button>

          <p className="auth-card__footer">
            {t('auth.no_account')} <NavLink to="/register">{t('auth.register_link')}</NavLink>
          </p>
        </div>
      </div>

      {/* Authentic Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={googleChooserOpen}
        onClose={() => setGoogleChooserOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
        isLoading={submitting}
      />
    </section>
  );
}
