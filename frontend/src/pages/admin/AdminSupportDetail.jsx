import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';
import '../../styles/listing.css';

const statuses = ['open', 'in-progress', 'resolved', 'closed'];
const categoryKeyMap = {
  'academic-mentorship': 'academic',
  'conflict-resolution': 'conflict',
  'orientation-help': 'orientation',
  'general-support': 'general',
};

export default function AdminSupportDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [request, setRequest] = useState(null);
  const [handlers, setHandlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get(`/support-requests/${id}`)
      .then((res) => setRequest(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Fetch active exec/admin members to populate the assignment dropdown
    api.get('/members', { params: { status: 'active' } }).then((res) => {
      setHandlers(res.data.filter((m) => m.role === 'exec' || m.role === 'admin'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (e) => {
    await api.put(`/support-requests/${id}`, { status: e.target.value });
    load();
  };

  const handleAssignChange = async (e) => {
    await api.put(`/support-requests/${id}`, { assignedTo: e.target.value || null });
    load();
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setPosting(true);
    setError('');
    try {
      await api.post(`/support-requests/${id}/responses`, { text: responseText.trim() });
      setResponseText('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send response.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (!request) return null;

  return (
    <>
      <NavLink to="/admin/support" className="back-link">
        {t('admin.back_to_support_list')}
      </NavLink>

      <h1>{request.subject}</h1>

      <div className="admin-form" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-form__grid">
          <div>
            <strong>{t('admin.table_requester')}:</strong> {request.requester?.fullName} (
            {request.requester?.email})
          </div>
          <div>
            <strong>{t('admin.table_category')}:</strong>{' '}
            {t(`support_page.category_${categoryKeyMap[request.category]}`)}
          </div>
        </div>

        <div>
          <strong>{t('support_page.description')}:</strong>
          <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{request.description}</p>
        </div>

        <div className="admin-form__grid">
          <label>
            {t('admin.change_status')}
            <select value={request.status} onChange={handleStatusChange}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {t(`support_page.status_${s.replace('-', '_')}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('admin.assign_to')}
            <select value={request.assignedTo?._id || ''} onChange={handleAssignChange}>
              <option value="">{t('admin.unassigned')}</option>
              {handlers.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.fullName} ({h.role})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="news-comments" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
        <h3>
          {t('admin.responses_title')} ({request.responses.length})
        </h3>
        {request.responses.map((r) => (
          <div className="comment" key={r._id}>
            <strong>{r.author?.fullName || 'Member'}</strong>
            <p>{r.text}</p>
          </div>
        ))}

        <form onSubmit={handleRespond} className="comment-form">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={t('admin.response_placeholder')}
            rows={3}
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn--dusk" disabled={posting}>
            {t('admin.send_response')}
          </button>
        </form>
      </div>
    </>
  );
}
