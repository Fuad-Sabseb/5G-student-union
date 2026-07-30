import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/gbsg-logo.jpg';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();
  const { member, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/membership', label: t('nav.membership') },
    { to: '/news', label: t('nav.news') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/leadership', label: t('nav.leadership') },
    { to: '/support', label: t('nav.support') },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="site-header__brand" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="GBSG emblem" className="site-header__logo" />
          <span className="site-header__brand-text">
            <strong>GBSG</strong>
            <small>Shanan Gibe Student Union</small>
          </span>
        </NavLink>

        <button
          className="site-header__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'site-header__nav is-open' : 'site-header__nav'}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'site-header__link is-active' : 'site-header__link'
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="site-header__actions">
            <LanguageSwitcher />
            {member ? (
              <>
                {member.role === 'admin' && (
                  <NavLink to="/admin" className="btn btn--outline">
                    {t('nav.admin')}
                  </NavLink>
                )}
                <NavLink to="/dashboard" className="btn btn--outline">
                  {t('nav.dashboard')}
                </NavLink>
                <button className="btn btn--gold" onClick={logout}>
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn--outline">
                  {t('nav.login')}
                </NavLink>
                <NavLink to="/register" className="btn btn--gold">
                  {t('nav.register')}
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
