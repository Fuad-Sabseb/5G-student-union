import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import '../styles/listing.css';
import './Gallery.css';

export default function Gallery() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState('');
  const [loading, setLoading] = useState(true);

  const lang = i18n.language === 'or' ? 'or' : 'en';

  useEffect(() => {
    setLoading(true);
    const params = activeAlbum ? { album: activeAlbum } : {};
    api
      .get('/gallery', { params })
      .then((res) => {
        setItems(res.data);
        if (!activeAlbum) {
          setAlbums([...new Set(res.data.map((i) => i.album))]);
        }
      })
      .finally(() => setLoading(false));
  }, [activeAlbum]);

  return (
    <>
      <section className="section section--dusk gallery-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>{t('gallery_page.title')}</h1>
          <p>{t('gallery_page.subtitle')}</p>

          {albums.length > 0 && (
            <div className="news-tabs">
              <button
                className={!activeAlbum ? 'news-tab is-active' : 'news-tab'}
                onClick={() => setActiveAlbum('')}
              >
                {t('gallery_page.all_albums')}
              </button>
              {albums.map((album) => (
                <button
                  key={album}
                  className={activeAlbum === album ? 'news-tab is-active' : 'news-tab'}
                  onClick={() => setActiveAlbum(album)}
                >
                  {album}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <p>{t('gallery_page.empty')}</p>
          ) : (
            <div className="gallery-grid">
              {items.map((item) => (
                <figure className="gallery-item" key={item._id}>
                  <img
                    src={getMediaUrl(item.imageUrl)}
                    alt={(lang === 'or' ? item.caption_or : item.caption_en) || item.album}
                  />
                  {(item.caption_en || item.caption_or) && (
                    <figcaption>{lang === 'or' ? item.caption_or : item.caption_en}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
