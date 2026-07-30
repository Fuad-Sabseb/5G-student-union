import { useTranslation } from 'react-i18next';
import './About.css';

export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <section className="section section--dusk about-hero">
        <div className="container">
          <span className="eyebrow">GBSG</span>
          <h1>{t('about.title')}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <article className="card about-block">
            <h3>{t('about.definition_title')}</h3>
            <p>{t('about.definition_body')}</p>
          </article>

          <article className="card about-block">
            <h3>{t('about.mission_title')}</h3>
            <p>{t('about.mission_body')}</p>
          </article>

          <article className="card about-block">
            <h3>{t('about.vision_title')}</h3>
            <p>{t('about.vision_body')}</p>
          </article>

          <article className="card about-block">
            <h3>{t('about.bylaw_title')}</h3>
            <p>{t('about.bylaw_body')}</p>
          </article>
        </div>
      </section>

      <section className="section section--canopy">
        <div className="container">
          <h2>{t('about.roles_title')}</h2>
          <div className="star-divider star-divider--left" aria-hidden="true">
            <span>★</span><span>★</span><span>★</span>
          </div>
          <ol className="roles-list">
            <li>{t('about.role_1')}</li>
            <li>{t('about.role_2')}</li>
            <li>{t('about.role_3')}</li>
          </ol>
        </div>
      </section>
    </>
  );
}
