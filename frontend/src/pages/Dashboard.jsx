import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/listing.css';
import './Dashboard.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const { member } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    Promise.all([api.get('/support-requests/my'), api.get('/blog')])
      .then(([reqRes, blogRes]) => {
        setMyRequests(reqRes.data);
        setMyPosts(blogRes.data.filter((p) => p.author?._id === member._id));
      })
      .finally(() => setLoading(false));
  }, [member]);

  if (!member) return null;

  return (
    <>
      <section className="section section--dusk dashboard-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>
            {t('dashboard_page.welcome')}, {member.fullName}
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container dashboard-grid">
          <div className="card">
            <h3>{t('dashboard_page.your_status')}</h3>
            <span className={`status-badge status-badge--${member.membershipStatus}`}>
              {member.membershipStatus}
            </span>
            <h3 style={{ marginTop: '1.5rem' }}>{t('dashboard_page.your_role')}</h3>
            <p style={{ margin: 0 }}>{member.role}</p>
          </div>

          <div className="card">
            <h3>{t('dashboard_page.my_support_requests')}</h3>
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : myRequests.length === 0 ? (
              <p>{t('support_page.no_requests')}</p>
            ) : (
              <ul className="request-list">
                {myRequests.map((r) => (
                  <li key={r._id} className="request-item">
                    <div className="request-item__row">
                      <strong>{r.subject}</strong>
                      <span className={`status-badge status-badge--${r.status}`}>{r.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3>{t('dashboard_page.my_articles')}</h3>
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : myPosts.length === 0 ? (
              <p>{t('dashboard_page.no_articles')}</p>
            ) : (
              <ul className="request-list">
                {myPosts.map((p) => (
                  <li key={p._id} className="request-item">
                    <strong>{p.title}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
