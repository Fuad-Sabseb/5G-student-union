import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import logo from '../assets/gbsg-logo.jpg';
import './Home.css';

const StarRow = ({ count = 5 }) => (
  <div className="star-divider" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i}>★</span>
    ))}
  </div>
);

export default function Home() {
  const { t } = useTranslation();

  const pillars = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`home.pillar_${n}_title`),
    body: t(`home.pillar_${n}_body`),
  }));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="section section--dusk hero">
        <div className="container hero__grid">
          <div>
            <span className="eyebrow">{t('home.hero_eyebrow')}</span>
            <h1>{t('home.hero_title')}</h1>
            <p className="hero__subtitle">{t('home.hero_subtitle')}</p>
            <div className="hero__actions">
              <NavLink to="/register" className="btn btn--gold">
                {t('home.cta_join')}
              </NavLink>
              <NavLink to="/about" className="btn btn--outline">
                {t('home.cta_learn')}
              </NavLink>
            </div>
          </div>
          <div className="hero__emblem">
            <img src={logo} alt="Gamtaa Barattoota Shanan Gibee emblem" />
          </div>
        </div>
      </section>

      {/* ---------- Meaning of "Gamtaa" ---------- */}
      <section className="section">
        <div className="container meaning">
          <h2>{t('home.meaning_title')}</h2>
          <p className="quote">&ldquo;{t('home.meaning_body')}&rdquo;</p>
        </div>
      </section>

      {/* ---------- Five pillars ---------- */}
      <section className="section section--canopy pillars">
        <div className="container">
          <h2>{t('home.pillars_title')}</h2>
          <StarRow />
          <div className="pillars__grid">
            {pillars.map((p, i) => (
              <div className="pillar-card" key={p.title}>
                <span className="pillar-card__star">★</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why we unite ---------- */}
      <section className="section stats">
        <div className="container stats__grid">
          <h2 className="stats__title">{t('home.stats_title')}</h2>
          <div className="stats__list">
            <p>{t('home.stat_1')}</p>
            <p>{t('home.stat_2')}</p>
            <p>{t('home.stat_3')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
