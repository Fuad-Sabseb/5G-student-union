import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../../api/client';
import '../../styles/admin.css';
import '../../styles/listing.css';

const initialForm = {
  type: 'news',
  title_en: '',
  title_or: '',
  content_en: '',
  content_or: '',
  eventDate: '',
  location: '',
  imageUrl: '',
};

export default function AdminAnnouncementForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/announcements/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          type: data.type,
          title_en: data.title_en,
          title_or: data.title_or,
          content_en: data.content_en,
          content_or: data.content_or,
          eventDate: data.eventDate ? data.eventDate.slice(0, 10) : '',
          location: data.location || '',
          imageUrl: data.imageUrl || '',
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/announcements/${id}`, form);
      } else {
        await api.post('/announcements', form);
      }
      navigate('/admin/announcements');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <>
      <NavLink to="/admin/announcements" className="back-link">
        {t('admin.back_to_list')}
      </NavLink>
      <h1>{isEdit ? t('admin.edit') : t('admin.new_announcement')}</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          {t('admin.form_type')}
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="news">{t('admin.form_type_news')}</option>
            <option value="event">{t('admin.form_type_event')}</option>
          </select>
        </label>

        <div className="admin-form__grid">
          <label>
            {t('admin.form_title_en')}
            <input name="title_en" required value={form.title_en} onChange={handleChange} />
          </label>
          <label>
            {t('admin.form_title_or')}
            <input name="title_or" required value={form.title_or} onChange={handleChange} />
          </label>
        </div>

        <div className="admin-form__grid">
          <label>
            {t('admin.form_content_en')}
            <textarea name="content_en" required rows={6} value={form.content_en} onChange={handleChange} />
          </label>
          <label>
            {t('admin.form_content_or')}
            <textarea name="content_or" required rows={6} value={form.content_or} onChange={handleChange} />
          </label>
        </div>

        {form.type === 'event' && (
          <div className="admin-form__grid">
            <label>
              {t('admin.form_event_date')}
              <input type="date" name="eventDate" required value={form.eventDate} onChange={handleChange} />
            </label>
            <label>
              {t('admin.form_location')}
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
          </div>
        )}

        <label>
          {t('admin.form_image')}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        {uploading && <p>{t('admin.form_uploading')}</p>}
        {form.imageUrl && (
          <img
            src={getMediaUrl(form.imageUrl)}
            alt=""
            style={{ maxWidth: '240px', borderRadius: '8px' }}
          />
        )}

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn--gold" disabled={submitting}>
          {submitting ? t('common.loading') : t('admin.form_save')}
        </button>
      </form>
    </>
  );
}
