import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconCalendarRSVP } from '../components/TechIcons';
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
  const [rsvping, setRsvping] = useState(false);
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

  const handleToggleRsvp = async () => {
    setRsvping(true);
    try {
      const res = await api.post(`/announcements/${id}/rsvp`);
      setItem((prev) => ({
        ...prev,
        rsvps: res.data.rsvps || [],
      }));
    } catch (err) {
      console.error('RSVP failed', err);
    } finally {
      setRsvping(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!item || !item.eventDate) return '';
    const title = encodeURIComponent(lang === 'or' ? item.title_or : item.title_en);
    const details = encodeURIComponent(lang === 'or' ? item.content_or : item.content_en);
    const location = encodeURIComponent(item.location || 'Jimma University');

    const startDate = new Date(item.eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const handleDownloadIcs = () => {
    if (!item || !item.eventDate) return;
    const title = lang === 'or' ? item.title_or : item.title_en;
    const details = (lang === 'or' ? item.content_or : item.content_en).replace(/\n/g, '\\n');
    const location = item.location || 'Jimma University';

    const startDate = new Date(item.eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatIcsDate = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gamtaa Barattoota Shanan Gibee//GBSG Events//EN',
      'BEGIN:VEVENT',
      `UID:${item._id}@gbsg.org`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const isAttending = item.rsvps?.some((r) => (r.user?._id || r.user) === member?._id);
  const rsvpCount = item.rsvps?.length || 0;

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
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconCalendarRSVP size={14} color="var(--color-star-gold)" />
                <span>{t('news_page.event_date')}: {new Date(item.eventDate).toLocaleDateString()}</span>
              </span>
              {item.location && <span>· {t('news_page.location')}: {item.location}</span>}
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container news-detail">
          {item.imageUrl && <img src={getMediaUrl(item.imageUrl)} alt="" className="news-detail__image" />}

          {/* Event RSVP & Calendar Export Box */}
          {item.type === 'event' && (
            <div className="card event-rsvp-box" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-cream)', border: '1px solid rgba(217, 164, 65, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCalendarRSVP size={18} color="var(--color-star-gold)" />
                    <span>{t('news_page.event_rsvp_title') || 'Event Attendance & RSVP'}</span>
                  </h3>
                  <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: '0.9rem' }}>
                    <strong>{rsvpCount}</strong> {t('news_page.students_attending') || 'students confirmed attending'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn ${isAttending ? 'btn--canopy' : 'btn--gold'}`}
                    onClick={handleToggleRsvp}
                    disabled={rsvping}
                  >
                    {isAttending ? '✓ You are Attending (Click to Cancel)' : '✋ I am Attending (RSVP)'}
                  </button>

                  <a
                    href={generateGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--outline btn--sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <IconCalendarRSVP size={14} />
                    <span>Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleDownloadIcs}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <IconDownloadTech size={14} />
                    <span>Apple / iCal (.ics)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

