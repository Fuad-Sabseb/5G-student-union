import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Support.css';

const categoryKeys = ['academic', 'conflict', 'orientation', 'general'];
const categoryValue = {
  academic: 'academic-mentorship',
  conflict: 'conflict-resolution',
  orientation: 'orientation-help',
  general: 'general-support',
};

export default function Support() {
  const { t } = useTranslation();
  const { member, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ category: 'academic-mentorship', subject: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadMyRequests = () => {
    setLoadingRequests(true);
    api
      .get('/support-requests/my')
      .then((res) => setMyRequests(res.data))
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => {
    if (member) loadMyRequests();
    else setLoadingRequests(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/support-requests', form);
      setForm({ category: 'academic-mentorship', subject: '', description: '' });
      setSuccess(true);
      loadMyRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="section section--dusk support-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>{t('support_page.title')}</h1>
          <p>{t('support_page.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container support-grid">
          {authLoading ? (
            <p>{t('common.loading')}</p>
          ) : !member ? (
            <div className="card">
              <p className="form-notice">{t('support_page.login_required')}</p>
              <NavLink to="/login" className="btn btn--dusk">
                {t('nav.login')}
              </NavLink>
            </div>
          ) : (
            <>
              <div className="card">
                <h3>{t('support_page.title')}</h3>
                <p className="form-notice">{t('support_page.confidential_notice')}</p>
                <form onSubmit={handleSubmit} className="auth-form">
                  <label>
                    {t('support_page.category')}
                    <select name="category" value={form.category} onChange={handleChange}>
                      {categoryKeys.map((c) => (
                        <option key={c} value={categoryValue[c]}>
                          {t(`support_page.category_${c}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('support_page.subject')}
                    <input name="subject" required value={form.subject} onChange={handleChange} />
                  </label>
                  <label>
                    {t('support_page.description')}
                    <textarea
                      name="description"
                      required
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                    />
                  </label>

                  {error && <p className="form-error">{error}</p>}
                  {success && <p className="form-success">✓</p>}

                  <button type="submit" className="btn btn--gold" disabled={submitting}>
                    {submitting ? t('common.loading') : t('support_page.submit')}
                  </button>
                </form>
              </div>

              <div className="card">
                <h3>{t('support_page.my_requests')}</h3>
                {loadingRequests ? (
                  <p>{t('common.loading')}</p>
                ) : myRequests.length === 0 ? (
                  <p>{t('support_page.no_requests')}</p>
                ) : (
                  <ul className="request-list">
                    {myRequests.map((r) => (
                      <li key={r._id} className="request-item">
                        <div className="request-item__row">
                          <strong>{r.subject}</strong>
                          <span className={`status-badge status-badge--${r.status}`}>
                            {t(`support_page.status_${r.status.replace('-', '_')}`)}
                          </span>
                        </div>
                        <p>{r.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
