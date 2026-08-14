import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  IconHousingTech,
  IconTransitVehicle,
  IconGraduationTech,
  IconCommunityNodes,
  IconHeartTech,
} from '../components/TechIcons';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Forum.css';

const forumCategories = [
  { id: 'all', labelKey: 'forum_page.cat_all', defaultLabel: 'All Discussions' },
  { id: 'housing', labelKey: 'forum_page.cat_housing', defaultLabel: 'Housing & Dorm Swaps', icon: IconHousingTech },
  { id: 'rideshare', labelKey: 'forum_page.cat_rideshare', defaultLabel: 'Break Rideshare', icon: IconTransitVehicle },
  { id: 'academic', labelKey: 'forum_page.cat_academic', defaultLabel: 'Academic & Mentorship', icon: IconGraduationTech },
  { id: 'general', labelKey: 'forum_page.cat_general', defaultLabel: 'General Union Talk', icon: IconCommunityNodes },
];

export default function Forum() {
  const { t } = useTranslation();
  const { member } = useAuth();

  const [topics, setTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Topic modal
  const [modalOpen, setModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', content: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTopics = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.append('category', activeCategory);
    if (search.trim()) params.append('search', search.trim());

    api
      .get(`/forum?${params.toString()}`)
      .then((res) => setTopics(res.data))
      .catch((err) => console.error('Failed to load forum topics', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTopics();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTopics();
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/forum', topicForm);
      setModalOpen(false);
      setTopicForm({ title: '', content: '', category: 'general' });
      loadTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (e, topicId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/forum/${topicId}/like`);
      setTopics((prev) =>
        prev.map((top) => {
          if (top._id === topicId) {
            const hasLiked = top.likes?.some((id) => (id._id || id) === member?._id);
            const newLikes = hasLiked
              ? top.likes.filter((id) => (id._id || id) !== member?._id)
              : [...(top.likes || []), member?._id];
            return { ...top, likes: newLikes };
          }
          return top;
        })
      );
    } catch (e) {}
  };

  return (
    <>
      <section className="section section--dusk forum-hero">
        <div className="container">
          <div className="forum-hero__inner">
            <div>
              <span className="eyebrow">GBSG Community Hub</span>
              <h1>{t('forum_page.title') || 'Student Discussion & Peer Q&A'}</h1>
              <p>
                {t('forum_page.subtitle') ||
                  'Coordinate dorm swaps, arrange semester break travel rides, and share campus experiences with fellow Shanan Gibe students.'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--gold"
              onClick={() => setModalOpen(true)}
            >
              + {t('forum_page.new_topic_btn') || 'Start a Discussion'}
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Category Tabs */}
          <div className="forum-tabs" role="tablist">
            {forumCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`forum-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {t(cat.labelKey) || cat.defaultLabel}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="forum-search-bar">
            <input
              type="search"
              placeholder={t('forum_page.search_placeholder') || 'Search discussions, questions, or topics...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn--dusk">
              {t('common.search') || 'Search'}
            </button>
          </form>

          {/* Topics List */}
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : topics.length === 0 ? (
            <div className="card empty-forum-box">
              <h3>{t('forum_page.no_topics_title') || 'No discussions yet'}</h3>
              <p>{t('forum_page.no_topics_desc') || 'Be the first to start a conversation in this category!'}</p>
              <button
                type="button"
                className="btn btn--gold"
                style={{ marginTop: '1rem' }}
                onClick={() => setModalOpen(true)}
              >
                {t('forum_page.new_topic_btn') || 'Start a Discussion'}
              </button>
            </div>
          ) : (
            <div className="forum-topics-list">
              {topics.map((topic) => {
                const isLikedByMe = topic.likes?.some((id) => (id._id || id) === member?._id);

                return (
                  <NavLink
                    key={topic._id}
                    to={`/community/${topic._id}`}
                    className="forum-topic-card-link"
                  >
                    <div className="card forum-topic-card">
                      <div className="forum-topic-card__header">
                        <span className="forum-cat-badge">{topic.category}</span>
                        <span className="forum-topic-date">
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="forum-topic-title">
                        {topic.isPinned && <span style={{ marginRight: '6px' }}>📌</span>}
                        {topic.title}
                      </h3>

                      <p className="forum-topic-snippet">{topic.content}</p>

                      <div className="forum-topic-footer">
                        <div className="forum-author-info">
                          <div className="forum-author-avatar">
                            {topic.author?.profileImageUrl ? (
                              <img src={topic.author.profileImageUrl} alt={topic.author.fullName} />
                            ) : (
                              <span>{topic.author?.fullName ? topic.author.fullName.charAt(0) : 'U'}</span>
                            )}
                          </div>
                          <span>
                            {topic.author?.fullName || 'Union Member'}
                            {topic.author?.campus && <small> • {topic.author.campus}</small>}
                          </span>
                        </div>

                        <div className="forum-stats">
                          <button
                            type="button"
                            className={`forum-stat-btn ${isLikedByMe ? 'is-liked' : ''}`}
                            onClick={(e) => handleLike(e, topic._id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <IconHeartTech size={13} color={isLikedByMe ? '#ef4444' : 'currentColor'} />
                            <span>{topic.likes?.length || 0}</span>
                          </button>
                          <span className="forum-stat-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <IconCommunityNodes size={13} />
                            <span>{topic.replies?.length || 0} {t('forum_page.replies') || 'replies'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Start Discussion Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>{t('forum_page.new_topic_title') || 'Start a New Discussion'}</h3>
            </div>
            <p className="modal-subtitle">
              {t('forum_page.new_topic_subtitle') || 'Ask a question, post housing needs, or coordinate break travel.'}
            </p>

            <form onSubmit={handleCreateTopic} className="auth-form">
              <label>
                {t('forum_page.topic_category') || 'Category'} *
                <select
                  value={topicForm.category}
                  onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                >
                  <option value="housing">Housing & Dorm Swaps</option>
                  <option value="rideshare">Break Travel & Rideshare</option>
                  <option value="academic">Academic Advice & Mentorship</option>
                  <option value="general">General Union Discussion</option>
                </select>
              </label>

              <label>
                {t('forum_page.topic_title') || 'Title / Question'} *
                <input
                  required
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  placeholder="e.g. Anyone traveling to Limmu Genet this Friday?"
                />
              </label>

              <label>
                {t('forum_page.topic_content') || 'Details / Message'} *
                <textarea
                  required
                  rows={5}
                  value={topicForm.content}
                  onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                  placeholder="Provide context, pickup points, dorm block numbers, or contact info..."
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setModalOpen(false)}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  {submitting ? t('common.loading') : (t('forum_page.post_btn') || 'Post Discussion')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
