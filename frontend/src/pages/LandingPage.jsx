import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Coins,
  Eye,
  Gem,
  Globe2,
  Instagram,
  LockKeyhole,
  Mail,
  MessageCircle,
  Rocket,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import Brand from '../components/Brand';
import CreatorForm from '../components/CreatorForm';
import LegalModal from '../components/LegalModal';
import Reveal from '../components/Reveal';
import api from '../lib/api';

const foundingPerks = [
  { title: 'Founding terms', text: 'Special conditions locked from day one, before @seen opens to every creator.', icon: LockKeyhole, signal: '01' },
  { title: 'The Founding badge', text: 'A visible seal beside your name that tells fans you were here before the doors opened.', icon: BadgeCheck, signal: '02' },
  { title: 'Fans pay to reach you', text: 'Direct Access gives followers a private window where every reply is paid and guaranteed.', icon: Coins, signal: '03' },
  { title: 'Your world, your prices', text: 'Premium experiences and private Worlds that your followers unlock on your terms.', icon: Globe2, signal: '04' },
  { title: 'Shape the product', text: 'A direct line to the team while the founding circle decides what @seen becomes.', icon: SlidersHorizontal, signal: '05' },
];

const steps = [
  ['01', 'Apply', 'Two minutes: who you are, where you create, and the World people would step into.', ClipboardCheck],
  ['02', 'We invite you', 'If it is a fit, your personal founding registration invite lands in your inbox first.', Mail],
  ['03', 'You open with us', 'Your profile, badge, Worlds and Direct Access are ready when the doors open.', Rocket],
];

const proofPoints = [
  ['Founding', 'badge and terms', Gem],
  ['Paid', 'Direct Access replies', Coins],
  ['Private', 'Worlds and premium drops', LockKeyhole],
  ['Manual', 'weekly review', ShieldCheck],
];

const modes = {
  worlds: {
    label: 'Worlds',
    title: 'Private spaces fans can step inside.',
    text: 'Creators turn lived experience, routines, voice notes and premium drops into a place followers can unlock.',
    icon: Globe2,
  },
  access: {
    label: 'Direct Access',
    title: 'Attention finally has a price.',
    text: 'Fans ask something real. Creators answer inside a guaranteed private window, with value clear on both sides.',
    icon: MessageCircle,
  },
  status: {
    label: 'Founding status',
    title: 'It shows on your profile.',
    text: 'The Founding Creator seal becomes part of your identity on @seen from the first public day.',
    icon: BadgeCheck,
  },
};

function AmbientBackground() {
  return (
    <div className="ambient-scene" aria-hidden="true">
      <div className="ambient-grid" />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="light-beam beam-one" />
      <div className="light-beam beam-two" />
      <div className="star-field">{Array.from({ length: 72 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</div>
    </div>
  );
}

function PageStars() {
  return <div className="page-star-field" aria-hidden="true">{Array.from({ length: 72 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</div>;
}

function PointerGlow() {
  useEffect(() => {
    const move = (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div className="pointer-glow" aria-hidden="true" />;
}

function EyeMark({ className = '' }) {
  return (
    <span className={`eye-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 40"><path d="M2 20 C14 3 50 3 62 20 C50 37 14 37 2 20 Z" /><circle cx="32" cy="20" r="8.5" /><circle cx="35" cy="17" r="2.4" /></svg>
    </span>
  );
}

function Nav() {
  return (
    <header className="site-nav site-nav-scrolled">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
        <a href="#top" aria-label="@seen home"><Brand /></a>
        <div className="hidden items-center gap-7 md:flex">
          <a className="nav-link" href="#founding">Founding</a>
          <a className="nav-link" href="#status">Status</a>
          <a className="nav-link" href="#experience">How it works</a>
          <a className="nav-link" href="#apply">Apply</a>
          <a href="/admin/login" className="text-sm text-white/40 transition hover:text-white">Login</a>
        </div>
        <a href="#apply" className="glow-button glow-button-small"><span>Apply now</span></a>
      </nav>
    </header>
  );
}

function useApplicationCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let active = true;
    let timer;

    const loadCount = async () => {
      try {
        const { data } = await api.get('/count', { params: { t: Date.now() } });
        if (!active) return;
        setCount(Number(data.count ?? data.real_count ?? 0));
      } catch {
        if (active) setCount((current) => current ?? 0);
      }
    };

    const startPolling = () => {
      window.clearInterval(timer);
      loadCount();
      timer = window.setInterval(loadCount, 5000);
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadCount();
    };

    startPolling();
    window.addEventListener('application-count-refresh', loadCount);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('application-count-refresh', loadCount);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return count === null ? '...' : count.toLocaleString('en-US');
}

function FoundingProfileMock() {
  return (
    <div className="founding-profile-wrap">
      <div className="profile-callout"><span />the Founding seal</div>
      <div className="founding-profile">
        <div className="profile-cover"><img src="/images/ethan-brooks-cover.png" alt="" /></div>
        <div className="profile-avatar"><img src="/images/ethan-brooks-avatar.png" alt="Ethan Brooks" /></div>
        <div className="profile-name">Ethan Brooks <BadgeCheck size={17} /> <EyeMark /></div>
        <p>@ethan</p>
        <div className="profile-state"><i />At the gym</div>
        <div className="profile-stats"><b>664<span>Supporters</span></b><b>8.4K<span>Followers</span></b><b>212<span>Following</span></b></div>
        <div className="founding-pill"><EyeMark /> Founding Creator</div>
      </div>
    </div>
  );
}

function SignalMarquee() {
  return (
    <div className="signal-marquee" aria-hidden="true">
      <div>{Array.from({ length: 2 }, (_, group) => <span key={group}><b>REAL CONNECTION</b><i /><b>CREATOR VALUE</b><i /><b>SEENS</b><i /><b>WORLDS</b><i /><b>DIRECT ACCESS</b><i /></span>)}</div>
    </div>
  );
}

function ProductShowcase() {
  const [mode, setMode] = useState('worlds');
  const active = modes[mode];
  const ActiveIcon = active.icon;

  return (
    <section className="showcase-section" id="status">
      <SignalMarquee />
      <div className="mx-auto max-w-7xl px-5 py-24 md:py-28">
        <Reveal className="grid items-end gap-8 lg:grid-cols-[1fr_.72fr]">
          <div><p className="section-label">Inside the product</p><h2 className="section-title max-w-4xl">The prototype, made sharper<br /><span>for the first creators.</span></h2></div>
          <p className="section-intro">We kept the moving signal language the client liked, then rebuilt the story around founding access, badge status and creator value.</p>
        </Reveal>
        <div className="showcase-shell founding-showcase">
          <div className="showcase-tabs" role="tablist" aria-label="@seen founding features">
            {Object.entries(modes).map(([key, item]) => <button key={key} type="button" role="tab" aria-selected={mode === key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}><item.icon size={17} /><span>{item.label}</span><i /></button>)}
          </div>
          <div className="showcase-content">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .28 }} className="showcase-copy">
                <span className="showcase-icon"><ActiveIcon size={23} /></span><small>{active.label}</small><h3>{active.title}</h3><p>{active.text}</p><div><b>Founding circle</b><a href="#apply">Request invite <ArrowRight size={14} /></a></div>
              </motion.div>
            </AnimatePresence>
            <div className="showcase-demo founding-demo"><div className="demo-glow" /><FoundingProfileMock /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [legal, setLegal] = useState(null);
  const count = useApplicationCount();

  return (
    <div id="top" className="site-shell overflow-hidden bg-ink text-white">
      <AmbientBackground />
      <PointerGlow />
      <Nav />
      <main>
        <section className="founding-hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }} className="founding-hero-inner">
            <EyeMark className="hero-eye" />
            <div className="founding-tag"><span />Founding creators Â· early access</div>
            <h1>Be seen <span>first.</span></h1>
            <p>@seen opens with a <b>limited founding circle</b> of creators. A new social platform where fans step into your real world and pay to get closer.</p>
            <div className="hero-actions"><a href="#apply" className="glow-button"><span>Apply now <ArrowRight size={17} /></span></a><a href="#founding" className="outline-button">See what you get <ArrowDown size={16} /></a></div>
            <small><b>{count}</b>  creators have already applied </small>
          </motion.div>
        </section>

        <section id="founding" className="section-space relative border-y border-white/[.06]">
          <div className="section-glow section-glow-left" />
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="grid items-end gap-8 lg:grid-cols-[1fr_.75fr]"><div><p className="section-label">Why founding</p><h2 className="section-title max-w-4xl">What founding creators<br /><span>get first.</span></h2></div><p className="section-intro">@seen will open to every creator. The founding circle gets in earlier, with conditions locked from day one.</p></Reveal>
            <div className="perk-list">{foundingPerks.map(({ title, text, icon: Icon, signal }, index) => <Reveal className="perk-row" key={title} style={{ transitionDelay: `${index * 70}ms` }}><span className="perk-icon"><Icon size={19} /></span><p><small>{signal} / founding signal</small><b>{title}</b><em>{text}</em></p><i className="perk-orbit" aria-hidden="true" /></Reveal>)}</div>
          </div>
        </section>

        <section id="experience" className="section-space relative">
          <div className="mx-auto max-w-7xl px-5">
            <Reveal className="mb-14 text-center"><p className="section-label justify-center">How it works</p><h2 className="section-title mx-auto max-w-4xl">Three steps.<br /><span>Then the doors open.</span></h2></Reveal>
            <div className="experience-panel"><div className="experience-path" aria-hidden="true"><span /><span /><span /></div>{steps.map(([number, title, text, Icon]) => <Reveal className="experience-step" key={title}><span className="experience-index">{number}</span><span className="experience-icon"><Icon size={21} /></span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}</div>
            <div className="metric-row">{proofPoints.map(([title, text, Icon]) => <div className="metric" key={title}><span className="metric-icon"><Icon size={16} /></span><b>{title}</b><span>{text}</span></div>)}</div>
          </div>
        </section>

        <ProductShowcase />

        <section className="founder-quote" aria-label="A note from the @seen founding team">
          <div className="founder-quote-glow" aria-hidden="true" />
          <div className="quote-signal" aria-hidden="true"><Eye size={21} /><i /><Sparkles size={14} /></div>
          <blockquote>“Followers look. Fans invest.<br />We built the place where they can.”</blockquote>
          <p>— the @seen founding team</p>
        </section>

        <section id="apply" className="section-space join-section">
          <div className="mx-auto max-w-6xl px-5">
            <div className="join-shell application-shell"><div className="join-light" />
              <Reveal className="join-copy"><div className="eyebrow"><span /> The application</div><h2>Request your invite.</h2><p>We read every application ourselves. Follower count matters less than a World worth stepping into.</p><div className="join-points"><span><Check size={14} /> Confirmation, not approval</span><span><Mail size={14} /> Invite lands here first</span><span><ShieldCheck size={14} /> No Telegram bots</span></div><div className="join-signal" aria-hidden="true"><span><i /> Founding signal</span><b>Ready in 02:00</b></div><div className="join-preview"><div className="join-preview-head"><span>Founding path</span><b><i /> Live</b></div><div className="join-preview-steps"><span><b>01</b> Apply</span><span><b>02</b> Review</span><span><b>03</b> Invite</span></div><p>Every application gets a personal review.</p></div><div className="join-signoff"><Eye size={23} strokeWidth={1.5} /><div><b>@seen</b><span>We’ll meet there soon.</span></div></div></Reveal>
              <Reveal className="join-form"><CreatorForm /></Reveal>
            </div>
          </div>
        </section>

      </main>
      <footer className="site-footer">
        <div className="footer-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="site-footer-inner">
          <Brand />
          <div className="footer-socials">
            <a href="https://instagram.com/_atseen" target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a>
            <a href="https://t.me/atseen" target="_blank" rel="noreferrer"><Send size={15} /> Telegram</a>
          </div>
          <div className="footer-emails"><a href="mailto:creators@atseen.com">creators@atseen.com</a><span>·</span><a href="mailto:hello@atseen.com">hello@atseen.com</a></div>
          <p>@seen · We see you. Every day.</p>
          <div className="footer-legal"><button onClick={() => setLegal('Privacy')}>Privacy</button><span>·</span><button onClick={() => setLegal('Terms')}>Terms</button></div>
        </div>
      </footer>
      <LegalModal type={legal} onClose={() => setLegal(null)} />
    </div>
  );
}


