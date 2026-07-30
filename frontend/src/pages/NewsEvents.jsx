import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import api, { getMediaUrl } from '../api/client';
import '../styles/listing.css';
import './News.css';

export default function NewsEvents() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const lang = i18n.language === 'or' ? 'or' : 'en';

  useEffect(() => {
    setLoading(true);
    const params = filter === 'all' ? {} : { type: filter };
    api
      .get('/announcements', { params })
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <section className="section section--dusk news-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>{t('news_page.title')}</h1>
          <div className="news-tabs">
            {['all', 'news', 'event'].map((key) => (
              <button
                key={key}
                className={filter === key ? 'news-tab is-active' : 'news-tab'}
                onClick={() => setFilter(key)}
              >
                {t(`news_page.tab_${key}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <p>{t('news_page.empty')}</p>
          ) : (
            <div className="news-grid">
              {items.map((item) => (
                <NavLink to={`/news/${item._id}`} className="card news-card" key={item._id}>
                  {item.imageUrl && <img src={getMediaUrl(item.imageUrl)} alt="" className="news-card__image" />}
                  <span className={`news-card__type news-card__type--${item.type}`}>
                    {t(`news_page.tab_${item.type}`)}
                  </span>
                  <h3>{lang === 'or' ? item.title_or : item.title_en}</h3>
                  {item.type === 'event' && item.eventDate && (
                    <p className="news-card__date">
                      {t('news_page.event_date')}: {new Date(item.eventDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="news-card__excerpt">
                    {(lang === 'or' ? item.content_or : item.content_en).slice(0, 120)}...
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
