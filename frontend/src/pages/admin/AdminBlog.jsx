import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';

export default function AdminBlog() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/blog/admin/all')
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post) => {
    await api.put(`/blog/${post._id}`, { published: !post.published });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_post'))) return;
    await api.delete(`/blog/${id}`);
    load();
  };

  const filtered = posts.filter((p) => {
    if (filter === 'published') return p.published;
    if (filter === 'hidden') return !p.published;
    return true;
  });

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ margin: 0 }}>{t('admin.blog_title')}</h1>
        <div className="admin-toolbar__filters">
          <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{t('admin.filter_published')}: {t('admin.published_all')}</option>
            <option value="published">{t('admin.published_yes')}</option>
            <option value="hidden">{t('admin.published_no')}</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty">{t('admin.no_posts')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.form_title_en')}</th>
                <th>{t('blog_page.by')}</th>
                <th>{t('admin.form_type')}</th>
                <th>{t('admin.filter_published')}</th>
                <th>{t('admin.table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post._id}>
                  <td>{post.title}</td>
                  <td>{post.author?.fullName || '—'}</td>
                  <td>{post.language.toUpperCase()}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${post.published ? 'active' : 'inactive'}`}
                    >
                      {post.published ? t('admin.published_yes') : t('admin.published_no')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <NavLink to={`/blog/${post._id}`} className="admin-btn-sm">
                        {t('common.read_more')}
                      </NavLink>
                      <button className="admin-btn-sm" onClick={() => togglePublish(post)}>
                        {post.published ? t('admin.unpublish') : t('admin.publish')}
                      </button>
                      <button
                        className="admin-btn-sm admin-btn-sm--danger"
                        onClick={() => handleDelete(post._id)}
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
