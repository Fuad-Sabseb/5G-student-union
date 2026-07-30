import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';
import '../../styles/listing.css';

const statuses = ['open', 'in-progress', 'resolved', 'closed'];
const categories = ['academic-mentorship', 'conflict-resolution', 'orientation-help', 'general-support'];
const categoryKeyMap = {
  'academic-mentorship': 'academic',
  'conflict-resolution': 'conflict',
  'orientation-help': 'orientation',
  'general-support': 'general',
};

export default function AdminSupport() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    api
      .get('/support-requests', { params })
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <h1>{t('admin.support_title')}</h1>

      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('admin.filter_status')}: {t('admin.status_all')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {t(`support_page.status_${s.replace('-', '_')}`)}
              </option>
            ))}
          </select>
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('admin.table_category')}: {t('admin.status_all')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {t(`support_page.category_${categoryKeyMap[c]}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : requests.length === 0 ? (
          <p className="admin-empty">{t('admin.no_support_requests')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.table_subject')}</th>
                <th>{t('admin.table_requester')}</th>
                <th>{t('admin.table_category')}</th>
                <th>{t('admin.table_status')}</th>
                <th>{t('admin.table_assigned')}</th>
                <th>{t('admin.table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.subject}</td>
                  <td>{r.requester?.fullName || '—'}</td>
                  <td>{t(`support_page.category_${categoryKeyMap[r.category]}`)}</td>
                  <td>
                    <span className={`status-badge status-badge--${r.status}`}>
                      {t(`support_page.status_${r.status.replace('-', '_')}`)}
                    </span>
                  </td>
                  <td>{r.assignedTo?.fullName || t('admin.unassigned')}</td>
                  <td>
                    <NavLink to={`/admin/support/${r._id}`} className="admin-btn-sm">
                      {t('admin.view')}
                    </NavLink>
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
