import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartnersMarquee from '../components/PartnersMarquee';
import TechNetworkCanvas from '../components/TechNetworkCanvas';
import AIAssistantWidget from '../components/AIAssistantWidget';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import IOSInstallPrompt from '../components/IOSInstallPrompt';
import SkipLink from '../components/SkipLink';

export default function MainLayout() {
  return (
    <div className="app-shell">
      {/* Accessibility: Skip to main content */}
      <SkipLink />

      {/* Sophisticated 3D Digital Technology Network Canvas */}
      <TechNetworkCanvas />

      {/* Dynamic Ambient Background Glow Layer */}
      <div className="ambient-bg-canvas" aria-hidden="true">
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>

      <Header />
      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <PartnersMarquee />
      <Footer />

      {/* Gemini AI Student Support Assistant Widget */}
      <AIAssistantWidget />

      {/* PWA Install Prompts */}
      <PWAInstallPrompt />
      <IOSInstallPrompt />
    </div>
  );
}
