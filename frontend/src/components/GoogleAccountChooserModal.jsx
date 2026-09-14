import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { extractNameFromGmail } from '../pages/Login';
import { IconUserAddTech, IconShieldLock, IconCheckTech, IconRefreshTech } from './TechIcons';
import api from '../api/client';
import logo from '../assets/gbsg-logo.jpg';
import './GoogleAccountChooserModal.css';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const DEFAULT_ACCOUNTS = [
  {
    name: 'Fuad Sabseb',
    email: 'fuadsabseb476@gmail.com',
    color: '#34a853',
    letter: 'F',
  },
  {
    name: 'Fahi Official',
    email: 'fahiofficial1@gmail.com',
    color: '#1a73e8',
    letter: 'F',
  },
  {
    name: 'Mindflow Media',
    email: 'mindflowmedia9510@gmail.com',
    color: '#00897b',
    letter: 'M',
  },
  {
    name: 'Fahi',
    email: 'fahijemila@gmail.com',
    color: '#e91e63',
    letter: 'F',
  },
  {
    name: 'Gamtaa Barattoota Shanan GibeeJU',
    email: 'gamtaabarattootashanangibeeju@gmail.com',
    color: '#ea4335',
    letter: 'G',
  },
];

export default function GoogleAccountChooserModal({ isOpen, onClose, onSelectAccount, isLoading }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'or' ? 'or' : 'en';

  const [accounts, setAccounts] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState(null);
  
  // Step Management: 'choose' | 'terms' | 'verify'
  const [modalStep, setModalStep] = useState('choose');
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [customError, setCustomError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);

  // Verification OTP State
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const otpInputRef = useRef(null);

  // Load saved accounts or default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gbsg_google_accounts');
      if (saved) {
        setAccounts(JSON.parse(saved));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
      }
    } catch (e) {
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (modalStep === 'verify' && resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [modalStep, resendCountdown]);

  const handleClose = () => {
    setModalStep('choose');
    setSelectedAcc(null);
    setIsAddingNew(false);
    setCustomError('');
    setVerificationCode('');
    onClose();
  };

  if (!isOpen) return null;

  const derivedName = extractNameFromGmail(newEmail);

  // 1. Account Chosen ➔ Move to Google Sign-In Consent/Terms Screen
  const handleChooseAccount = (acc) => {
    setSelectedAcc(acc);
    setCustomError('');
    setModalStep('terms');
  };

  const handleAddNewAccount = (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setCustomError('Please enter a valid Gmail address');
      return;
    }

    const nameToUse = newName.trim() || derivedName || newEmail.split('@')[0];
    const newAcc = {
      name: nameToUse,
      email: newEmail.trim().toLowerCase(),
      color: '#d9a441',
      letter: nameToUse.charAt(0).toUpperCase(),
    };

    const updated = [newAcc, ...accounts.filter((a) => a.email !== newAcc.email)];
    setAccounts(updated);
    try {
      localStorage.setItem('gbsg_google_accounts', JSON.stringify(updated));
    } catch (e) {}

    setIsAddingNew(false);
    setSelectedAcc(newAcc);
    setCustomError('');
    setModalStep('terms');
  };

  // 2. Terms & Consent Accepted ➔ Finalize Google Authentication & Redirect directly
  const handleAcceptTermsAndContinue = () => {
    if (!agreedToTerms) {
      setCustomError(
        lang === 'or'
          ? 'Miseensa ta’uudhaaf seera fi dambii gamtaa amanamuun irra jira.'
          : 'You must accept the GBSG Student Union Rules and Terms of Service to continue.'
      );
      return;
    }

    setCustomError('');
    onSelectAccount({
      email: selectedAcc.email,
      fullName: selectedAcc.name,
      googleId: `google_${selectedAcc.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });
  };

  return (
    <div className="google-chooser-overlay" onClick={handleClose}>
      <div className="google-chooser-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="google-chooser-top-bar">
          <div className="google-top-brand">
            <GoogleLogo />
            <span>Sign in with Google</span>
          </div>
          <button type="button" className="google-chooser-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* STEP 1: CHOOSE AN ACCOUNT */}
        {modalStep === 'choose' && (
          <div className="google-oauth-content">
            <div className="google-oauth-grid">
              {/* Left Column */}
              <div className="google-oauth-left">
                <h2 className="google-oauth-title">Choose an account</h2>
                <p className="google-oauth-sub">
                  to continue to <strong className="app-name-highlight">Gamtaa Barattoota Shanan Gibee</strong>
                </p>
              </div>

              {/* Right Column */}
              <div className="google-oauth-right">
                {customError && <p className="google-form-error">{customError}</p>}

                {!isAddingNew ? (
                  <div className="google-account-list">
                    {accounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        className={`google-account-item ${selectedAcc?.email === acc.email ? 'is-selected' : ''}`}
                        onClick={() => handleChooseAccount(acc)}
                        disabled={isLoading}
                      >
                        <div
                          className="google-account-avatar"
                          style={{ backgroundColor: acc.color || '#1a73e8' }}
                        >
                          {acc.letter || acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="google-account-details">
                          <span className="google-account-name">{acc.name}</span>
                          <span className="google-account-email">{acc.email}</span>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className="google-account-item google-account-item--add"
                      onClick={() => {
                        setIsAddingNew(true);
                        setCustomError('');
                      }}
                      disabled={isLoading}
                    >
                      <div className="google-account-avatar google-avatar--add">
                        <IconUserAddTech size={18} color="#9aa0a6" />
                      </div>
                      <div className="google-account-details">
                        <span className="google-account-name">Use another account</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddNewAccount} className="google-add-account-form">
                    <label>
                      Email or phone
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        autoFocus
                      />
                    </label>

                    {derivedName && (
                      <div className="google-name-detected">
                        <span>Detected Name:</span>
                        <strong>{derivedName}</strong>
                      </div>
                    )}

                    <label style={{ marginTop: '0.85rem' }}>
                      Full Name (Optional)
                      <input
                        type="text"
                        placeholder="e.g. Caalaa Tolasaa"
                        value={newName || derivedName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </label>

                    <div className="google-form-actions">
                      <button
                        type="button"
                        className="google-btn-secondary"
                        onClick={() => setIsAddingNew(false)}
                      >
                        Back to list
                      </button>
                      <button type="submit" className="google-btn-primary">
                        Next
                      </button>
                    </div>
                  </form>
                )}

                <div className="google-chooser-disclaimer">
                  <p>
                    Before using this app, you can review Gamtaa Barattoota Shanan Gibee’s{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONSENT & TERMS OF SERVICE */}
        {modalStep === 'terms' && selectedAcc && (
          <div className="google-oauth-content">
            <div className="google-oauth-grid">
              {/* Left Column */}
              <div className="google-oauth-left">
                <h2 className="google-oauth-title">
                  Sign in to Gamtaa Barattoota Shanan Gibee
                </h2>
                
                {/* Account Pill Dropdown */}
                <button
                  type="button"
                  className="google-account-select-pill"
                  onClick={() => setModalStep('choose')}
                >
                  <div
                    className="google-account-avatar-sm"
                    style={{ backgroundColor: selectedAcc.color || '#1a73e8' }}
                  >
                    {selectedAcc.letter || selectedAcc.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="google-pill-email">{selectedAcc.email}</span>
                  <span className="google-pill-arrow">▾</span>
                </button>
              </div>

              {/* Right Column */}
              <div className="google-oauth-right">
                <p className="google-consent-intro">
                  Google will allow <strong>Gamtaa Barattoota Shanan Gibee</strong> to access this info about you
                </p>

                <div className="google-consent-info-list">
                  <div className="google-consent-info-item">
                    <div className="google-info-icon">👤</div>
                    <div className="google-info-text">
                      <strong>{selectedAcc.name}</strong>
                      <span>Name and profile picture</span>
                    </div>
                  </div>

                  <div className="google-consent-info-item">
                    <div className="google-info-icon">✉</div>
                    <div className="google-info-text">
                      <strong>{selectedAcc.email}</strong>
                      <span>Email address</span>
                    </div>
                  </div>
                </div>

                <div className="google-consent-policy-box">
                  <p>
                    Review Gamtaa Barattoota Shanan Gibee’s{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> to understand how Gamtaa Barattoota Shanan Gibee will process and protect your data.
                  </p>
                </div>

                <label className="google-terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked) setCustomError('');
                    }}
                  />
                  <span>
                    {lang === 'or'
                      ? 'Seera, dambii fi qajeelfama Gamtaa Barattoota Shanan Gibee waliin waliigala.'
                      : 'I agree to the GBSG Student Union Rules, Guidelines & Terms of Service.'}
                  </span>
                </label>

                {customError && <p className="google-form-error">{customError}</p>}

                <p className="google-consent-help-text">
                  To make changes at any time, go to your <strong>Google Account</strong>.
                </p>
                <p className="google-consent-help-text" style={{ marginBottom: '1.5rem' }}>
                  Learn more about <a href="#learn" onClick={(e) => e.preventDefault()}>Sign in with Google</a>.
                </p>

                <div className="google-oauth-actions">
                  <button
                    type="button"
                    className="google-btn-pill-secondary"
                    onClick={() => setModalStep('choose')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="google-btn-pill-primary"
                    onClick={handleAcceptTermsAndContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="google-chooser-bottom-bar">
          <div className="google-lang-selector">
            <span>English (United States)</span>
            <span>▾</span>
          </div>
          <div className="google-footer-links">
            <a href="#help" onClick={(e) => e.preventDefault()}>Help</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}

