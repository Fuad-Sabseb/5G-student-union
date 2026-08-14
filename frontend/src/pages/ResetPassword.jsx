import { useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { IconCheckTech } from '../components/TechIcons';
import '../styles/authForm.css';

export default function ResetPassword() {
  const { token } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwords_do_not_match') || 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
            <h1>{t('auth.set_new_password') || 'Set New Password'}</h1>
            <p className="auth-card__subtitle">
              {t('auth.enter_new_password_subtitle') || 'Enter your new secure password below.'}
            </p>
          </div>

          {success ? (
            <div className="form-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCheckTech size={20} color="var(--color-canopy)" />
              <span>{t('auth.password_reset_success') || 'Password reset successfully! Redirecting to login...'}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                {t('auth.new_password') || 'New Password'}
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoFocus
                />
              </label>

              <label>
                {t('auth.confirm_password') || 'Confirm Password'}
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn btn--gold btn--full" disabled={submitting}>
                {submitting ? t('common.loading') : (t('auth.save_new_password') || 'Save New Password')}
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
