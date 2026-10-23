import { useState, useEffect } from 'react';
import '../styles/pwaInstall.css';

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('ios_install_dismissed');
    
    if (isIOS && !isInStandaloneMode && !dismissed) {
      // Show after a delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios_install_dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="pwa-ios-prompt" role="dialog" aria-labelledby="ios-install-title">
      <button
        className="pwa-ios-prompt__close"
        onClick={handleDismiss}
        aria-label="Dismiss install instructions"
      >
        ✕
      </button>
      
      <div className="pwa-ios-prompt__content">
        <div className="pwa-ios-prompt__icon">
          <img src="/icon-192.png" alt="5G Union" width="48" height="48" />
        </div>
        
        <h3 id="ios-install-title">Install 5G Union App</h3>
        <p className="pwa-ios-prompt__desc">
          Add this app to your home screen for quick access and offline use.
        </p>
        
        <div className="pwa-ios-prompt__steps">
          <div className="pwa-ios-step">
            <span className="pwa-ios-step__number">1</span>
            <p>
              Tap the <strong>Share</strong> button
              <span className="pwa-ios-icon">
                <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                  <path d="M9 1L9 15M9 1L5 5M9 1L13 5M2 15V21C2 21.5304 2.21071 22.0391 2.58579 22.4142C2.96086 22.7893 3.46957 23 4 23H14C14.5304 23 15.0391 22.7893 15.4142 22.4142C15.7893 22.0391 16 21.5304 16 21V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {' '}at the bottom of the screen
            </p>
          </div>
          
          <div className="pwa-ios-step">
            <span className="pwa-ios-step__number">2</span>
            <p>
              Scroll and tap <strong>"Add to Home Screen"</strong>
              <span className="pwa-ios-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
            </p>
          </div>
          
          <div className="pwa-ios-step">
            <span className="pwa-ios-step__number">3</span>
            <p>Tap <strong>"Add"</strong> to confirm</p>
          </div>
        </div>
        
        <button
          className="btn btn--dusk btn--sm btn--full"
          onClick={handleDismiss}
          style={{ marginTop: '1rem' }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
