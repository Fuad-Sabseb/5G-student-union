import { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../api/client';
import {
  IconBuildingTech,
  IconMapPinTech,
  IconGraduationTech,
  IconCheckTech,
  IconSendTech,
} from '../components/TechIcons';
import './Alumni.css';
import '../styles/listing.css';

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.5 1.5 0 0 0-1.5 1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.83-.67-1.5-1.5-1.5Z" />
  </svg>
);

export default function Alumni() {
  const { t } = useTranslation();
  const { member } = useAuth();
  const location = useLocation();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradYearFilter, setGradYearFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [mentorsOnly, setMentorsOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Connect Modal State
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [sendingConnect, setSendingConnect] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Distinct lists for dropdowns
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDepts, setAvailableDepts] = useState([]);

  const loadAlumni = useCallback(() => {
    setLoading(true);
    const params = {};
    if (gradYearFilter) params.graduationYear = gradYearFilter;
    if (deptFilter) params.department = deptFilter;
    if (mentorsOnly) params.willingToMentor = true;
    if (search.trim()) params.search = search.trim();

    api
      .get('/members/alumni', { params })
      .then((res) => {
        const data = res.data || [];
        setAlumni(data);

        // Populate filter options dynamically from active dataset
        const years = Array.from(new Set(data.map((a) => a.graduationYear).filter(Boolean))).sort(
          (a, b) => b - a
        );
        const depts = Array.from(new Set(data.map((a) => a.department).filter(Boolean))).sort();

        setAvailableYears((prev) => (prev.length > 0 ? prev : years));
        setAvailableDepts((prev) => (prev.length > 0 ? prev : depts));
      })
      .catch(() => setAlumni([]))
      .finally(() => setLoading(false));
  }, [gradYearFilter, deptFilter, mentorsOnly, search]);

  useEffect(() => {
    const timeout = setTimeout(loadAlumni, 300);
    return () => clearTimeout(timeout);
  }, [loadAlumni]);

  const handleOpenConnectModal = (alum) => {
    setSelectedAlumnus(alum);
    setConnectMessage('');
    setConnectError('');
    setConnectSuccess(false);
  };

  const handleCloseConnectModal = () => {
    setSelectedAlumnus(null);
    setConnectMessage('');
    setConnectError('');
    setConnectSuccess(false);
  };

  const handleSubmitConnect = async (e) => {
    e.preventDefault();
    if (!selectedAlumnus) return;
    if (!connectMessage.trim()) {
      setConnectError('Please include a brief note explaining why you would like to connect.');
      return;
    }

    setSendingConnect(true);
    setConnectError('');

    try {
      await api.post('/support-requests', {
        category: 'alumni-connection',
        subject: `Alumni Connection Request: ${selectedAlumnus.fullName}`,
        description: `Introduction Request for Alumnus: ${selectedAlumnus.fullName} (${selectedAlumnus.currentOccupation || 'Graduate'}${
          selectedAlumnus.currentCompany ? ' at ' + selectedAlumnus.currentCompany : ''
        }, Class of ${selectedAlumnus.graduationYear || 'N/A'})\n\nRequester Message:\n${connectMessage.trim()}`,
      });

      setConnectSuccess(true);
      setTimeout(() => {
        handleCloseConnectModal();
      }, 2500);
    } catch (err) {
      setConnectError(err.response?.data?.message || 'Failed to submit connection request. Please try again.');
    } finally {
      setSendingConnect(false);
    }
  };

  const totalMentors = alumni.filter((a) => a.willingToMentor).length;

  return (
    <>
      {/* Hero Section */}
      <section className="section section--dusk alumni-hero">
        <div className="container">
          <span className="eyebrow">Gamtaa Barattoota Shanan Gibee</span>
          <h1>{t('alumni.title')}</h1>
          <p>{t('alumni.subtitle')}</p>

          <div className="alumni-stats-pills">
            <div className="alumni-stat-pill">
              <IconGraduationTech size={18} color="var(--color-star-gold)" />
              <span>
                <strong>{alumni.length}</strong> {t('alumni.alumni_count')}
              </span>
            </div>
            <div className="alumni-stat-pill">
              <span>⭐</span>
              <span>
                <strong>{totalMentors}</strong> {t('alumni.mentors_count')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section">
        <div className="container">
          {/* Filter Toolbar */}
          <div className="alumni-toolbar">
            <div className="alumni-toolbar__filters">
              {/* Search */}
              <input
                className="admin-input alumni-toolbar__search"
                placeholder={t('alumni.filter_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Graduation Year Filter */}
              <select
                className="admin-select"
                value={gradYearFilter}
                onChange={(e) => setGradYearFilter(e.target.value)}
              >
                <option value="">{t('alumni.filter_grad_year')}: {t('alumni.filter_all_years')}</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                className="admin-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">{t('alumni.filter_department')}: {t('alumni.filter_all_departments')}</option>
                {availableDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Mentors Only Filter Checkbox */}
              <label className="alumni-mentor-checkbox">
                <input
                  type="checkbox"
                  checked={mentorsOnly}
                  onChange={(e) => setMentorsOnly(e.target.checked)}
                />
                <span>⭐ {t('alumni.filter_mentors_only')}</span>
              </label>
            </div>
          </div>

          {/* Alumni Grid */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink-soft)' }}>
              {t('common.loading')}
            </p>
          ) : alumni.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-soft)', margin: 0 }}>
                {t('alumni.empty')}
              </p>
            </div>
          ) : (
            <div className="news-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {alumni.map((alum) => (
                <div key={alum._id} className="card alumni-card">
                  <div className="alumni-card__header">
                    <div className="alumni-avatar">
                      {alum.profileImageUrl ? (
                        <img src={getMediaUrl(alum.profileImageUrl)} alt={alum.fullName} />
                      ) : (
                        <span>{alum.fullName?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="alumni-card__titles">
                      <h3 className="alumni-name">{alum.fullName}</h3>
                      {alum.graduationYear && (
                        <span className="alumni-class-badge">
                          🎓 {t('alumni.class_of')} {alum.graduationYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {alum.willingToMentor && (
                    <div className="alumni-mentor-badge">
                      <span>⭐</span>
                      <span>{t('alumni.mentoring_badge')}</span>
                    </div>
                  )}

                  <div className="alumni-info-list">
                    {(alum.currentOccupation || alum.currentCompany) && (
                      <div className="alumni-info-item">
                        <IconBuildingTech size={16} color="var(--color-star-gold)" />
                        <span>
                          <strong>{alum.currentOccupation || 'Professional'}</strong>
                          {alum.currentCompany ? ` at ${alum.currentCompany}` : ''}
                        </span>
                      </div>
                    )}

                    {alum.currentLocation && (
                      <div className="alumni-info-item">
                        <IconMapPinTech size={16} color="var(--color-canopy)" />
                        <span>{alum.currentLocation}</span>
                      </div>
                    )}

                    {(alum.department || alum.campus) && (
                      <div className="alumni-info-item">
                        <IconGraduationTech size={16} color="var(--color-gibe-dusk)" />
                        <span>{[alum.department, alum.campus].filter(Boolean).join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  {alum.alumniBio && (
                    <p className="alumni-bio">
                      "{alum.alumniBio}"
                    </p>
                  )}

                  <div className="alumni-card__actions">
                    {alum.linkedinUrl && (
                      <a
                        href={alum.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn--linkedin"
                        title="View LinkedIn Profile"
                        aria-label={`${alum.fullName}'s LinkedIn profile`}
                      >
                        <LinkedInIcon />
                      </a>
                    )}

                    {member ? (
                      <button
                        type="button"
                        className="btn btn--gold btn--sm"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenConnectModal(alum)}
                      >
                        🤝 {t('alumni.request_connect')}
                      </button>
                    ) : (
                      <NavLink
                        to="/login"
                        state={{ from: location }}
                        className="btn btn--secondary btn--sm"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        🔒 {t('alumni.login_to_connect')}
                      </NavLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Connect / Introduction Request Modal */}
      {selectedAlumnus && (
        <div className="connect-modal-backdrop" onClick={handleCloseConnectModal}>
          <div className="connect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="connect-modal__header">
              <h3>
                {t('alumni.connect_modal_title')} {selectedAlumnus.fullName}
              </h3>
              <button
                type="button"
                className="connect-modal__close"
                onClick={handleCloseConnectModal}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>

            <div className="connect-modal__body">
              {connectSuccess ? (
                <div className="form-success" style={{ padding: '1.25rem', flexDirection: 'column', textAlign: 'center' }}>
                  <IconCheckTech size={32} color="var(--color-canopy)" />
                  <strong style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                    {t('alumni.request_sent_success')}
                  </strong>
                </div>
              ) : (
                <form onSubmit={handleSubmitConnect}>
                  <div className="connect-modal__privacy-note">
                    🛡️ {t('alumni.connect_modal_desc')}
                  </div>

                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.4rem' }}>
                    Introduction Note / Request Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder={t('alumni.connect_message_placeholder')}
                    className="admin-input"
                    style={{ width: '100%', resize: 'vertical' }}
                  />

                  {connectError && (
                    <p className="form-error" style={{ marginTop: '0.75rem' }}>
                      {connectError}
                    </p>
                  )}

                  <div className="connect-modal__actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={handleCloseConnectModal}
                      disabled={sendingConnect}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn--gold btn--sm"
                      disabled={sendingConnect || !connectMessage.trim()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <IconSendTech size={15} />
                      {sendingConnect ? t('common.loading') : t('alumni.send_request')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
