import { useTranslation } from 'react-i18next';
import { IconGlobeTech } from './TechIcons';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'or' ? 'or' : 'en';

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="tech-lang-switcher" role="group" aria-label="Language / Afaan">
      <div className="tech-lang-icon-wrap">
        <IconGlobeTech size={15} color="var(--color-star-gold)" />
      </div>
      <button
        type="button"
        className={`tech-lang-btn ${currentLang === 'en' ? 'is-active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={currentLang === 'en'}
        title="English"
      >
        EN
      </button>
      <span className="tech-lang-divider">|</span>
      <button
        type="button"
        className={`tech-lang-btn ${currentLang === 'or' ? 'is-active' : ''}`}
        onClick={() => setLang('or')}
        aria-pressed={currentLang === 'or'}
        title="Afaan Oromoo"
      >
        OR
      </button>
    </div>
  );
}
