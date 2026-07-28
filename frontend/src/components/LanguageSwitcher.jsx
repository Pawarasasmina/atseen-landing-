import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Globe2 } from 'lucide-react';

const languages = [
  ['en', 'English'], ['ar', 'Arabic'], ['ru', 'Russian'],
  ['es', 'Spanish'], ['fr', 'French'], ['pt', 'Portuguese'],
];

function saveTranslationCookie(code) {
  const value = `/en/${code}`;
  const options = 'path=/; max-age=31536000; SameSite=Lax';
  document.cookie = `googtrans=${value}; ${options}`;
  if (window.location.hostname.includes('.')) document.cookie = `googtrans=${value}; ${options}; domain=.${window.location.hostname}`;
}

function applyTranslation(code, attempt = 0) {
  const select = document.querySelector('.goog-te-combo');
  if (select?.querySelector(`option[value="${code}"]`)) {
    select.value = code;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (window.google?.translate && !document.querySelector('#google_translate_element select')) window.googleTranslateElementInit?.();
  if (attempt < 48) window.setTimeout(() => applyTranslation(code, attempt + 1), 250);
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [floating, setFloating] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('site-language') || 'en';
    setLanguage(saved);
    document.documentElement.lang = saved;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: languages.map(([code]) => code).join(','),
        autoDisplay: false,
      }, 'google_translate_element');
      if (saved !== 'en') window.setTimeout(() => applyTranslation(saved), 100);
    };
    if (!document.querySelector('script[data-google-translate]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.dataset.googleTranslate = 'true';
      document.head.appendChild(script);
    } else if (window.google?.translate) window.googleTranslateElementInit();

    const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const updateFloating = () => setFloating(window.innerWidth < 768 && window.scrollY > 76);
    updateFloating();
    document.addEventListener('pointerdown', close);
    window.addEventListener('scroll', updateFloating, { passive: true });
    window.addEventListener('resize', updateFloating);
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('scroll', updateFloating);
      window.removeEventListener('resize', updateFloating);
    };
  }, []);

  const chooseLanguage = (code) => {
    window.localStorage.setItem('site-language', code);
    setLanguage(code);
    setOpen(false);
    document.documentElement.lang = code;
    if (code === 'en') {
      document.cookie = 'googtrans=/en/en; path=/; max-age=0';
      document.cookie = `googtrans=/en/en; path=/; domain=.${window.location.hostname}; max-age=0`;
      window.location.reload();
      return;
    }
    saveTranslationCookie(code);
    applyTranslation(code);
  };

  const picker = (
    <div className={`language-switcher notranslate ${floating ? 'language-switcher-floating' : ''}`} ref={rootRef}>
      <button type="button" className="language-trigger" onClick={() => setOpen((current) => !current)} aria-haspopup="menu" aria-expanded={open} aria-label="Change language">
        <Globe2 size={16} /><span>{language.toUpperCase()}</span><ChevronDown size={13} />
      </button>
      {open && <div className="language-menu" role="menu">
        {languages.map(([code, label]) => <button type="button" role="menuitemradio" aria-checked={language === code} key={code} onClick={() => chooseLanguage(code)}><span>{label}</span>{language === code && <Check size={15} />}</button>)}
      </div>}
    </div>
  );

  return <>
    <div id="google_translate_element" aria-hidden="true" />
    {floating ? createPortal(picker, document.body) : picker}
  </>;
}