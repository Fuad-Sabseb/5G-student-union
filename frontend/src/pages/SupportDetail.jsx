import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconShieldLock } from '../components/TechIcons';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Support.css';

export default function SupportDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { member } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadTicket = () => {
    setLoading(true);
    api
      .get(`/support-requests/${id}`)
      .then((res) => setRequest(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load support ticket.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setError('');
    try {
      await api.post(`/support-requests/${id}/responses`, { text: replyText.trim() });
      setReplyText('');
      loadTicket();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>{t('common.loading')}</p>
        </div>
      </section>
    );
  }

  if (error && !request) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <p className="form-error">{error}</p>
            <NavLink to="/support" className="btn btn--dusk" style={{ marginTop: '1rem' }}>
              ← {t('support_page.back_to_support') || 'Back to Support'}
            </NavLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section section--dusk support-hero">
        <div className="container">
          <NavLink to="/support" className="support-back-link">
            ← {t('support_page.back_to_support') || 'Back to Support'}
          </NavLink>
          <div className="ticket-header-row">
            <div>
              <span className="eyebrow">{t(`support_page.category_${request.category.replace(/-/g, '_')}`) || request.category}</span>
              <h1>{request.subject}</h1>
            </div>
            <span className={`status-badge status-badge--${request.status}`}>
              {t(`support_page.status_${request.status.replace('-', '_')}`) || request.status}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container support-detail-grid">
          <div className="card conversation-thread">
            <div className="original-inquiry-box">
              <div className="message-header">
                <strong>{request.requester?.fullName || member?.fullName} (You)</strong>
                <span className="message-date">{new Date(request.createdAt).toLocaleString()}</span>
              </div>
              <p className="inquiry-body">{request.description}</p>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              {t('support_page.conversation_thread') || 'Conversation Thread'} ({request.responses?.length || 0})
            </h3>

            {request.responses && request.responses.length > 0 ? (
              <div className="responses-list">
                {request.responses.map((resp, idx) => {
                  const isExec = resp.author?.leadershipPosition || resp.author?.role === 'exec' || resp.author?.role === 'admin';
                  const isMe = resp.author?._id === member?._id;

                  return (
                    <div
                      key={idx}
                      className={`response-bubble ${isMe ? 'response-bubble--me' : 'response-bubble--other'}`}
                    >
                      <div className="response-bubble__header">
                        <strong>
                          {resp.author?.fullName || (isMe ? 'You' : 'Union Executive')}
                          {isExec && (
                            <span className="exec-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <IconShieldLock size={12} /> {resp.author?.leadershipPosition || 'Leadership'}
                            </span>
                          )}
                        </strong>
                        <span className="response-bubble__time">
                          {new Date(resp.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="response-bubble__text">{resp.text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-responses-notice">
                {t('support_page.waiting_for_response') || 'No replies yet. An executive officer will review your case shortly.'}
              </p>
            )}

            {/* Reply Composer */}
            {request.status !== 'closed' ? (
              <form onSubmit={handleSendReply} className="ticket-reply-form">
                <h4>{t('support_page.send_reply') || 'Send a Reply / Update'}</h4>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('support_page.reply_placeholder') || 'Type your message or follow-up details here...'}
                />
                {error && <p className="form-error">{error}</p>}
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="submit" className="btn btn--gold" disabled={sending}>
                    {sending ? t('common.loading') : (t('support_page.send') || 'Send Reply')}
                  </button>
                </div>
              </form>
            ) : (
              <p className="form-notice" style={{ marginTop: '1.5rem' }}>
                {t('support_page.ticket_closed_notice') || 'This support request has been closed.'}
              </p>
            )}
          </div>

          {/* Ticket Information Sidebar */}
          <div className="card ticket-info-sidebar">
            <h3>{t('support_page.ticket_info') || 'Ticket Details'}</h3>
            <dl className="ticket-meta-list">
              <div>
                <dt>{t('support_page.ticket_id') || 'Ticket ID'}</dt>
                <dd>#{request._id.slice(-6).toUpperCase()}</dd>
              </div>
              <div>
                <dt>{t('support_page.category')}</dt>
                <dd>{request.category}</dd>
              </div>
              <div>
                <dt>{t('support_page.assigned_officer') || 'Assigned Officer'}</dt>
                <dd>{request.assignedTo?.fullName ? `${request.assignedTo.fullName} (${request.assignedTo.leadershipPosition || 'Executive'})` : 'GBSG Executive Committee'}</dd>
              </div>
              <div>
                <dt>{t('support_page.created_at') || 'Submitted'}</dt>
                <dd>{new Date(request.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
