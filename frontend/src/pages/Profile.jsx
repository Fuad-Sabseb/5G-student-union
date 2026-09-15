import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconUserTech, IconShieldLock, IconCheckTech } from '../components/TechIcons';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Profile.css';

export default function Profile() {
  const { t } = useTranslation();
  const { member, loadProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    studentId: '',
    campus: '',
    department: '',
    yearOfStudy: '',
    homeArea: '',
    preferredLanguage: 'or',
    profileImageUrl: '',
    isAlumni: false,
    graduationYear: '',
    currentOccupation: '',
    currentCompany: '',
    currentLocation: '',
    linkedinUrl: '',
    alumniBio: '',
    willingToMentor: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (member) {
      setProfileForm({
        fullName: member.fullName || '',
        phone: member.phone || '',
        studentId: member.studentId || '',
        campus: member.campus || '',
        department: member.department || '',
        yearOfStudy: member.yearOfStudy || '',
        homeArea: member.homeArea || '',
        preferredLanguage: member.preferredLanguage || 'or',
        profileImageUrl: member.profileImageUrl || '',
        isAlumni: Boolean(member.isAlumni),
        graduationYear: member.graduationYear || '',
        currentOccupation: member.currentOccupation || '',
        currentCompany: member.currentCompany || '',
        currentLocation: member.currentLocation || '',
        linkedinUrl: member.linkedinUrl || '',
        alumniBio: member.alumniBio || '',
        willingToMentor: Boolean(member.willingToMentor),
      });
    }
  }, [member]);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setProfileForm((prev) => ({ ...prev, [name]: val }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image size must be less than 5MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.imageUrl || res.data.url;
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      setProfileForm((prev) => ({ ...prev, profileImageUrl: uploadedUrl }));
      await api.put('/auth/profile', { profileImageUrl: uploadedUrl });

      if (loadProfile) {
        await loadProfile();
      }

      setProfileMsg({
        type: 'success',
        text: 'Profile photo uploaded and saved successfully!',
      });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to upload photo.',
      });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      await api.put('/auth/profile', {
        ...profileForm,
        yearOfStudy: profileForm.isAlumni ? undefined : profileForm.yearOfStudy ? Number(profileForm.yearOfStudy) : undefined,
        graduationYear: profileForm.isAlumni && profileForm.graduationYear ? Number(profileForm.graduationYear) : undefined,
      });
      if (loadProfile) await loadProfile();
      setProfileMsg({
        type: 'success',
        text: t('profile_page.profile_updated') || 'Personal information updated successfully!',
      });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({
        type: 'success',
        text: t('profile_page.password_updated') || 'Password changed successfully!',
      });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <section className="section section--dusk profile-hero">
        <div className="container">
          <span className="eyebrow">GBSG Account</span>
          <h1>{t('profile_page.title') || 'Account Settings & Profile'}</h1>
          <p>{t('profile_page.subtitle') || 'Manage your student details, profile photo, and security.'}</p>
        </div>
      </section>

      <section className="section">
        <div className="container profile-layout">
          {/* Sidebar */}
          <div className="card profile-sidebar">
            <div className="avatar-preview-box">
              <div className="avatar-circle">
                {profileForm.profileImageUrl ? (
                  <img
                    src={getMediaUrl(profileForm.profileImageUrl)}
                    alt={profileForm.fullName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="avatar-initials">
                    {profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'G'}
                  </span>
                )}
              </div>
              <label className="btn btn--outline btn--sm avatar-upload-btn" style={{ cursor: 'pointer' }}>
                {uploadingImage ? t('common.loading') : (t('profile_page.change_photo') || 'Upload Photo')}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div className="profile-user-summary">
              <h3>{profileForm.fullName || member?.fullName}</h3>
              <p className="profile-user-email">{member?.email}</p>
              <div className="profile-user-badges">
                <span className={`status-badge status-badge--${member?.membershipStatus}`}>
                  {member?.membershipStatus}
                </span>
                <span className="role-tag">{member?.role}</span>
              </div>
            </div>

            <nav className="profile-nav-tabs">
              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('profile')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <IconUserTech size={15} />
                <span>{t('profile_page.tab_profile') || 'Personal Profile'}</span>
              </button>
              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'password' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('password')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <IconShieldLock size={15} />
                <span>{t('profile_page.tab_security') || 'Password & Security'}</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="card profile-content">
            {activeTab === 'profile' ? (
              <div>
                <h2>{t('profile_page.student_details') || 'Personal Information'}</h2>
                <p className="form-notice">
                  {t('profile_page.details_help') || 'Keep your university campus, year of study, and contact details updated so the union can best support you.'}
                </p>

                {profileMsg.text && (
                  <p className={profileMsg.type === 'success' ? 'form-success' : 'form-error'} style={{ marginBottom: '1.25rem' }}>
                    {profileMsg.text}
                  </p>
                )}

                {/* Member Type Toggle */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-gibe-dusk)' }}>
                    {t('membership.member_type') || 'Member Category'}
                  </label>
                  <div className="auth-tabs" role="tablist">
                    <button
                      type="button"
                      className={`auth-tab ${!profileForm.isAlumni ? 'is-active' : ''}`}
                      onClick={() => setProfileForm((prev) => ({ ...prev, isAlumni: false }))}
                    >
                      🎓 {t('membership.type_student') || 'Current Student'}
                    </button>
                    <button
                      type="button"
                      className={`auth-tab ${profileForm.isAlumni ? 'is-active' : ''}`}
                      onClick={() => setProfileForm((prev) => ({ ...prev, isAlumni: true }))}
                    >
                      💼 {t('membership.type_alumni') || 'Alumnus / Graduate'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="auth-form">
                  <div className="auth-form__grid">
                    <label className="span-2">
                      {t('membership.full_name')} *
                      <input
                        name="fullName"
                        required
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label>
                      {t('membership.phone')}
                      <input
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="+251 9..."
                      />
                    </label>

                    {/* Student vs Alumni Fields */}
                    {!profileForm.isAlumni ? (
                      <>
                        <label>
                          {t('membership.student_id')}
                          <input
                            name="studentId"
                            value={profileForm.studentId}
                            onChange={handleProfileChange}
                            placeholder="e.g. R/1234/14"
                          />
                        </label>

                        <label>
                          {t('membership.campus')}
                          <input
                            name="campus"
                            value={profileForm.campus}
                            onChange={handleProfileChange}
                            placeholder="e.g. Jimma University Main Campus"
                          />
                        </label>

                        <label>
                          {t('membership.department')}
                          <input
                            name="department"
                            value={profileForm.department}
                            onChange={handleProfileChange}
                            placeholder="e.g. Computer Science / Medicine"
                          />
                        </label>

                        <label>
                          {t('membership.year_of_study')}
                          <input
                            type="number"
                            min="1"
                            max="7"
                            name="yearOfStudy"
                            value={profileForm.yearOfStudy}
                            onChange={handleProfileChange}
                            placeholder="1 - 7"
                          />
                        </label>

                        <label>
                          {t('membership.home_area')}
                          <input
                            name="homeArea"
                            value={profileForm.homeArea}
                            onChange={handleProfileChange}
                            placeholder="Kebele / Woreda in Shanan Gibe"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          {t('membership.graduation_year')}
                          <input
                            type="number"
                            name="graduationYear"
                            min={1980}
                            max={2050}
                            value={profileForm.graduationYear}
                            onChange={handleProfileChange}
                            placeholder="e.g. 2023"
                          />
                        </label>

                        <label>
                          {t('membership.current_occupation')}
                          <input
                            name="currentOccupation"
                            value={profileForm.currentOccupation}
                            onChange={handleProfileChange}
                            placeholder="e.g. Software Engineer / Physician"
                          />
                        </label>

                        <label>
                          {t('membership.current_company')}
                          <input
                            name="currentCompany"
                            value={profileForm.currentCompany}
                            onChange={handleProfileChange}
                            placeholder="e.g. Ethio Telecom"
                          />
                        </label>

                        <label>
                          {t('membership.current_location')}
                          <input
                            name="currentLocation"
                            value={profileForm.currentLocation}
                            onChange={handleProfileChange}
                            placeholder="e.g. Addis Ababa, Ethiopia"
                          />
                        </label>

                        <label className="span-2">
                          {t('membership.linkedin_url')}
                          <input
                            type="url"
                            name="linkedinUrl"
                            value={profileForm.linkedinUrl}
                            onChange={handleProfileChange}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </label>

                        <label className="span-2">
                          {t('membership.alumni_bio')}
                          <textarea
                            name="alumniBio"
                            rows={3}
                            value={profileForm.alumniBio}
                            onChange={handleProfileChange}
                            placeholder="Share your current work or advice for union students..."
                          />
                        </label>

                        <label className="span-2" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                          <input
                            type="checkbox"
                            name="willingToMentor"
                            checked={profileForm.willingToMentor}
                            onChange={handleProfileChange}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.9rem', color: 'var(--color-gibe-dusk)', fontWeight: 600 }}>
                            ⭐ {t('membership.willing_to_mentor') || 'Willing to mentor union students'}
                          </span>
                        </label>
                      </>
                    )}

                    <label className="span-2">
                      {t('membership.preferred_language')}
                      <select
                        name="preferredLanguage"
                        value={profileForm.preferredLanguage}
                        onChange={handleProfileChange}
                      >
                        <option value="or">Afaan Oromo</option>
                        <option value="en">English</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <button type="submit" className="btn btn--gold" disabled={savingProfile}>
                      {savingProfile ? t('common.loading') : (t('common.save') || 'Save Profile Changes')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2>{t('profile_page.change_password') || 'Change Password'}</h2>
                <p className="form-notice">
                  {t('profile_page.password_notice') || 'For your security, you must provide your current password before setting a new one.'}
                </p>

                {passwordMsg.text && (
                  <p className={passwordMsg.type === 'success' ? 'form-success' : 'form-error'} style={{ marginBottom: '1.25rem' }}>
                    {passwordMsg.text}
                  </p>
                )}

                <form onSubmit={handlePasswordSubmit} className="auth-form" style={{ maxWidth: '440px' }}>
                  <label>
                    {t('profile_page.current_password')} *
                    <input
                      type="password"
                      name="currentPassword"
                      required
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </label>

                  <label>
                    {t('profile_page.new_password')} *
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                  </label>

                  <label>
                    {t('profile_page.confirm_password')} *
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </label>

                  <div style={{ marginTop: '1rem' }}>
                    <button type="submit" className="btn btn--gold" disabled={savingPassword}>
                      {savingPassword ? t('common.loading') : (t('profile_page.update_password_btn') || 'Update Password')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
