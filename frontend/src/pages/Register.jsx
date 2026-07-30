import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/authForm.css';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  studentId: '',
  campus: '',
  department: '',
  yearOfStudy: '',
  homeArea: '',
  preferredLanguage: 'or',
};

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        ...form,
        yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card auth-card--wide">
          <span className="eyebrow">GBSG</span>
          <h1>{t('membership.title')}</h1>
          <p className="auth-card__subtitle">{t('membership.subtitle')}</p>
          <p className="form-notice">{t('membership.pending_notice')}</p>

          {success ? (
            <p className="form-success">{t('membership.success')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="span-2">
                {t('membership.full_name')}
                <input name="fullName" required value={form.fullName} onChange={handleChange} />
              </label>

              <div className="auth-form__grid">
                <label>
                  {t('membership.email')}
                  <input type="email" name="email" required value={form.email} onChange={handleChange} />
                </label>
                <label>
                  {t('membership.password')}
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  {t('membership.phone')}
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                  {t('membership.student_id')}
                  <input name="studentId" value={form.studentId} onChange={handleChange} />
                </label>
                <label>
                  {t('membership.campus')}
                  <input
                    name="campus"
                    value={form.campus}
                    onChange={handleChange}
                    placeholder="e.g. Jimma University Main Campus"
                  />
                </label>
                <label>
                  {t('membership.department')}
                  <input name="department" value={form.department} onChange={handleChange} />
                </label>
                <label>
                  {t('membership.year_of_study')}
                  <input
                    type="number"
                    min="1"
                    max="7"
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  {t('membership.home_area')}
                  <input name="homeArea" value={form.homeArea} onChange={handleChange} />
                </label>
                <label className="span-2">
                  {t('membership.preferred_language')}
                  <select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}>
                    <option value="or">Afaan Oromo</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? t('common.loading') : t('membership.submit')}
              </button>
            </form>
          )}

          <p className="auth-card__footer">
            {t('membership.already_member')} <NavLink to="/login">{t('membership.login_link')}</NavLink>
          </p>
        </div>
      </div>
    </section>
  );
}
