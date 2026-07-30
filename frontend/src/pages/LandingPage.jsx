import { useEffect, useRef, useState } from 'react';
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
  Gift,
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
import { BrandName, BrandText } from '../components/BrandName';
import CreatorForm from '../components/CreatorForm';
import DiscoveryCarousel from '../components/DiscoveryCarousel';
import LegalModal from '../components/LegalModal';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Reveal from '../components/Reveal';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const steps = [
  ['01', 'Apply', 'Two minutes: who you are, where you create, and the World people would step into.', ClipboardCheck],
  ['02', 'We invite you', 'If it is a fit, your personal founding registration invite lands in your inbox first.', Mail],
  ['03', 'You open with us', 'Your profile, badge, Worlds and Direct Access are ready when the doors open.', Rocket],
];

const proofPoints = [
  ['Founding', 'badge and terms', Gem],
  ['Paid', 'Direct Access replies', Coins],
  ['Limited ', 'Selected creators first', LockKeyhole],
  ['Gifts', 'Fans support you with virtual gifts. Creator payouts will be available subject to eligibility and platform terms.', Gift],
];
const heroCreatorIcons = Array.from({ length: 5 }, (_, index) => `/images/icon${index + 1}.jpeg`);

const creatorBenefits = [
  ['Earn', 'Create content and get paid', Coins],
  ['Global Reach', 'Get recommended worldwide', Globe2],
  ['No Minimum', 'Grow without a large following', Rocket],
  ['Direct Access', 'Connect with your audience and earn from your value', MessageCircle],
  ['Seen First', 'Early creators get priority visibility on our platform', Eye],
  ['Free Promotion', 'Selected creators get featured by @Seen', Sparkles],
];

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
        
        <div className="nav-actions"><LanguageSwitcher /><a href="#apply" className="glow-button glow-button-small"><span>Apply now</span></a></div>
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

function CompactFoundingProfile() {
  return (
    <div className="founder-profile-stage">
      <div className="founder-profile-beam" aria-hidden="true" />
      <div className="founding-profile-wrap">
        <div className="founding-profile">
          <div className="profile-cover"><img src="/images/ethan-brooks-cover.png" alt="" /></div>
          <div className="profile-avatar"><img src="/images/ethan-brooks-avatar.jpg" alt="Ethan Brooks" /></div>
          <div className="profile-name">Ethan Brooks <BadgeCheck size={17} /> <EyeMark /></div>
          <p>@ethan</p>
          <div className="profile-state"><i />At the gym</div>
          <div className="profile-stats"><b>664<span>Supporters</span></b><b>8.4K<span>Followers</span></b><b>212<span>Following</span></b></div>
          <div className="founding-pill"><EyeMark /> Founding Creator</div>
        </div>
      </div>
    </div>
  );
}
function SignalMarquee() {
  return (
    <div className="signal-marquee" aria-hidden="true">
      <div>{Array.from({ length: 2 }, (_, group) => <span key={group}><b>REAL CONNECTION</b><i /><b>CREATOR VALUE</b><i /><b>SEENS</b><i /><b>WORLDS</b><i /><b>DIRECT ACCESS</b></span>)}</div>
    </div>
  );
}

function CreatorBenefits() {
  return (
    <section className="creator-benefits-section" id="status">
      <SignalMarquee />
      <div className="creator-benefits-inner">
        <Reveal className="creator-benefits-heading">
          <p className="section-label">Built for creators</p>
          <h2>A new place to <span>grow, get discovered, and earn</span></h2>
          <p>Built for creators who want more than followers.</p>
        </Reveal>
        <div className="creator-benefits-grid">
          {creatorBenefits.map(([title, text, Icon], index) => (
            <Reveal className="creator-benefit-card" key={title} style={{ transitionDelay: `${index * 55}ms` }}>
              <span className="creator-benefit-icon"><Icon size={19} /></span>
              <div><h3>{title}</h3><p><BrandText>{text}</BrandText></p></div>
              <small>{String(index + 1).padStart(2, '0')}</small>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();
  const [legal, setLegal] = useState(null);
  const [showFloatingApply, setShowFloatingApply] = useState(false);
  const heroApplyRef = useRef(null);
  const applicationRef = useRef(null);
  const count = useApplicationCount();

  useEffect(() => {
    const visibility = { hero: true, application: false };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroApplyRef.current) visibility.hero = entry.isIntersecting;
        if (entry.target === applicationRef.current) visibility.application = entry.isIntersecting;
      });
      setShowFloatingApply(!visibility.hero && !visibility.application);
    }, { threshold: .12 });

    if (heroApplyRef.current) observer.observe(heroApplyRef.current);
    if (applicationRef.current) observer.observe(applicationRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="top" className="site-shell overflow-hidden bg-ink text-white">
      <AmbientBackground />
      <PointerGlow />
      <Nav />
      <main>
        <section className="founding-hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }} className="founding-hero-inner">
            <EyeMark className="hero-eye" />
            <div className="founding-tag"><span />Founding creators· early access</div>
            <h1>Be seen <span>first</span></h1>
            <p><BrandName /> opens with a <b>limited founding circle</b> of creators. A new social platform where fans step into your real world and pay to get closer.</p>
            <div className="hero-actions"><a ref={heroApplyRef} href="#apply" className="glow-button"><span>Apply now <ArrowRight size={17} /></span></a><a href="#experience" className="outline-button">How it works <ArrowDown size={16} /></a></div>
          </motion.div>
          <div className="hero-creator-count">
            <span className="hero-creator-icons" aria-hidden="true">
              {heroCreatorIcons.map((src, index) => <img src={src} alt="" key={src} style={{ zIndex: heroCreatorIcons.length - index }} />)}
              <i className="hero-creator-more">+</i>
            </span>
            <small><b>{count}</b> creators have already applied</small>
          </div>
        </section>

        <section ref={applicationRef} id="apply" className="section-space join-section immediate-application">
          <div className="mx-auto max-w-6xl px-5">
            <div className="join-shell application-shell"><div className="join-light" />
              <Reveal className="join-copy"><div className="eyebrow"><span /> The application</div><h2>Join the early-access waitlist</h2><p>We read every application ourselves. Follower count matters less than a World worth stepping into.</p><div className="join-points"><span><Check size={14} /> Confirmation, not approval</span><span><Mail size={14} /> Essential waitlist updates</span></div><div className="join-signal" aria-hidden="true"><span><i /> Founding signal</span><b>Ready in 02:00</b></div><div className="join-preview"><div className="join-preview-head"><span>Founding path</span><b><i /> Live</b></div><div className="join-preview-steps"><span><b>01</b> Apply</span><span><b>02</b> Review</span><span><b>03</b> Updates</span></div><p>Every application gets a personal review.</p></div><div className="join-signoff"><Eye size={23} strokeWidth={1.5} /><div><b><BrandName /></b><span>We&apos;ll meet there soon.</span></div></div></Reveal>
              <Reveal className="join-form"><CreatorForm onOpenLegal={setLegal} /></Reveal>
            </div>
          </div>
        </section>

        <DiscoveryCarousel steps={steps} benefits={creatorBenefits} proofPoints={proofPoints} profile={<CompactFoundingProfile />} />

      </main>
      <AnimatePresence>
        {showFloatingApply && <motion.a
          href="#apply"
          className="floating-apply-cta"
          initial={{ opacity: 0, y: 18, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 18, x: '-50%' }}
          transition={{ duration: .22 }}
        >Apply now <Sparkles size={14} /></motion.a>}
      </AnimatePresence>
      <footer className="site-footer">
        <div className="footer-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="site-footer-inner">
          <Brand />
          <div className="footer-socials">
            <a href="https://instagram.com/_atseen" target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a>
            <a href="https://t.me/atseen" target="_blank" rel="noreferrer"><Send size={15} /> Telegram</a>
          </div>
          <div className="footer-emails"><a href="mailto:creators@atseen.com">creators@atseen.com</a><span>·</span><a href="mailto:hello@atseen.com">hello@atseen.com</a></div>
          <p><BrandName /> <span aria-hidden="true">·</span> {t('we see you every day.')}</p>
          <div className="footer-legal"><button onClick={() => setLegal('Privacy Notice')}>Privacy Notice</button><span>·</span><button onClick={() => setLegal('Early Access Terms')}>Early Access Terms</button><span>·</span><a href="mailto:privacy@atseen.com">Contact</a></div>
        </div>
      </footer>
      <LegalModal type={legal} onClose={() => setLegal(null)} />
    </div>
  );
}


