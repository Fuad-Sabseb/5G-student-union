import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';

export default function AdminAnnouncements() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language === 'or' ? 'or' : 'en';

  const load = () => {
    setLoading(true);
    api
      .get('/announcements')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_announcement'))) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ margin: 0 }}>{t('admin.announcements_title')}</h1>
        <NavLink to="/admin/announcements/new" className="btn btn--gold">
          {t('admin.new_announcement')}
        </NavLink>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p className="admin-empty">{t('admin.no_announcements')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.form_type')}</th>
                <th>{t('admin.form_title_en')}</th>
                <th>{t('news_page.event_date')}</th>
                <th>{t('admin.table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{t(`news_page.tab_${item.type}`)}</td>
                  <td>{lang === 'or' ? item.title_or : item.title_en}</td>
                  <td>{item.eventDate ? new Date(item.eventDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="admin-actions">
                      <NavLink to={`/admin/announcements/${item._id}/edit`} className="admin-btn-sm">
                        {t('admin.edit')}
                      </NavLink>
                      <button
                        className="admin-btn-sm admin-btn-sm--danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        {t('admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
