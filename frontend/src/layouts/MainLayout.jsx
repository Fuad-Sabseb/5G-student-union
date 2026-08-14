import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TechNetworkCanvas from '../components/TechNetworkCanvas';
import AIAssistantWidget from '../components/AIAssistantWidget';

export default function MainLayout() {
  return (
    <div className="app-shell">
      {/* Sophisticated 3D Digital Technology Network Canvas */}
      <TechNetworkCanvas />

      {/* Dynamic Ambient Background Glow Layer */}
      <div className="ambient-bg-canvas" aria-hidden="true">
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>

      <Header />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />

      {/* Gemini AI Student Support Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
}
