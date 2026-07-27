import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LoaderCircle, Send, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { audiences, categories } from '../constants';

const defaults = {
  name: '',
  city: '',
  instagram: '',
  tiktok: '',
  audience: '20-100K',
  email: '',
  phone: '',
  phoneRegion: '+971',
  website: '',
};

const trackedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const phoneRegions = [
  ['+94', 'Sri Lanka'],
  ['+1', 'United States & Canada'],
  ['+44', 'United Kingdom'],
  ['+61', 'Australia'],
  ['+91', 'India'],
  ['+971', 'United Arab Emirates'],
  ['+65', 'Singapore'],
  ['+49', 'Germany'],
  ['+33', 'France'],
  ['+39', 'Italy'],
  ['+34', 'Spain'],
  ['+31', 'Netherlands'],
  ['+46', 'Sweden'],
  ['+47', 'Norway'],
  ['+55', 'Brazil'],
  ['+27', 'South Africa'],
  ['+234', 'Nigeria'],
  ['+81', 'Japan'],
  ['+82', 'South Korea'],
  ['+63', 'Philippines'],
  ['+62', 'Indonesia'],
  ['+60', 'Malaysia'],
  ['+92', 'Pakistan'],
  ['+880', 'Bangladesh'],
];

function normalizeHandle(value) {
  return value.trim().replace(/^@+/, '');
}

function getTracking() {
  const params = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?').slice(1).join('?') : '';
  const hashParams = new URLSearchParams(hashQuery);
  const value = (key) => params.get(key) || hashParams.get(key) || '';
  return {
    ref: value('ref').trim().toLowerCase(),
    utm: Object.fromEntries(trackedParams.map((key) => [key, value(key)])),
  };
}

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`app-field ${className}`}>
      <span>{label}</span>
      {children}
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

export default function CreatorForm({ onOpenLegal }) {
  const [form, setForm] = useState(defaults);
  const [niches, setNiches] = useState(['Content']);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [phonePickerOpen, setPhonePickerOpen] = useState(false);
  const [shareHint, setShareHint] = useState('Send this page to someone who deserves to be first.');

  useEffect(() => {
    document.body.classList.toggle('application-submitted', sent);
    return () => document.body.classList.remove('application-submitted');
  }, [sent]);

  const personalRef = useMemo(() => {
    const seed = normalizeHandle(form.instagram) || normalizeHandle(form.tiktok) || form.email.split('@')[0] || form.name.split(' ')[0] || 'creator';
    return seed.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'creator';
  }, [form.email, form.instagram, form.name, form.tiktok]);

  const inviteCode = referralCode || personalRef;

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setSocialValue = (key, value) => {
    const handle = value.replace(/\s/g, '').replace(/^@+/, '');
    setValue(key, handle ? `@${handle}` : '');
    if (handle) setErrors((current) => ({ ...current, instagram: undefined }));
  };

  const startSocialHandle = (key) => {
    if (!form[key]) setValue(key, '@');
  };

  const toggleNiche = (niche) => {
    setNiches((current) => current.includes(niche) ? current.filter((item) => item !== niche) : [...current, niche]);
  };

  const shareInvite = async () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(inviteCode)}`;
    const text = 'I joined the @Seen early-access waitlist. You can apply too:';
    try {
      if (navigator.share) await navigator.share({ title: '@Seen Early Access', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareHint('Personal invite link copied.');
      }
    } catch {
      setShareHint('Your personal invite link is ready when you are.');
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email.';
    if (!normalizeHandle(form.instagram) && !normalizeHandle(form.tiktok)) next.instagram = 'Add Instagram or TikTok.';
    if (!consentGiven) next.consent = 'You must confirm your age and agreement before applying.';
    setErrors(next);
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.website) return setSent(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.consent && Object.keys(validationErrors).length === 1) {
        toast.error('Please confirm your age and agreement before applying.');
      } else if (validationErrors.instagram) {
        toast.error('Please add at least one Instagram or TikTok handle.');
      } else {
        toast.error('Please check the highlighted fields.');
      }
      return;
    }

    setBusy(true);
    try {
      const tracking = getTracking();
      const { phoneRegion, ...application } = form;
      const { data } = await api.post('/apply', {
        ...application,
        phone: application.phone.trim() ? [phoneRegion, application.phone.trim()].join(' ') : '',
        instagram: normalizeHandle(form.instagram),
        tiktok: normalizeHandle(form.tiktok),
        niches,
        ref: tracking.ref,
        ts: new Date().toISOString(),
        consentGiven,
        ...tracking.utm,
      });
      setReferralCode(data.referralCode || '');
      window.dispatchEvent(new Event('application-count-refresh')); 
      setSent(true);
      toast.success("You've been seen.");
    } catch (error) {
      const fields = error.response?.data?.errors;
      if (fields?.length) setErrors(Object.fromEntries(fields.map(({ field, message }) => [field, message])));
      toast.error(error.response?.data?.message || 'We could not send your application. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const dismissSuccess = () => {
    setSent(false);
    setForm(defaults);
    setNiches(['Content']);
    setConsentGiven(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (sent) {
    return (
      <div className="application-success">
        <div className="success-visual" aria-hidden="true">
          <span className="success-spark success-spark-one">&#10022;</span>
          <span className="success-spark success-spark-two">&#10022;</span>
          <div className="success-eye-wrap">
            <img className="success-eye-logo" src="/images/seen-eye.png" alt="" />
            <span className="success-check">&#10003;</span>
          </div>
        </div>
        <h3>You have been <span>seen</span><i aria-hidden="true">&#10003;</i></h3>
        <p className="success-name">Hi {form.name.trim().split(/\s+/)[0] || 'Creator'},</p>
        <p>We&apos;ve received your application<br /><b>@seen</b></p>
        <div className="success-status-card">
          <div><h4>You&apos;re in the running</h4><p>We&apos;ll be in touch if you&apos;re selected for early access.</p></div>
          <div className="success-stairway" aria-hidden="true"><img src="/images/seen-stairway.jpg" alt="" /></div>
        </div>
        <button type="button" className="send-button success-share" onClick={shareInvite}><Share2 size={19} />Share with friends</button>
        <button type="button" className="success-later" onClick={dismissSuccess}>Maybe later</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="application-card" noValidate>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>Leave this field empty<input tabIndex="-1" autoComplete="new-password" value={form.website} onChange={(event) => setValue('website', event.target.value)} /></label>
      </div>
      <Field label="Your name" error={errors.name}><input className="field" required value={form.name} onChange={(event) => setValue('name', event.target.value)} placeholder="Full name" /></Field>
      <Field label="City"><input className="field" value={form.city} onChange={(event) => setValue('city', event.target.value)} placeholder="Your city" /></Field>
      <div className="app-field md:col-span-2"><span>What do you create?</span><div className="niche-grid">{categories.slice(0, 10).map((niche) => <button className={niches.includes(niche) ? 'niche-chip active' : 'niche-chip'} type="button" key={niche} onClick={() => toggleNiche(niche)}>{niche}</button>)}</div></div>
      <Field label="Instagram" error={errors.instagram}><input className="field" value={form.instagram} onFocus={() => startSocialHandle('instagram')} onChange={(event) => setSocialValue('instagram', event.target.value)} placeholder="@yourhandle" /></Field>
      <Field label="TikTok"><input className="field" value={form.tiktok} onFocus={() => startSocialHandle('tiktok')} onChange={(event) => setSocialValue('tiktok', event.target.value)} placeholder="@yourhandle" /></Field>
      <Field label="Audience"><div className="audience-select"><select className="field" value={form.audience} onChange={(event) => setValue('audience', event.target.value)}>{audiences.map((audience) => <option key={audience}>{audience}</option>)}</select><ChevronDown size={17} aria-hidden="true" /></div></Field>
      <Field label="Email" error={errors.email}><input className="field" type="email" required value={form.email} onChange={(event) => setValue('email', event.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Phone" className="phone-app-field"><div className="phone-field"><div className="phone-region-wrap"><button type="button" className="phone-region-trigger" aria-label="Select phone region" aria-haspopup="listbox" aria-expanded={phonePickerOpen} onClick={() => setPhonePickerOpen((open) => !open)}>{form.phoneRegion}<ChevronDown size={14} /></button>{phonePickerOpen && <div className="phone-region-menu" role="listbox">{phoneRegions.map(([code, country]) => <button key={code} type="button" role="option" aria-selected={form.phoneRegion === code} onClick={() => { setValue('phoneRegion', code); setPhonePickerOpen(false); }}><span>{country}</span></button>)}</div>}</div><input className="field" inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={(event) => setValue('phone', event.target.value)} placeholder="Mobile number" /></div></Field>
      <div className="consent-field md:col-span-2">
        <label>
          <input type="checkbox" checked={consentGiven} onChange={(event) => { setConsentGiven(event.target.checked); setErrors((current) => ({ ...current, consent: undefined })); }} required />
          <span>I confirm that I am 18 or older and agree to the <button type="button" onClick={() => onOpenLegal?.('Early Access Terms')}>Early Access Terms</button> and <button type="button" onClick={() => onOpenLegal?.('Privacy Notice')}>Privacy Notice</button>.</span>
        </label>
        {errors.consent && <em role="alert">{errors.consent}</em>}
      </div>
      <button type="submit" disabled={busy} className="send-button md:col-span-2">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={17} />}Send application</button>
      <div className="form-fine md:col-span-2"><p>Your information is used to manage the @Seen early-access waitlist and send essential updates about your application.</p><p>Submitting an application does not guarantee acceptance or access.</p></div>
    </form>
  );
}

