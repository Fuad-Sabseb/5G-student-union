import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconShieldLock, IconCheckTech, IconUnionEmblem } from './TechIcons';
import logo from '../assets/gbsg-logo.jpg';
import './TermsOfServiceModal.css';

export default function TermsOfServiceModal({ isOpen, onClose, onAccept }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'or' ? 'or' : 'en';

  if (!isOpen) return null;

  return (
    <div className="terms-modal-backdrop" onClick={onClose}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="terms-modal__header">
          <div className="terms-modal__title-box">
            <img src={logo} alt="GBSG" className="terms-logo" />
            <div>
              <h3>
                {lang === 'or'
                  ? 'Seera, Dambii fi Qajeelfama Gamtaa'
                  : 'Union Rules, Guidelines & Terms of Service'}
              </h3>
              <span className="terms-sub">Gamtaa Barattoota Shanan Gibee (GBSG)</span>
            </div>
          </div>
          <button type="button" className="terms-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="terms-modal__body">
          <div className="terms-notice-banner">
            <IconShieldLock size={20} color="var(--color-star-gold)" />
            <p>
              {lang === 'or'
                ? 'Nagaan gara Gamtaa Barattoota Shanan Gibeetti dhufte. Miseensa ta’uun dura seeraa fi dambii gamtaa kana dubbisuun irra jirtu.'
                : 'Welcome to Shanan Gibe Student Union. Before joining, please review our community rules and membership guidelines.'}
            </p>
          </div>

          <div className="terms-section">
            <h4>
              {lang === 'or' ? '1. Kayyoofi Kaayyoowwan Gamtaa' : '1. Union Objectives & Core Purpose'}
            </h4>
            <p>
              {lang === 'or'
                ? 'Gamtaan Barattoota Shanan Gibee barattoota naannichaa ta’an walitti fiduu, waliin baruu, wal deeggaruu fi waliin gudaachuu irratti hundaa’a. Tokkummaan humna waan ta’eef, wal deeggaruun rakkoolee fuula duraa furuuf furmaata tokkoffaadha.'
                : 'The Shanan Gibe Student Union brings together students studying at Jimma University to support academic excellence, foster mutual growth, and build community leadership. Standing together creates unity, and unity creates strength.'}
            </p>
          </div>

          <div className="terms-section">
            <h4>
              {lang === 'or'
                ? '2. Seera Naamusaa fi Qajeelfama Hawaasaa'
                : '2. Code of Conduct & Community Guidelines'}
            </h4>
            <ul>
              <li>
                <strong>{lang === 'or' ? 'Kabaja Waliinii:' : 'Mutual Respect:'}</strong>{' '}
                {lang === 'or'
                  ? 'Miseensotni hundi walii isaaniitiif kabaja gaarii qabaachuu fi jibbiinsa, loogiitiin ykn ceephootiin wal tuqaa tokko malee waliin hojjechuu qabu.'
                  : 'All members must interact with dignity and respect. Discrimination, harassment, incitement, or hate speech is strictly prohibited.'}
              </li>
              <li>
                <strong>{lang === 'or' ? 'Amaanamaa ta’uu:' : 'Academic Integrity:'}</strong>{' '}
                {lang === 'or'
                  ? 'Odeeffannoo dhugaa fi deeggarsa barnootaa qulqulluu miseensotaaf qooduu.'
                  : 'Members should share accurate academic materials and assist peers in good faith.'}
              </li>
              <li>
                <strong>{lang === 'or' ? 'Bilmassa Seeraa:' : 'Compliance:'}</strong>{' '}
                {lang === 'or'
                  ? 'Seeraa fi dambilee Yuunivarsiitii Jimmaa fi Biyyaalessaa kabajuu.'
                  : 'Adherence to Jimma University policies and union bylaws.'}
              </li>
            </ul>
          </div>

          <div className="terms-section">
            <h4>
              {lang === 'or'
                ? '3. Eegumsa Odeeffannoo fi Qulqullina Dataa'
                : '3. Data Privacy & Member Confidentiality'}
            </h4>
            <p>
              {lang === 'or'
                ? 'Odeeffannoon dhuunfaa miseensotaa (Lakkoofsa Bilbilaa, Teessoo Email fi Saala) dhoksaadhaan eegama. Boodatti qofaaf fayyadamuuf kan gargaaru ta’ee, qaama sadaffaaf hin kennamu.'
                : 'Personal contact details (Phone numbers, Email addresses, Student IDs) are securely encrypted and protected. They will never be sold or publicly disclosed without explicit authorization.'}
            </p>
          </div>

          <div className="terms-section">
            <h4>
              {lang === 'or'
                ? '4. Adeemsa Mirkanaaffannoo Miseensummaa'
                : '4. Membership Verification & Admin Approval'}
            </h4>
            <p>
              {lang === 'or'
                ? 'Galmeen miseensummaa hundi erga dhihaateen booda hoggantoota gamtaatiin qoratamee mirkanaa’a. Galmee sobaa dhiheessuun miseensummaa irraa haqsiisa.'
                : 'All new member registrations (including Google Sign-In) undergo administrative review. Providing fraudulent student information may result in membership revocation.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="terms-modal__footer">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            {lang === 'or' ? 'Cufi' : 'Close'}
          </button>
          {onAccept && (
            <button
              type="button"
              className="btn btn--gold"
              onClick={() => {
                onAccept();
                onClose();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconCheckTech size={16} />
              <span>
                {lang === 'or'
                  ? 'Seera fi Dambii Waliigale'
                  : 'I Accept Terms & Guidelines'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
