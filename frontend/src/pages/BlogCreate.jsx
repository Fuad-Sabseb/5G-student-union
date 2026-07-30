import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import '../styles/authForm.css';

export default function BlogCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', language: 'or', coverImageUrl: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/blog', form);
      navigate(`/blog/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish article.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card auth-card--wide">
          <span className="eyebrow">GBSG</span>
          <h1>{t('blog_page.write')}</h1>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {t('blog_page.form_title')}
              <input name="title" required value={form.title} onChange={handleChange} />
            </label>
            <label>
              {t('blog_page.form_language')}
              <select name="language" value={form.language} onChange={handleChange}>
                <option value="or">Afaan Oromo</option>
                <option value="en">English</option>
              </select>
            </label>
            <label>
              {t('blog_page.form_cover')}
              <input
                name="coverImageUrl"
                value={form.coverImageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>
            <label>
              {t('blog_page.form_content')}
              <textarea name="content" required rows={10} value={form.content} onChange={handleChange} />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--gold" disabled={submitting}>
              {submitting ? t('common.loading') : t('blog_page.form_submit')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
