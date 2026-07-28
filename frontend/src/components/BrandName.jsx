export function BrandName({ className = '' }) {
  return <span className={`notranslate ${className}`} translate="no">@seen</span>;
}

export function BrandText({ children }) {
  if (typeof children !== 'string') return children;
  return children.split(/(@seen)/gi).map((part, index) => /@seen/i.test(part)
    ? <BrandName key={index} />
    : part);
}