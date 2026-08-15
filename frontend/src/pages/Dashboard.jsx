import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { IconCheckTech } from '../components/TechIcons';
import '../styles/listing.css';
import '../styles/admin.css';
import './Dashboard.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const { member, loadProfile } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Self-Service Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    department: '',
    campus: '',
    homeArea: '',
    studentId: '',
    yearOfStudy: '',
    isAlumni: false,
    graduationYear: '',
    currentOccupation: '',
    currentCompany: '',
    currentLocation: '',
    linkedinUrl: '',
    alumniBio: '',
    willingToMentor: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!member) return;

    // Initialize profile form with logged-in member data
    setProfileForm({
      fullName: member.fullName || '',
      phone: member.phone || '',
      department: member.department || '',
      campus: member.campus || '',
      homeArea: member.homeArea || '',
      studentId: member.studentId || '',
      yearOfStudy: member.yearOfStudy || '',
      isAlumni: Boolean(member.isAlumni),
      graduationYear: member.graduationYear || '',
      currentOccupation: member.currentOccupation || '',
      currentCompany: member.currentCompany || '',
      currentLocation: member.currentLocation || '',
      linkedinUrl: member.linkedinUrl || '',
      alumniBio: member.alumniBio || '',
      willingToMentor: Boolean(member.willingToMentor),
    });

    Promise.all([api.get('/support-requests/my'), api.get('/blog')])
      .then(([reqRes, blogRes]) => {
        setMyRequests(reqRes.data || []);
        setMyPosts((blogRes.data || []).filter((p) => p.author?._id === member._id));
      })
      .finally(() => setLoading(false));
  }, [member]);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      await api.put('/auth/profile', {
        ...profileForm,
        yearOfStudy: profileForm.isAlumni ? undefined : profileForm.yearOfStudy ? Number(profileForm.yearOfStudy) : undefined,
        graduationYear: profileForm.isAlumni && profileForm.graduationYear ? Number(profileForm.graduationYear) : undefined,
      });
      if (loadProfile) await loadProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

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
          {/* Status Card */}
          <div className="card">
            <h3>{t('dashboard_page.your_status')}</h3>
            <span className={`status-badge status-badge--${member.membershipStatus}`}>
              {member.membershipStatus}
            </span>
            <h3 style={{ marginTop: '1.5rem' }}>{t('dashboard_page.your_role')}</h3>
            <p style={{ margin: 0, textTransform: 'capitalize' }}>{member.role}</p>

            {member.isAlumni && (
              <div style={{ marginTop: '1.5rem' }}>
                <span className="status-badge status-badge--active" style={{ background: 'rgba(217, 164, 65, 0.2)', color: 'var(--color-gibe-dusk)', border: '1px solid rgba(217, 164, 65, 0.4)' }}>
                  🎓 Alumni Member
                </span>
              </div>
            )}
          </div>

          {/* Support Requests */}
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

          {/* Articles */}
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

          {/* Self-Service Profile Editor */}
          <div className="card span-full" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>💼 {t('dashboard_page.edit_profile')}</h3>
              {saveSuccess && (
                <div className="form-success" style={{ padding: '0.4rem 0.85rem', fontSize: '0.88rem' }}>
                  <IconCheckTech size={18} color="var(--color-canopy)" />
                  <span>{t('dashboard_page.profile_updated')}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* Alumni Status Checkbox */}
              <div style={{ padding: '0.85rem 1rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(217, 164, 65, 0.3)', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', margin: 0, fontWeight: 700, color: 'var(--color-gibe-dusk)' }}>
                  <input
                    type="checkbox"
                    name="isAlumni"
                    checked={profileForm.isAlumni}
                    onChange={handleProfileChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>🎓 {t('dashboard_page.is_alumni_label')}</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <label>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                    {t('membership.full_name')}
                  </span>
                  <input
                    className="admin-input"
                    name="fullName"
                    required
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                  />
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                    {t('membership.phone')}
                  </span>
                  <input
                    className="admin-input"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+251 9..."
                  />
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                    {t('membership.department')}
                  </span>
                  <input
                    className="admin-input"
                    name="department"
                    value={profileForm.department}
                    onChange={handleProfileChange}
                    placeholder="e.g. Electrical Engineering"
                  />
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                    {t('membership.campus')}
                  </span>
                  <input
                    className="admin-input"
                    name="campus"
                    value={profileForm.campus}
                    onChange={handleProfileChange}
                    placeholder="e.g. Jimma University Main Campus"
                  />
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                    {t('membership.home_area')}
                  </span>
                  <input
                    className="admin-input"
                    name="homeArea"
                    value={profileForm.homeArea}
                    onChange={handleProfileChange}
                    placeholder="Kebele / Woreda in Shanan Gibe"
                  />
                </label>

                {!profileForm.isAlumni ? (
                  <>
                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.student_id')}
                      </span>
                      <input
                        className="admin-input"
                        name="studentId"
                        value={profileForm.studentId}
                        onChange={handleProfileChange}
                        placeholder="e.g. R/1234/14"
                      />
                    </label>

                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.year_of_study')}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        className="admin-input"
                        name="yearOfStudy"
                        value={profileForm.yearOfStudy}
                        onChange={handleProfileChange}
                        placeholder="1 - 7"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.graduation_year')}
                      </span>
                      <input
                        type="number"
                        min="1980"
                        max="2050"
                        className="admin-input"
                        name="graduationYear"
                        value={profileForm.graduationYear}
                        onChange={handleProfileChange}
                        placeholder="e.g. 2023"
                      />
                    </label>

                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.current_occupation')}
                      </span>
                      <input
                        className="admin-input"
                        name="currentOccupation"
                        value={profileForm.currentOccupation}
                        onChange={handleProfileChange}
                        placeholder="e.g. Software Engineer / Resident Physician"
                      />
                    </label>

                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.current_company')}
                      </span>
                      <input
                        className="admin-input"
                        name="currentCompany"
                        value={profileForm.currentCompany}
                        onChange={handleProfileChange}
                        placeholder="e.g. Google / Commercial Bank of Ethiopia"
                      />
                    </label>

                    <label>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.current_location')}
                      </span>
                      <input
                        className="admin-input"
                        name="currentLocation"
                        value={profileForm.currentLocation}
                        onChange={handleProfileChange}
                        placeholder="e.g. Addis Ababa, Ethiopia"
                      />
                    </label>

                    <label style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.linkedin_url')}
                      </span>
                      <input
                        type="url"
                        className="admin-input"
                        name="linkedinUrl"
                        value={profileForm.linkedinUrl}
                        onChange={handleProfileChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </label>

                    <label style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gibe-dusk)', marginBottom: '0.35rem' }}>
                        {t('membership.alumni_bio')}
                      </span>
                      <textarea
                        rows={3}
                        className="admin-input"
                        name="alumniBio"
                        value={profileForm.alumniBio}
                        onChange={handleProfileChange}
                        placeholder="Brief bio or career reflections for union members..."
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </label>

                    <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="willingToMentor"
                        checked={profileForm.willingToMentor}
                        onChange={handleProfileChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gibe-dusk)', fontWeight: 600 }}>
                        ⭐ {t('membership.willing_to_mentor')}
                      </span>
                    </label>
                  </>
                )}
              </div>

              {saveError && <p className="form-error" style={{ marginBottom: '1rem' }}>{saveError}</p>}

              <button
                type="submit"
                className="btn btn--gold btn--sm"
                disabled={savingProfile}
              >
                {savingProfile ? t('common.loading') : t('dashboard_page.save_changes')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
