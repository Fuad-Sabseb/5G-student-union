import React from 'react';
import { useTranslation } from 'react-i18next';
import jimmaCityLogo from '../assets/partners/jimma-city-communication.jpg';
import jimmaUnivLogo from '../assets/partners/jimma-university.png';
import jimmaZoneLogo from '../assets/partners/jimma-zone-admin.jpg';
import './PartnersMarquee.css';

export default function PartnersMarquee() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'or' ? 'or' : 'en';

  const partners = [
    {
      id: 'jimma-city',
      name_en: 'Jimma City Communication Office',
      name_or: 'W/ra Kominikeeshinii Magaalaa Jimmaa',
      category_en: 'Government & Communication',
      category_or: 'Kominikeeshinii fi Odeeffannoo',
      logo: jimmaCityLogo,
    },
    {
      id: 'jimma-univ',
      name_en: 'Jimma University',
      name_or: 'Yuunivarsiitii Jimmaa',
      category_en: 'Academic & Research Partner',
      category_or: 'Dhaabbata Barnoota Olaanoo',
      logo: jimmaUnivLogo,
    },
    {
      id: 'jimma-zone',
      name_en: 'Jimma Zone Administration',
      name_or: 'Bulchiinsa Godina Jimmaa',
      category_en: 'Regional Administration',
      category_or: 'Bulchiinsa Godinaa',
      logo: jimmaZoneLogo,
    },
  ];

  // Repeat items to ensure smooth continuous marquee animation across wide screens
  const marqueeList = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="section section--dusk partners-section">
      <div className="container partners-header">
        <span className="eyebrow">{t('partners.eyebrow') || 'Collaborators & Partners'}</span>
        <h2>{t('partners.title') || 'Working Hand-in-Hand with Our Community'}</h2>
        <p className="partners-subtitle">
          {t('partners.subtitle') ||
            'Official institutions and organizations collaborating with Gamtaa Barattoota Shanan Gibee.'}
        </p>
      </div>

      <div className="partners-marquee-wrapper">
        <div className="partners-baseline-guide" aria-hidden="true" />
        <div className="partners-track">
          {marqueeList.map((p, idx) => (
            <div className="partner-node-card" key={`${p.id}-${idx}`}>
              <div className="partner-pin-stem">
                <div className="partner-pin-dot" />
              </div>
              <div className="partner-logo-badge">
                <img src={p.logo} alt={lang === 'or' ? p.name_or : p.name_en} />
              </div>
              <div className="partner-card-body">
                <strong className="partner-name">
                  {lang === 'or' ? p.name_or : p.name_en}
                </strong>
                <span className="partner-category">
                  {lang === 'or' ? p.category_or : p.category_en}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
