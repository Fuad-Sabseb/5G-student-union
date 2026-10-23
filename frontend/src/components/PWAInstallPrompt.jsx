import { useState, useEffect } from 'react';
import '../styles/pwaInstall.css';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 30 days after dismissal
      if (daysSinceDismissed < 30) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a short delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  // Don't render if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-banner" role="dialog" aria-labelledby="pwa-install-title">
      <button
        className="pwa-install-banner__close"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
      >
        ✕
      </button>
      
      <div className="pwa-install-banner__content">
        <div className="pwa-install-banner__icon">
          <img src="/icon-192.png" alt="5G Union" width="56" height="56" />
        </div>
        
        <div className="pwa-install-banner__text">
          <h3 id="pwa-install-title">Install 5G Union App</h3>
          <p>Get quick access from your home screen — works offline!</p>
        </div>
      </div>
      
      <div className="pwa-install-banner__actions">
        <button
          className="btn btn--gold btn--sm"
          onClick={handleInstallClick}
        >
          Install
        </button>
        <button
          className="btn btn--outline btn--sm"
          onClick={handleDismiss}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
