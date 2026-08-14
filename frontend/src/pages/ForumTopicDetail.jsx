import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconHeartTech } from '../components/TechIcons';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Forum.css';

export default function ForumTopicDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { member } = useAuth();

  const [topic, setTopic] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTopic = () => {
    setLoading(true);
    api
      .get(`/forum/${id}`)
      .then((res) => setTopic(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load discussion.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTopic();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.post(`/forum/${id}/like`);
      const hasLiked = topic.likes?.some((lid) => (lid._id || lid) === member?._id);
      const newLikes = hasLiked
        ? topic.likes.filter((lid) => (lid._id || lid) !== member?._id)
        : [...(topic.likes || []), member?._id];
      setTopic({ ...topic, likes: newLikes });
    } catch (e) {}
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/forum/${id}/replies`, { text: replyText.trim() });
      setReplyText('');
      loadTopic();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post reply.');
    } finally {
      setSubmitting(false);
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

  if (error && !topic) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <p className="form-error">{error}</p>
            <NavLink to="/community" className="btn btn--dusk" style={{ marginTop: '1rem' }}>
              ← {t('forum_page.back_to_forum') || 'Back to Discussions'}
            </NavLink>
          </div>
        </div>
      </section>
    );
  }

  const isLikedByMe = topic.likes?.some((lid) => (lid._id || lid) === member?._id);

  return (
    <>
      <section className="section section--dusk forum-hero">
        <div className="container">
          <NavLink to="/community" className="support-back-link">
            ← {t('forum_page.back_to_forum') || 'Back to Discussions'}
          </NavLink>
          <div className="ticket-header-row">
            <div>
              <span className="eyebrow">{topic.category.toUpperCase()}</span>
              <h1>{topic.title}</h1>
            </div>
            <button
              type="button"
              className={`btn btn--sm ${isLikedByMe ? 'btn--gold' : 'btn--outline'}`}
              onClick={handleLike}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconHeartTech size={14} color={isLikedByMe ? '#ef4444' : 'currentColor'} />
              <span>{topic.likes?.length || 0} {isLikedByMe ? 'Liked' : 'Like'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container forum-detail-layout">
          {/* Main Topic Body */}
          <div className="card forum-main-topic-card">
            <div className="forum-topic-author-header">
              <div className="forum-author-avatar-lg">
                {topic.author?.profileImageUrl ? (
                  <img src={topic.author.profileImageUrl} alt={topic.author.fullName} />
                ) : (
                  <span>{topic.author?.fullName ? topic.author.fullName.charAt(0) : 'U'}</span>
                )}
              </div>
              <div>
                <strong>{topic.author?.fullName || 'Anonymous Member'}</strong>
                <p className="author-subtext">
                  {topic.author?.department && <span>{topic.author.department} • </span>}
                  {topic.author?.campus && <span>{topic.author.campus} • </span>}
                  {new Date(topic.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="forum-topic-full-content">
              <p>{topic.content}</p>
            </div>

            {/* Replies Thread */}
            <h3 className="forum-replies-heading">
              {t('forum_page.replies_count') || 'Replies & Discussion'} ({topic.replies?.length || 0})
            </h3>

            {topic.replies && topic.replies.length > 0 ? (
              <div className="forum-replies-list">
                {topic.replies.map((reply, idx) => (
                  <div key={idx} className="forum-reply-item">
                    <div className="forum-reply-avatar">
                      {reply.author?.profileImageUrl ? (
                        <img src={reply.author.profileImageUrl} alt={reply.author.fullName} />
                      ) : (
                        <span>{reply.author?.fullName ? reply.author.fullName.charAt(0) : 'U'}</span>
                      )}
                    </div>
                    <div className="forum-reply-body">
                      <div className="forum-reply-meta">
                        <strong>{reply.author?.fullName || 'Union Member'}</strong>
                        {reply.author?.leadershipPosition && (
                          <span className="exec-tag">{reply.author.leadershipPosition}</span>
                        )}
                        <span className="forum-reply-time">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="forum-reply-text">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-responses-notice">
                {t('forum_page.no_replies_yet') || 'No replies yet. Join the conversation below!'}
              </p>
            )}

            {/* Reply Composer */}
            <form onSubmit={handleAddReply} className="forum-reply-form">
              <h4>{t('forum_page.leave_reply') || 'Leave a Reply'}</h4>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('forum_page.reply_placeholder') || 'Write your helpful answer or response...'}
              />
              {error && <p className="form-error">{error}</p>}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  {submitting ? t('common.loading') : (t('forum_page.post_reply_btn') || 'Post Reply')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
