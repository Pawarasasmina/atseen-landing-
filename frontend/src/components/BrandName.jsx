import { useLanguage } from '../context/LanguageContext';

export function BrandName({ className = '' }) {
  return <span className={`notranslate ${className}`} translate="no">@seen</span>;
}

export function BrandText({ children }) {
  const { t } = useLanguage();
  if (typeof children !== 'string') return children;
  return t(children).split(/(@seen)/gi).map((part, index) => /@seen/i.test(part)
    ? <BrandName key={index} />
    : part);
}