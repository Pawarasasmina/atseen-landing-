import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translateText } from '../i18n/translations';

const LanguageContext = createContext(null);
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function translateNode(node, language, force = false) {
  if (node.nodeType === Node.TEXT_NODE) {
    let raw = originalText.get(node) ?? node.nodeValue;
    if (!force && originalText.has(node) && node.nodeValue.trim() !== translateText(language, raw.trim())) raw = node.nodeValue;
    if (!raw.trim()) return;
    originalText.set(node, raw);
    const leading = raw.match(/^\s*/)?.[0] ?? '';
    const trailing = raw.match(/\s*$/)?.[0] ?? '';
    node.nodeValue = `${leading}${translateText(language, raw.trim())}${trailing}`;
    return;
  }
  if (!(node instanceof Element) || node.closest('.notranslate') || node.matches('.notranslate')) return;
  const attributes = originalAttributes.get(node) ?? {};
  for (const attribute of ['placeholder', 'aria-label', 'title']) {
    if (!node.hasAttribute(attribute)) continue;
    const raw = attributes[attribute] ?? node.getAttribute(attribute);
    attributes[attribute] = raw;
    node.setAttribute(attribute, translateText(language, raw));
  }
  originalAttributes.set(node, attributes);
  node.childNodes.forEach((child) => translateNode(child, language, force));
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('site-language') || 'en');

  useEffect(() => {
    const apply = () => {
      document.documentElement.lang = language;
      document.body.dataset.language = language;
      translateNode(document.body, language, true);
    };
    apply();
    const observer = new MutationObserver((records) => {
      observer.disconnect();
      records.forEach((record) => {
        if (record.type === 'characterData') translateNode(record.target, language);
        record.addedNodes.forEach((node) => translateNode(node, language));
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage(code) {
      localStorage.setItem('site-language', code);
      setLanguageState(code);
    },
    t: (text) => translateText(language, text),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}