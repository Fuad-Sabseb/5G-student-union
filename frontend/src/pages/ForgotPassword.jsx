import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import '../styles/authForm.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link generated.');
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process password reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card card--elevated">
          <div className="auth-card__header">
            <span className="eyebrow">Gamtaa Barattoota Shanan Gibee</span>
            <h1>{t('auth.forgot_password_title') || 'Reset Your Password'}</h1>
            <p className="auth-card__subtitle">
              {t('auth.forgot_password_subtitle') || 'Enter your registered email address and we will generate your reset link.'}
            </p>
          </div>

          {message ? (
            <div className="form-success" style={{ display: 'block', margin: '1rem 0' }}>
              <p style={{ margin: '0 0 0.5rem' }}>{message}</p>
              {resetUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <NavLink to={resetUrl} className="btn btn--gold btn--full">
                    {t('auth.click_to_reset_now') || 'Click Here to Set New Password →'}
                  </NavLink>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                {t('auth.email')}
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn btn--gold btn--full" disabled={submitting}>
                {submitting ? t('common.loading') : (t('auth.send_reset_link') || 'Send Reset Link')}
              </button>
            </form>
          )}

          <p className="auth-card__footer">
            <NavLink to="/login">← {t('auth.back_to_login') || 'Back to Login'}</NavLink>
          </p>
        </div>
      </div>
    </section>
  );
}
