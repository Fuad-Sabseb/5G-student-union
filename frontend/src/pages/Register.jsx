import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { extractNameFromGmail } from './Login';
import GoogleAccountChooserModal from '../components/GoogleAccountChooserModal';
import {
  IconShieldLock,
  IconMailTech,
  IconCheckTech,
  IconBulbTech,
  IconRefreshTech,
} from '../components/TechIcons';
import api from '../api/client';
import '../styles/authForm.css';

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  studentId: '',
  campus: '',
  department: '',
  yearOfStudy: '',
  homeArea: '',
  preferredLanguage: 'or',
  isAlumni: false,
  graduationYear: '',
  currentOccupation: '',
  currentCompany: '',
  currentLocation: '',
  linkedinUrl: '',
  alumniBio: '',
  willingToMentor: false,
};

export default function Register() {
  const { t } = useTranslation();
  const { member, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [formType, setFormType] = useState('full'); // 'quick' | 'full'
  const [form, setForm] = useState(initialForm);
  const [hasManuallyEditedName, setHasManuallyEditedName] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const otpInputRef = useRef(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (member) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [member, navigate, location]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 'verify' && resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Focus OTP input when entering verify step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (name === 'fullName') {
      setHasManuallyEditedName(true);
    }
    // If typing email and user hasn't typed name, auto-extract name
    if (name === 'email' && !hasManuallyEditedName) {
      const autoName = extractNameFromGmail(value);
      setForm((prev) => ({
        ...prev,
        email: value,
        fullName: autoName || prev.fullName,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // Step 1: Send verification code to Gmail
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const targetEmail = form.email.trim().toLowerCase();
      const res = await api.post('/auth/send-verification-code', {
        email: targetEmail,
        language: form.preferredLanguage,
      });

      if (res.data.devCode) {
        setDevCode(res.data.devCode);
        setVerificationCode(res.data.devCode); // Pre-fill in dev mode for convenient 1-click test
      }

      setStep('verify');
      setResendCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend Code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/send-verification-code', {
        email: form.email.trim().toLowerCase(),
        language: form.preferredLanguage,
      });
      if (res.data.devCode) {
        setDevCode(res.data.devCode);
        setVerificationCode(res.data.devCode);
      }
      setResendCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Submit 6-digit OTP and complete registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code sent to your email');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await register({
        ...form,
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName || extractNameFromGmail(form.email) || form.email.split('@')[0],
        yearOfStudy: form.isAlumni ? undefined : form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
        graduationYear: form.isAlumni && form.graduationYear ? Number(form.graduationYear) : undefined,
        studentId: form.isAlumni ? undefined : form.studentId,
        verificationCode: verificationCode.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        const destination = location.state?.from?.pathname || '/';
        navigate(destination, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAccountSelected = async (googlePayload) => {
    setError('');
    setSubmitting(true);
    try {
      await googleLogin({
        ...googlePayload,
        preferredLanguage: form.preferredLanguage,
        isAlumni: form.isAlumni,
        graduationYear: form.isAlumni && form.graduationYear ? Number(form.graduationYear) : undefined,
        currentOccupation: form.currentOccupation,
        currentCompany: form.currentCompany,
        currentLocation: form.currentLocation,
        willingToMentor: form.willingToMentor,
      });
      setGoogleChooserOpen(false);
      setSuccess(true);
      setTimeout(() => {
        const destination = location.state?.from?.pathname || '/';
        navigate(destination, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isGatedNotice = location.state?.from;

  return (
    <section className="section auth-page">
      <div className="container auth-page__inner">
        <div className="card auth-card auth-card--wide card--elevated">
          <div className="auth-card__header">
            <span className="eyebrow">Gamtaa Barattoota Shanan Gibee</span>
            <h1>{t('membership.title')}</h1>
            <p className="auth-card__subtitle">{t('membership.subtitle')}</p>
          </div>

          {isGatedNotice && (
            <div className="auth-gate-banner">
              <span className="auth-gate-banner__icon">
                <IconShieldLock size={22} color="var(--color-star-gold)" />
              </span>
              <div>
                <strong>{t('auth.portal_access_required')}</strong>
                <p>{t('auth.portal_access_desc')}</p>
              </div>
            </div>
          )}

          {/* Member Category: Student vs Alumnus Toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-gibe-dusk)' }}>
              {t('membership.member_type')}
            </label>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${!form.isAlumni ? 'is-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, isAlumni: false }))}
              >
                🎓 {t('membership.type_student')}
              </button>
              <button
                type="button"
                className={`auth-tab ${form.isAlumni ? 'is-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, isAlumni: true }))}
              >
                💼 {t('membership.type_alumni')}
              </button>
            </div>
          </div>

          {/* Registration Mode Tabs */}
          {!form.isAlumni && (
            <div className="auth-tabs" role="tablist" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`auth-tab ${formType === 'full' ? 'is-active' : ''}`}
                onClick={() => setFormType('full')}
              >
                {t('membership.tab_full')}
              </button>
              <button
                type="button"
                className={`auth-tab ${formType === 'quick' ? 'is-active' : ''}`}
                onClick={() => setFormType('quick')}
              >
                {t('membership.tab_quick')}
              </button>
            </div>
          )}

          <p className="form-notice">{t('membership.pending_notice')}</p>

          {success ? (
            <div className="form-success">
              <IconCheckTech size={22} color="var(--color-canopy)" />
              <span>{t('membership.success')}</span>
            </div>
          ) : step === 'verify' ? (
            /* STEP 2: 6-Digit Verification Code (OTP) */
            <div className="verification-card">
              <div className="verification-icon-wrap">
                <IconMailTech size={32} color="var(--color-star-gold)" />
              </div>
              <h2 className="verification-title">
                {form.preferredLanguage === 'or' ? 'Koodii Mirkaneessaa Galchaa' : 'Verify Your Email'}
              </h2>
              <p className="verification-desc">
                {form.preferredLanguage === 'or'
                  ? 'Koodiin lakkoofsa 6 qabu gara Gmail keessaniitti ergameera:'
                  : 'We have sent a 6-digit verification code to:'}
                <br />
                <span className="verification-email-badge">
                  <IconMailTech size={14} color="var(--color-star-gold)" /> {form.email}
                </span>
              </p>

              {devCode && (
                <div className="dev-code-banner">
                  <IconBulbTech size={16} color="#10b981" />
                  <span>Test OTP Code:</span>
                  <span className="dev-code-badge">{devCode}</span>
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister}>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  placeholder="------"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="verification-code-input"
                  autoComplete="one-time-code"
                />

                {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  disabled={submitting || verificationCode.length !== 6}
                >
                  {submitting
                    ? t('common.loading')
                    : form.preferredLanguage === 'or'
                    ? 'Mirkaneessi & Galmee Xumuri'
                    : 'Verify & Complete Registration'}
                </button>
              </form>

              <div className="verification-resend-row">
                <button
                  type="button"
                  className="btn--resend-code"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || submitting}
                >
                  <IconRefreshTech size={14} style={{ marginRight: 4 }} />
                  {resendCountdown > 0
                    ? `${form.preferredLanguage === 'or' ? 'Irra deebi\'i' : 'Resend code in'} (${resendCountdown}s)`
                    : form.preferredLanguage === 'or'
                    ? 'Koodii Irra Deebi\'ii Ergi'
                    : 'Resend Verification Code'}
                </button>

                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--color-ink-soft)', cursor: 'pointer', fontSize: '0.85rem' }}
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                >
                  ← {form.preferredLanguage === 'or' ? 'Email Sirreessi' : 'Edit Details'}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: Registration Form Details */
            <>
              <form onSubmit={handleInitiateRegistration} className="auth-form">
                <div className="auth-form__grid">
                  <label className="span-2">
                    {t('membership.email')} (Gmail) *
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="user@gmail.com"
                      autoComplete="email"
                    />
                  </label>

                  <label className="span-2">
                    {t('membership.full_name')} *
                    <input
                      name="fullName"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Caalaa Abbaa Dulaa (auto-filled from Gmail)"
                    />
                  </label>

                  <label className="span-2">
                    {t('membership.password')} *
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                  </label>

                  {/* Dynamic Fields for ALUMNI vs CURRENT STUDENT */}
                  {form.isAlumni ? (
                    <>
                      <label>
                        {t('membership.graduation_year')} *
                        <input
                          type="number"
                          name="graduationYear"
                          required
                          min={1980}
                          max={2050}
                          value={form.graduationYear}
                          onChange={handleChange}
                          placeholder="e.g. 2023"
                        />
                      </label>

                      <label>
                        {t('membership.phone')}
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+251 9..."
                        />
                      </label>

                      <label>
                        {t('membership.current_occupation')} *
                        <input
                          name="currentOccupation"
                          required
                          value={form.currentOccupation}
                          onChange={handleChange}
                          placeholder="e.g. Software Engineer / Physician"
                        />
                      </label>

                      <label>
                        {t('membership.current_company')}
                        <input
                          name="currentCompany"
                          value={form.currentCompany}
                          onChange={handleChange}
                          placeholder="e.g. Ethio Telecom / St. Paul Hospital"
                        />
                      </label>

                      <label>
                        {t('membership.current_location')}
                        <input
                          name="currentLocation"
                          value={form.currentLocation}
                          onChange={handleChange}
                          placeholder="e.g. Addis Ababa, Ethiopia"
                        />
                      </label>

                      <label>
                        {t('membership.department')}
                        <input
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          placeholder="e.g. Electrical Engineering"
                        />
                      </label>

                      <label className="span-2">
                        {t('membership.linkedin_url')}
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={form.linkedinUrl}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </label>

                      <label className="span-2">
                        {t('membership.alumni_bio')}
                        <textarea
                          name="alumniBio"
                          rows={3}
                          value={form.alumniBio}
                          onChange={handleChange}
                          placeholder="Share your current work or advice for union students..."
                        />
                      </label>

                      <label className="span-2" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                        <input
                          type="checkbox"
                          name="willingToMentor"
                          checked={form.willingToMentor}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-gibe-dusk)', fontWeight: 600 }}>
                          ⭐ {t('membership.willing_to_mentor')}
                        </span>
                      </label>
                    </>
                  ) : (
                    formType === 'full' && (
                      <>
                        <label>
                          {t('membership.phone')}
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+251 9..."
                          />
                        </label>
                        <label>
                          {t('membership.student_id')}
                          <input
                            name="studentId"
                            value={form.studentId}
                            onChange={handleChange}
                            placeholder="e.g. R/1234/14"
                          />
                        </label>
                        <label>
                          {t('membership.campus')}
                          <input
                            name="campus"
                            value={form.campus}
                            onChange={handleChange}
                            placeholder="e.g. Jimma University Main Campus"
                          />
                        </label>
                        <label>
                          {t('membership.department')}
                          <input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
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
                            value={form.yearOfStudy}
                            onChange={handleChange}
                            placeholder="1 - 7"
                          />
                        </label>
                        <label>
                          {t('membership.home_area')}
                          <input
                            name="homeArea"
                            value={form.homeArea}
                            onChange={handleChange}
                            placeholder="Kebele / Woreda in Shanan Gibe"
                          />
                        </label>
                      </>
                    )
                  )}

                  <label className="span-2">
                    {t('membership.preferred_language')}
                    <select
                      name="preferredLanguage"
                      value={form.preferredLanguage}
                      onChange={handleChange}
                    >
                      <option value="or">Afaan Oromo</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>

                {error && (
                  <div className="form-error" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span>{error}</span>
                    {error.toLowerCase().includes('already exists') && (
                      <NavLink
                        to="/login"
                        style={{ color: '#b88628', fontWeight: 700, textDecoration: 'underline', marginTop: '4px' }}
                      >
                        👉 Click here to Go to Log In →
                      </NavLink>
                    )}
                  </div>
                )}

                <button type="submit" className="btn btn--gold btn--full" disabled={submitting}>
                  {submitting
                    ? t('common.loading')
                    : form.preferredLanguage === 'or'
                    ? 'Koodii Mirkaneessaa Ergi →'
                    : 'Send Verification Code →'}
                </button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>{t('auth.or_with_google')}</span>
              </div>

              {/* Google Sign-up Button at Bottom */}
              <button
                type="button"
                className="btn btn--google"
                onClick={() => setGoogleChooserOpen(true)}
                disabled={submitting}
              >
                <GoogleIcon />
                <span>{t('auth.signup_google')}</span>
              </button>
            </>
          )}

          <p className="auth-card__footer">
            {t('membership.already_member')}{' '}
            <NavLink to="/login">{t('membership.login_link')}</NavLink>
          </p>
        </div>
      </div>

      {/* Authentic Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={googleChooserOpen}
        onClose={() => setGoogleChooserOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
        isLoading={submitting}
      />
    </section>
  );
}
