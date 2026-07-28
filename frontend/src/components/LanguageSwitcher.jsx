import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../i18n/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const navRef = useRef(null);
  const floatingRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!navRef.current?.contains(event.target) && !floatingRef.current?.contains(event.target)) setOpen(false);
    };
    const onViewportChange = () => {
      const shouldFloat = window.innerWidth < 768 && window.scrollY > 90;
      setFloating(shouldFloat);
      if (!shouldFloat) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);
    onViewportChange();
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
    };
  }, []);

  const control = (isFloating = false) => (
    <div className={`language-switcher notranslate ${isFloating ? 'language-switcher-floating' : ''}`} ref={isFloating ? floatingRef : navRef} translate="no">
      <button type="button" className="language-trigger" onClick={() => setOpen((current) => !current)} aria-haspopup="menu" aria-expanded={open} aria-label="Change language">
        <Languages size={17} /><b>{language.toUpperCase()}</b><ChevronDown size={13} />
      </button>
      {open && <div className="language-menu" role="menu">
        {languages.map(([code, label]) => (
          <button type="button" role="menuitemradio" aria-checked={language === code} key={code} onClick={() => { setLanguage(code); setOpen(false); }}>
            <span>{label}</span>{language === code && <Check size={15} />}
          </button>
        ))}
      </div>}
    </div>
  );

  return <>{!floating && control()}{floating && createPortal(control(true), document.body)}</>;
}