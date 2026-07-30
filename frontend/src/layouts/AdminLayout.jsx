import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminLayout.css';

export default function AdminLayout() {
  const { t } = useTranslation();

  const links = [
    { to: '/admin/members', label: t('admin.nav_members') },
    { to: '/admin/announcements', label: t('admin.nav_announcements') },
    { to: '/admin/gallery', label: t('admin.nav_gallery') },
    { to: '/admin/blog', label: t('admin.nav_blog') },
    { to: '/admin/support', label: t('admin.nav_support') },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">{t('admin.nav_title')}</div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'admin-sidebar__link is-active' : 'admin-sidebar__link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="admin-sidebar__back">
          {t('admin.back_to_site')}
        </NavLink>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
