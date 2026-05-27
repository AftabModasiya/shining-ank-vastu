import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

/**
 * Reusable language switcher dropdown.
 * Uses the shared LanguageContext — works on every page automatically.
 */
export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="ls-wrapper" ref={ref}>
      <button
        className="ls-btn"
        onClick={() => setOpen((p) => !p)}
        aria-label="Select language"
      >
        {/* Globe icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <span className="ls-label">{language === 'en' ? 'EN' : 'हिं'}</span>
        <ChevronDown size={14} className={`ls-chevron ${open ? 'ls-chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="ls-menu" role="menu">
          <button
            className={`ls-option ${language === 'en' ? 'ls-option--active' : ''}`}
            onClick={() => { toggleLanguage('en'); setOpen(false); }}
            role="menuitem"
          >
            🇬🇧&nbsp; English
          </button>
          <button
            className={`ls-option ${language === 'hi' ? 'ls-option--active' : ''}`}
            onClick={() => { toggleLanguage('hi'); setOpen(false); }}
            role="menuitem"
          >
            🇮🇳&nbsp; हिंदी (Hindi)
          </button>
        </div>
      )}
    </div>
  );
}
