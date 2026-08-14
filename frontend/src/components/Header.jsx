import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  IconUnionEmblem,
  IconUserTech,
  IconGalleryTech,
  IconAcademicDocs,
  IconCommunityNodes,
  IconArticleTech,
  IconBellTech,
  IconShieldLock,
  IconGraduationTech,
  IconSettingsTech,
  IconSupportHeadset,
} from './TechIcons';
import api from '../api/client';
import logo from '../assets/gbsg-logo.jpg';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();
  const { member, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Desktop: 'about' | 'hub' | 'userMenu' | null
  const [mobileAccordions, setMobileAccordions] = useState({ about: false, hub: false });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );
  const navRef = useRef(null);

  // Track window resize for mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setNotifOpen(false);
    setMenuOpen(false);
    setMobileAccordions({ about: false, hub: false });
  }, [location.pathname]);

  // Close dropdowns on outside click (desktop)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isMobile]);

  // Fetch notifications
  useEffect(() => {
    if (member) {
      api
        .get('/notifications')
        .then((res) => {
          const list = res.data?.notifications || res.data || [];
          setNotifications(Array.isArray(list) ? list : []);
          setUnreadCount(
            Array.isArray(list) ? list.filter((n) => !n.isRead).length : res.data?.unreadCount || 0
          );
        })
        .catch(() => {});
    }
  }, [member]);

  const toggleMobileAccordion = (name) => {
    setMobileAccordions((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {}
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  const isAboutActive = ['/about', '/leadership', '/gallery'].includes(location.pathname);
  const isHubActive = ['/resources', '/community', '/news', '/blog'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <header className="site-header" ref={navRef}>
      <div className="container site-header__inner">
        {/* Brand Logo & Title */}
        <Link to="/" className="site-header__brand" onClick={() => setMenuOpen(false)}>
          <div className="site-header__logo-wrapper">
            <img
              src={logo}
              alt="Gamtaa Barattoota Shanan Gibee"
              className="site-header__logo"
            />
            <div className="logo-glow-ring" />
          </div>
          <div className="site-header__titles">
            <span className="site-header__name">
              <span className="brand-name--full">Gamtaa Barattoota Shanan Gibee</span>
              <span className="brand-name--short">Gamtaa GBSG</span>
            </span>
            <span className="site-header__subname">Shanan Gibe Student Union • Jimma University</span>
          </div>
        </Link>

        {/* Header Right Actions (Language Switcher always visible + Burger) */}
        <div className="site-header__top-actions">
          <LanguageSwitcher />

          <button
            type="button"
            className={`site-header__burger ${menuOpen ? 'is-open' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* DESKTOP Navigation Bar */}
        {!isMobile && (
          <nav className="site-header__nav">
            {/* 1. Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'site-header__link is-active' : 'site-header__link'
              }
            >
              <span>{t('nav.home')}</span>
            </NavLink>

            {/* 2. About Us Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${openDropdown === 'about' ? 'is-open' : ''} ${
                isAboutActive ? 'is-parent-active' : ''
              }`}
              onMouseEnter={() => setOpenDropdown('about')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="nav-dropdown-trigger"
                onClick={() => setOpenDropdown((p) => (p === 'about' ? null : 'about'))}
                aria-expanded={openDropdown === 'about'}
              >
                <span>{t('nav.about_group') || 'About Us'}</span>
                <span className={`chevron-arrow ${openDropdown === 'about' ? 'is-flipped' : ''}`}>
                  ▾
                </span>
              </button>

              <div className={`nav-dropdown-menu ${openDropdown === 'about' ? 'is-visible' : ''}`}>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconUnionEmblem size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.about')}</strong>
                    <small>Mission, Vision & Union Bylaws</small>
                  </div>
                </NavLink>

                <NavLink
                  to="/leadership"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconUserTech size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.leadership')}</strong>
                    <small>Executive Committee & Representatives</small>
                  </div>
                </NavLink>

                <NavLink
                  to="/gallery"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconGalleryTech size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.gallery')}</strong>
                    <small>Campus Life & Cultural Event Photos</small>
                  </div>
                </NavLink>
              </div>
            </div>

            {/* 3. Student Hub Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${openDropdown === 'hub' ? 'is-open' : ''} ${
                isHubActive ? 'is-parent-active' : ''
              }`}
              onMouseEnter={() => setOpenDropdown('hub')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="nav-dropdown-trigger"
                onClick={() => setOpenDropdown((p) => (p === 'hub' ? null : 'hub'))}
                aria-expanded={openDropdown === 'hub'}
              >
                <span>{t('nav.student_hub') || 'Student Hub'}</span>
                <span className={`chevron-arrow ${openDropdown === 'hub' ? 'is-flipped' : ''}`}>
                  ▾
                </span>
              </button>

              <div className={`nav-dropdown-menu ${openDropdown === 'hub' ? 'is-visible' : ''}`}>
                <NavLink
                  to="/resources"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconAcademicDocs size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.resources') || 'Academic Hub'}</strong>
                    <small>Handbooks, Past Exams & Lecture Notes</small>
                  </div>
                </NavLink>

                <NavLink
                  to="/community"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconCommunityNodes size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.community') || 'Community Forum'}</strong>
                    <small>Housing, Travel Rideshare & Peer Advice</small>
                  </div>
                </NavLink>

                <NavLink
                  to="/news"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconArticleTech size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.news')}</strong>
                    <small>Official Announcements & Event RSVP</small>
                  </div>
                </NavLink>

                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    isActive ? 'nav-dropdown__item is-active' : 'nav-dropdown__item'
                  }
                >
                  <div className="dropdown-item-icon-box">
                    <IconArticleTech size={18} color="var(--color-star-gold)" />
                  </div>
                  <div className="dropdown-item-text">
                    <strong>{t('nav.blog')}</strong>
                    <small>Student Articles, Insights & Stories</small>
                  </div>
                </NavLink>
              </div>
            </div>

            {/* 4. Support */}
            <NavLink
              to="/support"
              className={({ isActive }) =>
                isActive ? 'site-header__link is-active' : 'site-header__link'
              }
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconSupportHeadset size={15} color="var(--color-star-gold)" />
                {t('nav.support')}
              </span>
            </NavLink>

            {/* 5. Actions Area */}
            <div className="site-header__actions">
              {member ? (
                <>
                  {/* Notification Bell */}
                  <div className="notification-bell-wrapper">
                    <button
                      type="button"
                      className="notification-bell-btn"
                      aria-label="Notifications"
                      onClick={() => {
                        setNotifOpen((v) => !v);
                        setOpenDropdown(null);
                      }}
                    >
                      <IconBellTech size={18} color="var(--color-star-gold)" />
                      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    {notifOpen && (
                      <div className="notification-dropdown">
                        <div className="notification-dropdown__header">
                          <strong>{t('nav.notifications') || 'Notifications'}</strong>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              className="mark-all-read-btn"
                              onClick={handleMarkAllRead}
                            >
                              {t('nav.mark_all_read') || 'Mark all read'}
                            </button>
                          )}
                        </div>
                        <div className="notification-dropdown__list">
                          {notifications.length === 0 ? (
                            <p className="no-notifs">
                              {t('nav.no_notifications') || 'No new notifications'}
                            </p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n._id}
                                className={`notification-item ${!n.isRead ? 'is-unread' : ''}`}
                                onClick={() => handleNotificationClick(n)}
                              >
                                <div className="notification-item__title">{n.title}</div>
                                <div className="notification-item__msg">{n.message}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="user-dropdown-wrapper">
                    <button
                      type="button"
                      className="user-avatar-btn"
                      onClick={() => setOpenDropdown((p) => (p === 'userMenu' ? null : 'userMenu'))}
                      aria-expanded={openDropdown === 'userMenu'}
                    >
                      <span className="user-avatar-initials">
                        {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <span className="user-avatar-name">{member.fullName?.split(' ')[0]}</span>
                      <span className="chevron-arrow">▾</span>
                    </button>

                    {openDropdown === 'userMenu' && (
                      <div className="user-menu-dropdown">
                        <div className="user-menu-dropdown__header">
                          <div className="user-menu-name">{member.fullName}</div>
                          <div className="user-menu-email">{member.email}</div>
                          <span className={`user-menu-role-badge role-badge--${member.role}`}>
                            {member.role === 'admin' ? (
                              <>
                                <IconShieldLock size={13} style={{ marginRight: 4 }} /> Administrator
                              </>
                            ) : member.role === 'exec' ? (
                              <>
                                <IconShieldLock size={13} style={{ marginRight: 4 }} /> Executive Leader
                              </>
                            ) : (
                              <>
                                <IconGraduationTech size={13} style={{ marginRight: 4 }} /> Student Member
                              </>
                            )}
                          </span>
                        </div>

                        <div className="user-menu-dropdown__links">
                          <NavLink
                            to="/profile"
                            className="user-menu-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <IconSettingsTech size={15} style={{ marginRight: 8 }} />
                            <span>{t('nav.profile') || 'Profile & Settings'}</span>
                          </NavLink>

                          <NavLink
                            to="/dashboard"
                            className="user-menu-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <IconAcademicDocs size={15} style={{ marginRight: 8 }} />
                            <span>{t('nav.dashboard') || 'Student Dashboard'}</span>
                          </NavLink>

                          {member.role === 'admin' && (
                            <NavLink
                              to="/admin"
                              className="user-menu-item user-menu-item--admin"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <IconShieldLock size={15} style={{ marginRight: 8 }} />
                              <span>{t('nav.admin') || 'Admin Panel'}</span>
                            </NavLink>
                          )}
                        </div>

                        <div className="user-menu-dropdown__footer">
                          <button
                            type="button"
                            className="user-menu-logout-btn"
                            onClick={() => {
                              setOpenDropdown(null);
                              logout();
                            }}
                          >
                            {t('nav.logout') || 'Log Out'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="site-header__auth-btns">
                  <NavLink
                    to="/login"
                    className="btn btn--outline-gold btn--sm header-login-btn"
                  >
                    {t('nav.login')}
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn btn--gold btn--sm header-register-btn"
                  >
                    {t('nav.register')}
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* MOBILE Slide-out Drawer via Portal (covers 100% viewport cleanly) */}
      {isMobile &&
        menuOpen &&
        createPortal(
          <>
            <div
              className="mobile-drawer-overlay"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="mobile-drawer" aria-label="Mobile Navigation">
              {/* Drawer Top Header */}
              <div className="mobile-drawer__header">
                <div className="mobile-drawer__brand">
                  <img src={logo} alt="GBSG" className="mobile-drawer__logo" />
                  <div>
                    <strong className="mobile-drawer__brand-title">GBSG</strong>
                    <small className="mobile-drawer__brand-sub">Jimma University</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="mobile-drawer__close-btn"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              <div className="mobile-drawer__content">
                {/* 1. Home Link */}
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link is-active' : 'mobile-nav-link'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{t('nav.home')}</span>
                </NavLink>

                {/* 2. About Us Accordion */}
                <div className="mobile-accordion">
                  <button
                    type="button"
                    className={`mobile-accordion-trigger ${
                      mobileAccordions.about || isAboutActive ? 'is-active' : ''
                    }`}
                    onClick={() => toggleMobileAccordion('about')}
                  >
                    <span>{t('nav.about_group') || 'About Us'}</span>
                    <span className={`chevron-arrow ${mobileAccordions.about ? 'is-flipped' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {mobileAccordions.about && (
                    <div className="mobile-accordion-body">
                      <NavLink
                        to="/about"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconUnionEmblem size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.about')}</strong>
                          <small>Mission, Vision & Union Bylaws</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/leadership"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconUserTech size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.leadership')}</strong>
                          <small>Executive Committee & Representatives</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/gallery"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconGalleryTech size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.gallery')}</strong>
                          <small>Campus Life & Cultural Event Photos</small>
                        </div>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 3. Student Hub Accordion */}
                <div className="mobile-accordion">
                  <button
                    type="button"
                    className={`mobile-accordion-trigger ${
                      mobileAccordions.hub || isHubActive ? 'is-active' : ''
                    }`}
                    onClick={() => toggleMobileAccordion('hub')}
                  >
                    <span>{t('nav.student_hub') || 'Student Hub'}</span>
                    <span className={`chevron-arrow ${mobileAccordions.hub ? 'is-flipped' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {mobileAccordions.hub && (
                    <div className="mobile-accordion-body">
                      <NavLink
                        to="/resources"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconAcademicDocs size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.resources') || 'Academic Hub'}</strong>
                          <small>Handbooks, Past Exams & Lecture Notes</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/community"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconCommunityNodes size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.community') || 'Community Forum'}</strong>
                          <small>Housing, Travel Rideshare & Peer Advice</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/news"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconArticleTech size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.news')}</strong>
                          <small>Official Announcements & Event RSVP</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/blog"
                        className="mobile-accordion-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="dropdown-item-icon-box">
                          <IconArticleTech size={18} color="var(--color-star-gold)" />
                        </div>
                        <div className="dropdown-item-text">
                          <strong>{t('nav.blog')}</strong>
                          <small>Student Articles, Insights & Stories</small>
                        </div>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 4. Support Link */}
                <NavLink
                  to="/support"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link is-active' : 'mobile-nav-link'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <IconSupportHeadset size={16} color="var(--color-star-gold)" />
                    {t('nav.support')}
                  </span>
                </NavLink>

                {/* 5. Member Profile or Auth Actions */}
                <div className="mobile-drawer__footer">
                  {member ? (
                    <div className="mobile-user-card">
                      <div className="mobile-user-card__header">
                        <span className="user-avatar-initials">
                          {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                        <div>
                          <div className="mobile-user-name">{member.fullName}</div>
                          <div className="mobile-user-email">{member.email}</div>
                        </div>
                      </div>

                      <div className="mobile-user-links">
                        <NavLink
                          to="/profile"
                          className="mobile-user-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          <IconSettingsTech size={16} style={{ marginRight: 8 }} />
                          <span>{t('nav.profile') || 'Profile & Settings'}</span>
                        </NavLink>

                        <NavLink
                          to="/dashboard"
                          className="mobile-user-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          <IconAcademicDocs size={16} style={{ marginRight: 8 }} />
                          <span>{t('nav.dashboard') || 'Student Dashboard'}</span>
                        </NavLink>

                        {member.role === 'admin' && (
                          <NavLink
                            to="/admin"
                            className="mobile-user-link"
                            onClick={() => setMenuOpen(false)}
                          >
                            <IconShieldLock size={16} style={{ marginRight: 8 }} />
                            <span>{t('nav.admin') || 'Admin Panel'}</span>
                          </NavLink>
                        )}

                        <button
                          type="button"
                          className="mobile-user-logout-btn"
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                        >
                          {t('nav.logout') || 'Log Out'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mobile-auth-buttons">
                      <NavLink
                        to="/login"
                        className="btn btn--outline-gold btn--full header-login-btn"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('nav.login')}
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="btn btn--gold btn--full header-register-btn"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('nav.register')}
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>,
          document.body
        )}
    </header>
  );
}
