import { useMemo, useState } from 'react';
import { Check, LoaderCircle, Send, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { audiences, categories } from '../constants';

const defaults = {
  name: '',
  city: '',
  instagram: '',
  tiktok: '',
  audience: '20-100K',
  why: '',
  email: '',
  phone: '',
  website: '',
};

const trackedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function normalizeHandle(value) {
  return value.trim().replace(/^@+/, '');
}

function getTracking() {
  const params = new URLSearchParams(window.location.search);
  return {
    ref: params.get('ref') || '',
    utm: Object.fromEntries(trackedParams.map((key) => [key, params.get(key) || ''])),
  };
}

function Field({ label, error, children }) {
  return (
    <label className="app-field">
      <span>{label}</span>
      {children}
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

export default function CreatorForm() {
  const [form, setForm] = useState(defaults);
  const [niches, setNiches] = useState(['Content']);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareHint, setShareHint] = useState('Send this page to someone who deserves to be first.');

  const personalRef = useMemo(() => {
    const seed = normalizeHandle(form.instagram) || normalizeHandle(form.tiktok) || form.email.split('@')[0] || form.name.split(' ')[0] || 'creator';
    return seed.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'creator';
  }, [form.email, form.instagram, form.name, form.tiktok]);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleNiche = (niche) => {
    setNiches((current) => current.includes(niche) ? current.filter((item) => item !== niche) : [...current, niche]);
  };

  const shareInvite = async () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(personalRef)}`;
    const text = 'I just applied to be a founding creator on @seen. You should be there first too:';
    try {
      if (navigator.share) await navigator.share({ title: '@seen Founding Creators', text, url });
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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.website) return setSent(true);
    if (!validate()) {
      toast.error('Please add your email and at least one social handle.');
      return;
    }

    setBusy(true);
    try {
      const tracking = getTracking();
      await api.post('/apply', {
        ...form,
        instagram: normalizeHandle(form.instagram),
        tiktok: normalizeHandle(form.tiktok),
        niches,
        ref: tracking.ref,
        ts: new Date().toISOString(),
        ...tracking.utm,
      });
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

  if (sent) {
    return (
      <div className="application-success">
        <span className="success-eye" aria-hidden="true"><Check size={24} /></span>
        <h3>You&apos;ve been seen.</h3>
        <p>Your application is in and your place in line is saved. When founding registration opens, your invite lands here first.</p>
        <button type="button" className="send-button" onClick={shareInvite}><Share2 size={17} />Invite a creator you rate</button>
        <small>{shareHint}</small>
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
      <Field label="Instagram" error={errors.instagram}><input className="field" value={form.instagram} onChange={(event) => setValue('instagram', event.target.value)} placeholder="@yourhandle" /></Field>
      <Field label="TikTok"><input className="field" value={form.tiktok} onChange={(event) => setValue('tiktok', event.target.value)} placeholder="@yourhandle" /></Field>
      <Field label="Audience"><select className="field" value={form.audience} onChange={(event) => setValue('audience', event.target.value)}>{audiences.map((audience) => <option key={audience}>{audience}</option>)}</select></Field>
      <Field label="Email" error={errors.email}><input className="field" type="email" required value={form.email} onChange={(event) => setValue('email', event.target.value)} placeholder="you@example.com" /></Field>
      <Field label="What is your world about?" error={errors.why}><textarea className="field min-h-28 resize-y" maxLength={300} value={form.why} onChange={(event) => setValue('why', event.target.value)} placeholder="The thing you live that people would step into." /></Field>
      <Field label="Phone"><input className="field" value={form.phone} onChange={(event) => setValue('phone', event.target.value)} placeholder="Optional" /></Field>
      <button type="submit" disabled={busy} className="send-button md:col-span-2">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={17} />}Send application</button>
      <p className="form-fine md:col-span-2"> Your data stays with @seen, never sold and never shared.</p>
    </form>
  );
}

