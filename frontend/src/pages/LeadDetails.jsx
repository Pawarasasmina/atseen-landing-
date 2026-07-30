import { useEffect, useState } from 'react';
import { Check, Clipboard, ExternalLink, Languages, LoaderCircle, MoveLeft, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { statuses, statusLabel } from '../constants';
import StatusBadge from '../components/StatusBadge';

const languageNames = { en: 'English', ar: 'Arabic', ru: 'Russian', es: 'Spanish', fr: 'French', pt: 'Portuguese' };
const originalValue = (lead, field) => lead.originalAnswers?.[field] || lead[field] || '';

function Row({ label, children }) {
  return <div className="border-b border-white/[.06] py-4"><dt className="text-xs uppercase tracking-wider text-white/30">{label}</dt><dd className="mt-2 break-words text-sm text-white/75">{children || '—'}</dd></div>;
}

function FreeTextAnswer({ lead }) {
  const [translation, setTranslation] = useState(null);
  const [busy, setBusy] = useState(false);
  const text = originalValue(lead, 'creatorDescription');
  const selectedLanguage = languageNames[lead.language] || lead.language?.toUpperCase() || 'Unknown';

  const translate = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/admin/leads/${lead._id}/translate-description`);
      setTranslation(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not translate this answer.');
    } finally {
      setBusy(false);
    }
  };

  if (!text) return null;

  return <div className="md:col-span-2 border-b border-white/[.06] py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/30">Creator description · Original answer</p>
        <p className="mt-1 text-xs text-white/40">Detected language: {translation?.detectedLanguage || selectedLanguage}</p>
      </div>
      {text && <button type="button" onClick={translate} disabled={busy} className="btn border border-ice/25 text-ice hover:bg-ice/10">
        {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Languages size={16} />}
        Translate to English
      </button>}
    </div>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/80" dir="auto">{text || '—'}</p>
    {translation && <div className="mt-4 rounded-xl border border-ice/15 bg-ice/[.05] p-4">
      <p className="text-xs uppercase tracking-wider text-ice/70">English translation</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white/80">{translation.translation}</p>
      <p className="mt-3 text-xs text-white/30">The original answer above remains unchanged.</p>
    </div>}
  </div>;
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/admin/leads/${id}`).then(({ data }) => {
      setLead(data.lead);
      setNotes(data.lead.adminNotes || '');
    }).catch(() => setError(true));
  }, [id]);

  const updateStatus = async (value) => {
    try {
      const { data } = await api.patch(`/admin/leads/${id}/status`, { status: value });
      setLead(data.lead);
      toast.success('Status updated');
    } catch { toast.error('Could not update status'); }
  };
  const save = async () => {
    try {
      const { data } = await api.patch(`/admin/leads/${id}/notes`, { adminNotes: notes });
      setLead(data.lead);
      toast.success('Notes saved');
    } catch { toast.error('Could not save notes'); }
  };
  const copy = async (value, label) => { await navigator.clipboard.writeText(value); toast.success(`${label} copied`); };
  const remove = async () => {
    if (!window.confirm(`Permanently delete ${lead.fullName}'s lead? This cannot be undone.`)) return;
    try { await api.delete(`/admin/leads/${id}`); toast.success('Lead deleted'); navigate('/admin/leads'); }
    catch { toast.error('Could not delete lead'); }
  };

  if (error) return <div><Link to="/admin/leads" className="text-ice">Back to leads</Link><p className="panel mt-5 p-6 text-danger">This lead could not be loaded.</p></div>;
  if (!lead) return <div className="h-96 animate-pulse rounded-2xl bg-surface" />;

  const name = originalValue(lead, 'fullName');
  const email = originalValue(lead, 'email');
  const phone = originalValue(lead, 'phone');
  const country = originalValue(lead, 'country');
  const city = originalValue(lead, 'city');
  const instagram = originalValue(lead, 'instagram');
  const tiktok = originalValue(lead, 'tiktok');

  return <>
    <Link to="/admin/leads" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"><MoveLeft size={16} /> Back to leads</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-3"><h1 className="text-3xl font-semibold" dir="auto">{name}</h1><StatusBadge status={lead.status} /></div><p className="mt-2 text-sm text-white/40">Submitted {new Date(lead.submittedAt).toLocaleString()}<span className="mx-2">·</span>Last updated {new Date(lead.updatedAt || lead.submittedAt).toLocaleString()}</p></div><button onClick={remove} className="btn border border-danger/30 text-danger hover:bg-danger/10"><Trash2 size={17} /> Delete lead</button></div>
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="panel p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-medium">Creator details</h2><span className="rounded-full bg-white/[.05] px-3 py-1 text-xs text-white/45">Application language: {languageNames[lead.language] || lead.language?.toUpperCase() || 'English'}</span></div><dl className="mt-4 grid md:grid-cols-2 md:gap-x-8">
        <Row label="Full name · Original">{name}</Row>
        <Row label="Email · Original"><span className="flex items-center gap-2">{email}<button onClick={() => copy(email, 'Email')} title="Copy email"><Clipboard size={14} /></button></span></Row>
        <Row label="Phone · Original"><span className="flex items-center gap-2">{phone || '—'}{phone && <button onClick={() => copy(phone, 'Phone')} title="Copy phone"><Clipboard size={14} /></button>}</span></Row>
        <Row label="Country / city · Original">{country}{city ? `, ${city}` : ''}</Row>
        <Row label="Category · Standard English">{(lead.niches?.length ? lead.niches : [lead.creatorCategory]).filter(Boolean).join(', ')}</Row>
        <Row label="Audience · Standard English">{lead.audienceSize}</Row>
        <Row label="Instagram · Original">{instagram || '—'}</Row>
        <Row label="TikTok · Original">{tiktok || '—'}</Row>
        <Row label="Social platform · Standard English">{lead.mainSocialPlatform}</Row>
        <Row label="Social profile · Original">{originalValue(lead, 'socialProfileUrl') ? <a className="inline-flex items-center gap-1 text-ice" target="_blank" rel="noopener noreferrer" href={originalValue(lead, 'socialProfileUrl')}>Open profile <ExternalLink size={13} /></a> : '—'}</Row>
        <Row label="Source">{lead.source}</Row><Row label="Referral code"><code className="text-ice">{lead.referralCode || '—'}</code></Row>
        <Row label="Referred by">{lead.referredBy ? <Link to={`/admin/leads/${lead.referredBy._id}`} className="text-ice hover:underline">{lead.referredBy.fullName} ({lead.referredBy.email})</Link> : 'Direct / no referral'}</Row>
        <Row label="Consent">{lead.consentGiven ? <span className="inline-flex items-center gap-1 text-success"><Check size={14} /> Given{lead.consentAt ? ` · ${new Date(lead.consentAt).toLocaleString()}` : ''}</span> : <span className="text-danger">Not recorded</span>}</Row>
        <FreeTextAnswer lead={lead} />
      </dl></section>
      <aside className="space-y-6"><section className="panel p-5"><label><span className="label">Application status · Standard English</span><select className="field" value={lead.status} onChange={(event) => updateStatus(event.target.value)}>{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></label></section><section className="panel p-5"><label><span className="label">Internal admin notes</span><textarea className="field min-h-52 resize-y" maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Only admins can see these notes." /></label><div className="mt-3 flex items-center justify-between"><span className="text-xs text-white/30">{notes.length}/2000</span><button onClick={save} className="btn btn-primary"><Save size={16} /> Save notes</button></div></section></aside>
    </div>
  </>;
}