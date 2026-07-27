import { useMemo, useState } from 'react';
import { Check, Copy, Mail, Send, Share2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Brand from '../components/Brand';

const inviteText = 'I just applied to be a founding creator on @seen. You should be there first too:';

export default function ShareInvite() {
  const [params] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const referralCode = (params.get('ref') || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  const inviteUrl = useMemo(() => `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`, [referralCode]);
  const shareMessage = `${inviteText} ${inviteUrl}`;

  const copyInvite = async () => {
    await navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    if (!navigator.share) return copyInvite();
    try {
      await navigator.share({ title: '@seen Founding Creators', text: inviteText, url: inviteUrl });
    } catch (error) {
      if (error?.name !== 'AbortError') await copyInvite();
    }
  };

  return (
    <main className="share-page">
      <div className="share-page-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <section className="share-card">
        <Link to="/" className="share-brand" aria-label="Return to @seen"><Brand /></Link>
        <div className="share-icon"><Share2 size={25} /></div>
        <p className="share-eyebrow">Your founding invite</p>
        <h1>Bring someone<br /><span>worth seeing.</span></h1>
        <p className="share-copy">Share your personal link with a creator you rate. If they apply through it, their application will be connected to you.</p>

        <button type="button" className="share-primary" onClick={nativeShare}><Share2 size={17} />Share invite</button>

        <div className="share-options" aria-label="Share invite using">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noreferrer"><span>W</span>WhatsApp</a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(inviteText)}`} target="_blank" rel="noreferrer"><Send size={18} />Telegram</a>
          <a href={`mailto:?subject=${encodeURIComponent("You're invited to the @seen founding circle")}&body=${encodeURIComponent(shareMessage)}`}><Mail size={18} />Email</a>
          <button type="button" onClick={copyInvite}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'Copied' : 'Copy link'}</button>
        </div>

        <div className="share-link"><span>{inviteUrl}</span><button type="button" onClick={copyInvite} aria-label="Copy invitation link">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
        <Link className="share-return" to={referralCode ? `/?ref=${encodeURIComponent(referralCode)}` : '/'}>View the founding page</Link>
      </section>
    </main>
  );
}