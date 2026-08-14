import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { extractNameFromGmail } from '../pages/Login';
import { IconUserAddTech } from './TechIcons';
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
    color: '#d9534f',
    letter: 'F',
  },
  {
    name: 'Fuad Sabseb',
    email: 'fuadsabseb690@gmail.com',
    color: '#2e7d32',
    letter: 'F',
  },
  {
    name: 'Fahi Official',
    email: 'fahiofficial1@gmail.com',
    color: '#1565c0',
    letter: 'F',
  },
  {
    name: 'Fahi',
    email: 'fahijemila@gmail.com',
    color: '#ad1457',
    letter: 'F',
  },
  {
    name: 'Fuad Sabseb',
    email: 'fuadsabseb@gmail.com',
    color: '#6a1b9a',
    letter: 'F',
  },
];

export default function GoogleAccountChooserModal({ isOpen, onClose, onSelectAccount, isLoading }) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [customError, setCustomError] = useState('');

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

  if (!isOpen) return null;

  const derivedName = extractNameFromGmail(newEmail);

  const handleAccountClick = (acc) => {
    setSelectedEmail(acc.email);
    onSelectAccount({
      email: acc.email,
      fullName: acc.name,
      googleId: `google_${acc.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });
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

    // Save in state & localStorage
    const updated = [newAcc, ...accounts.filter((a) => a.email !== newAcc.email)];
    setAccounts(updated);
    try {
      localStorage.setItem('gbsg_google_accounts', JSON.stringify(updated));
    } catch (e) {}

    setIsAddingNew(false);
    setSelectedEmail(newAcc.email);
    onSelectAccount({
      email: newAcc.email,
      fullName: newAcc.name,
      googleId: `google_${newAcc.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });
  };

  return (
    <div className="google-chooser-overlay" onClick={onClose}>
      <div className="google-chooser-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Google Popup Header Bar */}
        <div className="google-chooser-top-bar">
          <div className="google-top-brand">
            <GoogleLogo />
            <span>Sign in with Google</span>
          </div>
          <button type="button" className="google-chooser-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Brand Target Banner */}
        <div className="google-chooser-body">
          <div className="google-app-badge">
            <img src={logo} alt="GBSG" className="google-app-logo" />
            <div className="google-app-info">
              <h2>Choose an account</h2>
              <p>to continue to <strong>Gamtaa Barattoota Shanan Gibee</strong></p>
            </div>
          </div>

          {/* Account Selection List */}
          {!isAddingNew ? (
            <div className="google-account-list">
              {accounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className={`google-account-item ${
                    selectedEmail === acc.email && isLoading ? 'is-loading' : ''
                  }`}
                  onClick={() => handleAccountClick(acc)}
                  disabled={isLoading}
                >
                  <div
                    className="google-account-avatar"
                    style={{ backgroundColor: acc.color || '#16324f' }}
                  >
                    {acc.letter || acc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="google-account-details">
                    <span className="google-account-name">{acc.name}</span>
                    <span className="google-account-email">{acc.email}</span>
                  </div>

                  {selectedEmail === acc.email && isLoading && (
                    <div className="google-item-spinner" />
                  )}
                </button>
              ))}

              {/* Use Another Account Button */}
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
                  <IconUserAddTech size={18} color="#a8a8a8" />
                </div>
                <div className="google-account-details">
                  <span className="google-account-name">Use another account</span>
                </div>
              </button>
            </div>
          ) : (
            /* Add New Account View */
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

              {customError && <p className="google-form-error">{customError}</p>}

              <div className="google-form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Back to list
                </button>
                <button type="submit" className="btn btn--gold" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Terms */}
          <div className="google-chooser-footer">
            <p>
              To continue, Google will share your name, email address, and profile picture with
              Gamtaa Barattoota Shanan Gibee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
