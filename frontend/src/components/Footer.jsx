import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/gbsg-logo.jpg';
import './Footer.css';

const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.95-4.49V8.5a8.28 8.28 0 0 0 4.82 1.54V6.69z" />
    </svg>
  ),
  Telegram: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
};

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/gamtaabarattootaashanangibee',
      icon: SocialIcons.Facebook,
      colorClass: 'footer-social-btn--facebook',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@gamtaa.barattoota5gju?_r=1&_t=ZS-98sz28jJ3Js',
      icon: SocialIcons.TikTok,
      colorClass: 'footer-social-btn--tiktok',
    },
    {
      name: 'Telegram',
      url: 'https://t.me/OfficialchannelofgamtaaB5G',
      icon: SocialIcons.Telegram,
      colorClass: 'footer-social-btn--telegram',
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <img src={logo} alt="GBSG emblem" className="site-footer__logo" />
          <div>
            <strong>Gamtaa Barattoota Shanan Gibee</strong>
            <p>{t('footer.tagline')}</p>
          </div>
        </div>

        <div className="site-footer__col">
          <h4>{t('footer.quick_links')}</h4>
          <NavLink to="/about">{t('nav.about')}</NavLink>
          <NavLink to="/membership">{t('nav.membership')}</NavLink>
          <NavLink to="/news">{t('nav.news')}</NavLink>
          <NavLink to="/support">{t('nav.support')}</NavLink>
        </div>

        <div className="site-footer__col site-footer__contact-col">
          <h4>{t('footer.contact')}</h4>
          <p className="footer-contact-item">
            <span className="contact-icon">📍</span> {t('footer.location')} • Jimma University
          </p>
          <a
            href="mailto:gamtaabarattootashanangibeeju@gmail.com"
            className="footer-contact-item footer-email-link"
            title="Send Email to GBSG Union"
          >
            <span className="contact-icon">✉</span> gamtaabarattootashanangibeeju@gmail.com
          </a>
        </div>

        <div className="site-footer__col site-footer__social-col">
          <h4>{t('footer.connect_with_us')}</h4>
          <p className="site-footer__social-tagline">{t('footer.social_tagline')}</p>
          <div className="site-footer__social-row">
            {socialLinks.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`footer-social-btn ${s.colorClass}`}
                  aria-label={`Follow GBSG on ${s.name}`}
                  title={s.name}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="star-divider" aria-hidden="true">
        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
      </div>

      <div className="container site-footer__bottom">
        <span>© {year} {t('footer.rights')}</span>
      </div>
    </footer>
  );
}
