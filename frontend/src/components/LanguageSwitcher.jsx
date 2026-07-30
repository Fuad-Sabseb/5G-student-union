import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-switch" role="group" aria-label="Language / Afaan">
      <button
        className={i18n.language === 'en' ? 'lang-switch__btn is-active' : 'lang-switch__btn'}
        onClick={() => setLang('en')}
        aria-pressed={i18n.language === 'en'}
      >
        EN
      </button>
      <span className="lang-switch__divider" aria-hidden="true">/</span>
      <button
        className={i18n.language === 'or' ? 'lang-switch__btn is-active' : 'lang-switch__btn'}
        onClick={() => setLang('or')}
        aria-pressed={i18n.language === 'or'}
      >
        OR
      </button>
    </div>
  );
}
