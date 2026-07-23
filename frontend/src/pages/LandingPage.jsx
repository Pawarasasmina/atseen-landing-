import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Aperture,
  ArrowDown,
  ArrowRight,
  Check,
  CircleUserRound,
  Compass,
  DollarSign,
  Eye,
  Globe2,
  Menu,
  MessageCircle,
  Mic2,
  Orbit,
  Play,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import Brand from '../components/Brand';
import CreatorForm from '../components/CreatorForm';
import LegalModal from '../components/LegalModal';
import Reveal from '../components/Reveal';

const orbitPeople = [
  { name: 'Lina', role: 'Travel creator', initials: 'LI', x: 18, y: 34, tone: '#8DBDCA' },
  { name: 'Mia', role: 'Fashion creator', initials: 'MI', x: 78, y: 25, tone: '#AFCBFF' },
  { name: 'Omar', role: 'Fitness creator', initials: 'OM', x: 84, y: 70, tone: '#B8A27B' },
  { name: 'Anna', role: 'Business creator', initials: 'AN', x: 24, y: 76, tone: '#8C92BA' },
];

const productFeatures = [
  {
    icon: Aperture,
    number: '01',
    title: 'Share the real work',
    text: 'Publish Seens that feel immediate, honest and worth remembering.',
  },
  {
    icon: Orbit,
    number: '02',
    title: 'Build your World',
    text: 'Turn your knowledge and experiences into a place people can step inside.',
  },
  {
    icon: MessageCircle,
    number: '03',
    title: 'Get closer',
    text: 'Open meaningful conversations through guaranteed Direct Access.',
  },
];

function AmbientBackground() {
  return (
    <div className="ambient-scene" aria-hidden="true">
      <div className="ambient-grid" />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="light-beam beam-one" />
      <div className="light-beam beam-two" />
      <div className="star-field">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} style={{ '--i': index }} />
        ))}
      </div>
    </div>
  );
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

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('about');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: '-40% 0px -50%' },
    );
    document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const links = [
    ['about', 'About'],
    ['experience', 'Experience'],
    ['creators', 'For creators'],
    ['join', 'Join'],
  ];

  return (
    <header className={`site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5">
        <a href="#top" aria-label="@seen home" className="relative z-10">
          <Brand />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([id, label]) => (
            <a className={`nav-link ${active === id ? 'nav-link-active' : ''}`} href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
          <a href="/admin/login" className="text-sm text-white/40 transition hover:text-white">
            Login
          </a>
          <a href="#join" className="glow-button glow-button-small">
            <span>Early access</span>
          </a>
        </div>
        <button className="rounded-full border border-white/10 p-2.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Open navigation">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-white/[.06] bg-ink/95 p-5 backdrop-blur-2xl md:hidden"
          >
            {links.map(([id, label]) => (
              <a onClick={() => setOpen(false)} className="block border-b border-white/[.06] py-4 text-white/65" href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
            <a onClick={() => setOpen(false)} className="glow-button mt-5 w-full" href="#join">
              <span>Join the creator list</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroOrbit() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(orbitPeople[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const move = (event) => {
    if (reduce) return;
    const box = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientX - box.left) / box.width - 0.5) * 9,
      y: ((event.clientY - box.top) / box.height - 0.5) * -9,
    });
  };

  return (
    <div className="hero-visual-shell" onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="hero-visual-glow" />
      <motion.div
        className="hero-orbit"
        animate={{ rotateX: tilt.y, rotateY: tilt.x }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        <svg className="orbit-lines" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <circle cx="300" cy="300" r="252" />
          <circle cx="300" cy="300" r="190" />
          <circle cx="300" cy="300" r="126" />
          <path className="orbit-signal orbit-signal-one" d="M77 183C157 42 386 8 510 119" />
          <path className="orbit-signal orbit-signal-two" d="M99 450C218 582 430 563 518 425" />
        </svg>

        <div className="orbit-center">
          <div className="orbit-eye"><Eye size={28} strokeWidth={1.6} /></div>
          <span>You</span>
        </div>

        {orbitPeople.map((person, index) => (
          <button
            key={person.name}
            type="button"
            onClick={() => setActive(person)}
            className={`orbit-person ${active.name === person.name ? 'orbit-person-active' : ''}`}
            style={{ left: `${person.x}%`, top: `${person.y}%`, '--tone': person.tone, '--delay': `${index * -0.7}s` }}
            aria-label={`Show ${person.name}, ${person.role}`}
          >
            <span className="orbit-avatar">{person.initials}</span>
            <b>{person.name}</b>
          </button>
        ))}

        <motion.div
          key={active.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="encounter-card"
        >
          <span className="encounter-avatar" style={{ '--tone': active.tone }}>{active.initials}</span>
          <span>
            <small>IN YOUR ORBIT</small>
            <b>{active.name}</b>
            <em>{active.role}</em>
          </span>
          <ArrowRight size={16} />
        </motion.div>
      </motion.div>

      <div className="floating-chip chip-one"><span /> Live worlds</div>
      <div className="floating-chip chip-two"><Sparkles size={12} /> Tuned to you</div>
    </div>
  );
}

function PhonePreview() {
  const people = [
    ['Luca', 'LC', '32%', '14%', 37, '#8c6849'],
    ['Ethan', 'ET', '52%', '27%', 41, '#80603f'],
    ['Omar', 'OM', '82%', '20%', 37, '#8b6949'],
    ['Sofia', 'SF', '10%', '32%', 33, '#6f9b77'],
    ['Andre', 'AN', '18%', '60%', 36, '#8879a9'],
    ['Lina', 'LI', '37%', '61%', 41, '#6f89a3'],
    ['Mia', 'MI', '73%', '57%', 43, '#3a8db0'],
    ['James', 'JM', '40%', '79%', 33, '#52627a'],
    ['Alex', 'AX', '68%', '74%', 36, '#906a82'],
    ['Anna', 'AA', '90%', '68%', 38, '#7398b8'],
  ];

  return (
    <div className="phone-stage">
      <div className="phone-halo" />
      <div className="phone-device">
        <div className="phone-island" />
        <div className="phone-status"><b>9:41</b><span>▮▮▮ ▰</span></div>
        <div className="phone-content">
          <div className="flex items-start justify-between">
            <div>
              <h3>Your Orbit</h3>
              <p><span>tuned to your instincts</span> · closer means more like you</p>
            </div>
            <button type="button">✦ New lights</button>
          </div>
          <div className="phone-orbit">
            <i className="ring ring-one" />
            <i className="ring ring-two" />
            <i className="ring ring-three" />
            {people.map(([name, initials, x, y, size, color]) => (
              <div className="phone-person" key={name} style={{ left: x, top: y }}>
                <span style={{ width: size, height: size, '--tone': color }}>{initials}</span>
                <b>{name}</b>
              </div>
            ))}
            <div className="phone-you"><Eye size={18} /><b>You</b></div>
          </div>
          <div className="phone-encounter">
            <span>AN</span>
            <div><small>TODAY'S ENCOUNTER</small><b>Anna - "Landing in Paris tonight."</b></div>
            <em>Meet →</em>
          </div>
        </div>
        <div className="phone-nav">
          <Aperture size={18} /><Compass className="text-ice" size={19} /><Eye size={19} /><MessageCircle size={18} /><CircleUserRound size={19} />
        </div>
        <div className="phone-home" />
      </div>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

const showcaseModes = {
  worlds: {
    eyebrow: 'LIVING WORLDS',
    title: 'Knowledge people can step inside.',
    text: 'Bring chapters, voice, photos and real experience together in a World that keeps growing.',
    icon: Globe2,
    stat: '3 chapters',
    action: 'Step inside',
  },
  access: {
    eyebrow: 'DIRECT ACCESS',
    title: 'Questions that reach the right person.',
    text: 'Supporters ask something real. Creators answer within 48 hours—or the Stars return automatically.',
    icon: MessageCircle,
    stat: 'Reply guaranteed',
    action: 'Ask Lina',
  },
  earn: {
    eyebrow: 'CREATOR EARNINGS',
    title: 'Value that moves directly to creators.',
    text: 'Earn through Worlds, Direct Access and genuine support while keeping the relationship human.',
    icon: DollarSign,
    stat: '+18% this month',
    action: 'View dashboard',
  },
};

function ProductShowcase() {
  const [mode, setMode] = useState('worlds');
  const active = showcaseModes[mode];
  const ActiveIcon = active.icon;

  return (
    <section className="showcase-section">
      <div className="signal-marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }, (_, group) => (
            <span key={group}>
              <b>SEENS</b><i>✦</i><b>WORLDS</b><i>✦</i><b>DIRECT ACCESS</b><i>✦</i><b>REAL CONNECTION</b><i>✦</i><b>CREATOR VALUE</b><i>✦</i>
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-28">
        <Reveal className="grid items-end gap-8 lg:grid-cols-[1fr_.7fr]">
          <div>
            <p className="section-label">Inside the product</p>
            <h2 className="section-title max-w-4xl">Designed to turn attention<br /><span>into something real.</span></h2>
          </div>
          <p className="section-intro">Explore the core loops we are building into the @seen experience.</p>
        </Reveal>

        <div className="showcase-shell">
          <div className="showcase-tabs" role="tablist" aria-label="@seen product features">
            {[
              ['worlds', Globe2, 'Worlds'],
              ['access', MessageCircle, 'Direct Access'],
              ['earn', DollarSign, 'Creator value'],
            ].map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                className={mode === key ? 'active' : ''}
                onClick={() => setMode(key)}
              >
                <Icon size={17} /><span>{label}</span><i />
              </button>
            ))}
          </div>

          <div className="showcase-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: .32 }}
                className="showcase-copy"
              >
                <span className="showcase-icon"><ActiveIcon size={23} /></span>
                <small>{active.eyebrow}</small>
                <h3>{active.title}</h3>
                <p>{active.text}</p>
                <div><b>{active.stat}</b><button type="button">{active.action}<ArrowRight size={14} /></button></div>
              </motion.div>
            </AnimatePresence>

            <div className={`showcase-demo demo-${mode}`}>
              <div className="demo-glow" />
              <AnimatePresence mode="wait">
                {mode === 'worlds' && (
                  <motion.div key="world" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="world-demo">
                    <div className="world-planet"><span>🌍</span><i /><i /></div>
                    <div className="world-card">
                      <span className="world-play"><Play size={13} fill="currentColor" /></span>
                      <small>WORLD 01 · FITNESS</small>
                      <b>8-Week Transformation</b>
                      <em>by Ethan Brooks · 7,176 stepped inside</em>
                      <div><i /><i /><i /></div>
                    </div>
                  </motion.div>
                )}
                {mode === 'access' && (
                  <motion.div key="access" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="access-demo">
                    <div className="access-person"><span>LM</span><i /><b>Lina is answering</b></div>
                    <div className="chat-bubble chat-question">What changed the way you travel?<small>✦100 held · 47h left</small></div>
                    <div className="chat-bubble chat-answer"><Mic2 size={16} /><span className="audio-wave">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--h': `${7 + (i * 7) % 18}px` }} />)}</span><b>0:26</b></div>
                    <span className="access-guarantee"><ShieldCheck size={13} /> Guaranteed or refunded</span>
                  </motion.div>
                )}
                {mode === 'earn' && (
                  <motion.div key="earn" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="earn-demo">
                    <small>YOUR EARNINGS THIS MONTH</small>
                    <strong>$2,340</strong>
                    <em>▲ 18% vs last month</em>
                    {[
                      ['Anna stepped inside your World', '+$152'],
                      ['Omar opened Direct Access', '+$80'],
                      ['Mia supported your latest Seen', '+$40'],
                    ].map(([text, value], i) => <div className="earning-row" key={text} style={{ '--delay': `${i * .12}s` }}><span>{text}</span><b>{value}</b></div>)}
                    <div className="earning-chart">{[34, 48, 38, 61, 54, 76, 68, 91].map((height, i) => <i key={i} style={{ height: `${height}%`, '--delay': `${i * .08}s` }} />)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [legal, setLegal] = useState(null);
  const heroRef = useRef(null);

  return (
    <div id="top" className="site-shell overflow-hidden bg-ink text-white">
      <AmbientBackground />
      <PointerGlow />
      <Nav />

      <main>
        <section ref={heroRef} className="hero-section">
          <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-5 pb-16 pt-28 lg:grid-cols-[.95fr_1.05fr] lg:pt-24">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }} className="relative z-10">
              <div className="eyebrow"><span /> Private worlds. Real people.</div>
              <h1 className="hero-title">Step into the real worlds of <span>creators.</span></h1>
              <p className="hero-copy">@seen is where authentic stories become living Worlds - and attention becomes meaningful connection.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#join" className="glow-button"><span>Join as a creator <ArrowRight size={17} /></span></a>
                <a href="#experience" className="outline-button">Explore the idea <ArrowDown size={16} /></a>
              </div>
              <div className="hero-proof">
                <span><ShieldCheck size={15} /> Free to create</span>
                <span><Zap size={15} /> Direct connection</span>
                <span><Sparkles size={15} /> Built for real people</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.12 }}>
              <HeroOrbit />
            </motion.div>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to learn more"><span>Scroll to discover</span><ArrowDown size={14} /></a>
        </section>

        <section id="about" className="section-space relative border-y border-white/[.06]">
          <div className="section-glow section-glow-left" />
          <div className="mx-auto max-w-7xl px-5">
            <Reveal className="grid items-end gap-8 lg:grid-cols-[1fr_.75fr]">
              <div>
                <p className="section-label">The platform</p>
                <h2 className="section-title max-w-4xl">Not another feed.<br /><span>A world with a pulse.</span></h2>
              </div>
              <p className="section-intro">Built for the moments, knowledge and experiences that deserve more depth than a disappearing post.</p>
            </Reveal>
            <div className="feature-grid">
              {productFeatures.map(({ icon: Icon, number, title, text }, index) => (
                <Reveal key={title} className="feature-card" style={{ transitionDelay: `${index * 80}ms` }}>
                  <div className="feature-top"><Icon size={23} strokeWidth={1.45} /><span>{number}</span></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <i><ArrowRight size={15} /></i>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section-space relative">
          <div className="mx-auto max-w-7xl px-5">
            <Reveal className="mb-14 text-center">
              <p className="section-label justify-center">How @seen feels</p>
              <h2 className="section-title mx-auto max-w-4xl">Closer than following.<br /><span>More human than scrolling.</span></h2>
            </Reveal>
            <div className="experience-panel">
              <div className="experience-path" aria-hidden="true"><span /><span /><span /></div>
              {[
                ['01', 'Discover', 'Your Orbit brings the right people closer - shaped by what genuinely interests you.'],
                ['02', 'Step inside', 'Explore a creator World made from chapters, moments, voice and lived experience.'],
                ['03', 'Connect', 'Ask something real through Direct Access, with a guaranteed reply or refund.'],
              ].map(([number, title, text]) => (
                <Reveal className="experience-step" key={title}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </Reveal>
              ))}
            </div>
            <div className="metric-row">
              <Metric value="Free" label="to scroll and create" />
              <Metric value="48h" label="guaranteed Direct Access" />
              <Metric value="Real" label="people, worlds and signals" />
              <Metric value="Yours" label="your story and community" />
            </div>
          </div>
        </section>

        <ProductShowcase />

        <section id="creators" className="section-space relative border-y border-white/[.06] bg-night/55">
          <div className="section-glow section-glow-right" />
          <div className="mx-auto grid max-w-7xl items-center gap-20 px-5 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal>
              <p className="section-label">For creators</p>
              <h2 className="section-title">Your work deserves<br /><span>its own gravity.</span></h2>
              <p className="section-intro mt-6 max-w-xl">Build a premium community around the work only you can make. @seen gives every creator a place to publish, connect and grow without losing what makes them human.</p>
              <div className="creator-list">
                {[
                  ['Public Seens', 'Share honest moments that invite people closer.'],
                  ['Living Worlds', 'Package your knowledge into immersive chapters.'],
                  ['Direct Access', 'Turn interest into guaranteed conversation.'],
                  ['Creator earnings', 'Earn from Worlds, access and genuine support.'],
                ].map(([title, text]) => (
                  <div key={title}><span><Check size={13} /></span><p><b>{title}</b><em>{text}</em></p></div>
                ))}
              </div>
              <a href="#join" className="text-link">Start building your World <ArrowRight size={16} /></a>
            </Reveal>
            <Reveal><PhonePreview /></Reveal>
          </div>
        </section>

        <section id="join" className="section-space join-section">
          <div className="mx-auto max-w-6xl px-5">
            <div className="join-shell">
              <div className="join-light" />
              <Reveal className="join-copy">
                <div className="eyebrow"><span /> Early creator access</div>
                <h2>Be one of the first<br />Worlds people enter.</h2>
                <p>This page is temporary. The community we are building is not. Share your details and our team will contact you before launch.</p>
                <div className="join-points">
                  <span><Check size={14} /> Priority onboarding</span>
                  <span><Check size={14} /> Early creator visibility</span>
                  <span><Check size={14} /> No commitment required</span>
                </div>
              </Reveal>
              <Reveal className="join-form"><CreatorForm /></Reveal>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-orbit" aria-hidden="true"><i /><i /><i /></div>
          <Reveal className="relative z-10 mx-auto max-w-4xl px-5 text-center">
            <Eye className="mx-auto text-ice" size={34} strokeWidth={1.2} />
            <p className="section-label mt-7 justify-center">The first Worlds are opening</p>
            <h2>Will yours be one of them?</h2>
            <a href="#join" className="glow-button mt-9"><span>Join the creator list <ArrowRight size={17} /></span></a>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/[.06] bg-night">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">Authentic stories, living Worlds and meaningful creator connections.</p>
            <a className="mt-3 inline-block text-sm text-ice" href="mailto:hello@atseen.com">hello@atseen.com</a>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/40 md:items-end">
            <div className="flex gap-5"><button onClick={() => setLegal('Privacy')}>Privacy</button><button onClick={() => setLegal('Terms')}>Terms</button></div>
            <p>17+ · Strictly SFW</p>
            <p>&copy; 2026 Atseen OÜ. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <LegalModal type={legal} onClose={() => setLegal(null)} />
    </div>
  );
}
