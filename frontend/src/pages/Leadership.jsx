import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import './Leadership.css';

export default function Leadership() {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/members/leadership')
      .then((res) => setLeaders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="section section--dusk leadership-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>{t('leadership.title')}</h1>
          <p>{t('leadership.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : leaders.length === 0 ? (
            <p>{t('leadership.empty')}</p>
          ) : (
            <div className="leadership-grid">
              {leaders.map((leader) => (
                <div className="card leader-card" key={leader._id}>
                  <div className="leader-card__avatar">
                    {leader.profileImageUrl ? (
                      <img src={getMediaUrl(leader.profileImageUrl)} alt={leader.fullName} />
                    ) : (
                      <span>{leader.fullName?.charAt(0)}</span>
                    )}
                  </div>
                  <h3>{leader.fullName}</h3>
                  <p className="leader-card__position">{leader.leadershipPosition}</p>
                  <p className="leader-card__meta">
                    {[leader.department, leader.campus].filter(Boolean).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
