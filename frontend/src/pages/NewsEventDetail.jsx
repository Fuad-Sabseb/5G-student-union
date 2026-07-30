import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/listing.css';
import './News.css';

export default function NewsEventDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { member } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const lang = i18n.language === 'or' ? 'or' : 'en';

  const load = () => {
    setLoading(true);
    api
      .get(`/announcements/${id}`)
      .then((res) => setItem(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    setError('');
    try {
      await api.post(`/announcements/${id}/comments`, { text: commentText.trim() });
      setCommentText('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="container section">{t('common.loading')}</div>;
  if (!item) return null;

  return (
    <>
      <section className="section section--dusk news-hero">
        <div className="container">
          <NavLink to="/news" className="back-link">
            ← {t('news_page.back')}
          </NavLink>
          <span className={`news-card__type news-card__type--${item.type}`}>
            {t(`news_page.tab_${item.type}`)}
          </span>
          <h1>{lang === 'or' ? item.title_or : item.title_en}</h1>
          {item.type === 'event' && item.eventDate && (
            <p>
              {t('news_page.event_date')}: {new Date(item.eventDate).toLocaleDateString()}
              {item.location && ` · ${t('news_page.location')}: ${item.location}`}
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container news-detail">
          {item.imageUrl && <img src={getMediaUrl(item.imageUrl)} alt="" className="news-detail__image" />}
          <p className="news-detail__content">{lang === 'or' ? item.content_or : item.content_en}</p>

          <div className="news-comments">
            <h3>
              {t('news_page.comments_title')} ({item.comments.length})
            </h3>
            {item.comments.map((c) => (
              <div className="comment" key={c._id}>
                <strong>{c.member?.fullName || 'Member'}</strong>
                <p>{c.text}</p>
              </div>
            ))}

            {member ? (
              <form onSubmit={handleComment} className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('news_page.comment_placeholder')}
                  rows={3}
                />
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn--dusk" disabled={posting}>
                  {t('news_page.comment_submit')}
                </button>
              </form>
            ) : (
              <p className="form-notice">{t('news_page.comment_login_notice')}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
