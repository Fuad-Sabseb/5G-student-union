import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/offline.css';

export default function Offline() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for when connection is restored
    const handleOnline = () => {
      console.log('Connection restored');
      // Automatically navigate back or reload
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert('Still offline. Please check your internet connection.');
    }
  };

  return (
    <section className="section offline-page">
      <div className="container">
        <div className="card offline-card card--elevated">
          <div className="offline-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="58" stroke="var(--color-border)" strokeWidth="4"/>
              <path 
                d="M30 60 Q45 40, 60 40 T90 60" 
                stroke="var(--color-ink-soft)" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
              />
              <path 
                d="M40 70 Q50 60, 60 60 T80 70" 
                stroke="var(--color-ink-soft)" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <line 
                x1="20" 
                y1="20" 
                x2="100" 
                y2="100" 
                stroke="var(--color-star-gold)" 
                strokeWidth="5" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="eyebrow">Connection Lost</span>
          <h1>You're Offline</h1>
          
          <p className="offline-message">
            It looks like you've lost your internet connection. Some features require an active connection to work properly.
          </p>

          <div className="offline-info">
            <h3>While offline, you can:</h3>
            <ul>
              <li>View previously loaded pages</li>
              <li>Browse cached content</li>
              <li>See your profile information</li>
            </ul>

            <h3>You'll need internet to:</h3>
            <ul>
              <li>Sign in or sign up</li>
              <li>View live announcements and events</li>
              <li>Post in forums or upload content</li>
              <li>Access real-time updates</li>
            </ul>
          </div>

          <button 
            className="btn btn--gold btn--full"
            onClick={handleRetry}
          >
            Retry Connection
          </button>

          <p className="offline-footer">
            Connection will be restored automatically when you're back online.
          </p>
        </div>
      </div>
    </section>
  );
}
