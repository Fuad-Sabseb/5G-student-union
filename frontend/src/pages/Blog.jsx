import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/listing.css';
import './Blog.css';

export default function Blog() {
  const { t } = useTranslation();
  const { member } = useAuth();
  const [posts, setPosts] = useState([]);
  const [langFilter, setLangFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = langFilter ? { language: langFilter } : {};
    api
      .get('/blog', { params })
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, [langFilter]);

  return (
    <>
      <section className="section section--dusk blog-hero">
        <div className="container blog-hero__row">
          <div>
            <span className="eyebrow">GBSG</span>
            <h1>{t('blog_page.title')}</h1>
            <p>{t('blog_page.subtitle')}</p>
          </div>
          {member?.membershipStatus === 'active' && (
            <NavLink to="/blog/new" className="btn btn--gold">
              {t('blog_page.write')}
            </NavLink>
          )}
        </div>
        <div className="container news-tabs">
          <button
            className={!langFilter ? 'news-tab is-active' : 'news-tab'}
            onClick={() => setLangFilter('')}
          >
            {t('blog_page.language_filter_all')}
          </button>
          <button
            className={langFilter === 'en' ? 'news-tab is-active' : 'news-tab'}
            onClick={() => setLangFilter('en')}
          >
            English
          </button>
          <button
            className={langFilter === 'or' ? 'news-tab is-active' : 'news-tab'}
            onClick={() => setLangFilter('or')}
          >
            Afaan Oromo
          </button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : posts.length === 0 ? (
            <p>{t('blog_page.empty')}</p>
          ) : (
            <div className="news-grid">
              {posts.map((post) => (
                <NavLink to={`/blog/${post._id}`} className="card news-card" key={post._id}>
                  {post.coverImageUrl && (
                    <img src={getMediaUrl(post.coverImageUrl)} alt="" className="news-card__image" />
                  )}
                  <span className="news-card__type">{post.language.toUpperCase()}</span>
                  <h3>{post.title}</h3>
                  <p className="news-card__excerpt">{post.content.slice(0, 120)}...</p>
                  <p className="news-card__date">
                    {t('blog_page.by')} {post.author?.fullName}
                  </p>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
