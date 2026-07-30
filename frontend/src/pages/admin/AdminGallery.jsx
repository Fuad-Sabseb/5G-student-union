import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../../api/client';
import '../../styles/admin.css';

const initialForm = { caption_en: '', caption_or: '', album: 'General' };

export default function AdminGallery() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const lang = i18n.language === 'or' ? 'or' : 'en';

  const load = () => {
    setLoading(true);
    api
      .get('/gallery')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const uploadRes = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.post('/gallery', { ...form, imageUrl: uploadRes.data.imageUrl });
      setForm(initialForm);
      setFile(null);
      e.target.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_photo'))) return;
    await api.delete(`/gallery/${id}`);
    load();
  };

  return (
    <>
      <h1>{t('admin.gallery_title')}</h1>

      <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '2.5rem' }}>
        <label>
          {t('admin.form_image')}
          <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <div className="admin-form__grid">
          <label>
            {t('admin.form_caption_en')}
            <input name="caption_en" value={form.caption_en} onChange={handleChange} />
          </label>
          <label>
            {t('admin.form_caption_or')}
            <input name="caption_or" value={form.caption_or} onChange={handleChange} />
          </label>
        </div>
        <label>
          {t('admin.form_album')}
          <input name="album" value={form.album} onChange={handleChange} placeholder="e.g. Freshman Welcome 2025" />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn--gold" disabled={uploading}>
          {uploading ? t('admin.form_uploading') : t('admin.form_upload_submit')}
        </button>
      </form>

      {loading ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">{t('admin.no_gallery')}</p>
      ) : (
        <div className="admin-thumb-grid">
          {items.map((item) => (
            <div className="admin-thumb" key={item._id}>
              <img src={getMediaUrl(item.imageUrl)} alt="" />
              <div className="admin-thumb__body">
                <p className="admin-thumb__caption">
                  {(lang === 'or' ? item.caption_or : item.caption_en) || item.album}
                </p>
                <button
                  className="admin-btn-sm admin-btn-sm--danger"
                  onClick={() => handleDelete(item._id)}
                >
                  {t('admin.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
