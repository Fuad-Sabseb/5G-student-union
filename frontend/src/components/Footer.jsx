import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/gbsg-logo.jpg';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

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

        <div className="site-footer__col">
          <h4>{t('footer.contact')}</h4>
          <p>{t('footer.location')}</p>
          <p>Jimma University</p>
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
