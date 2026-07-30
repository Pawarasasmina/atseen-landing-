import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Eye, Gem, Sparkles } from 'lucide-react';
import { BrandName, BrandText } from './BrandName';

export default function DiscoveryCarousel({ steps, benefits, proofPoints, profile }) {
  const trackRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);
  const cardCount = 4;

  const moveTo = (index) => {
    const next = Math.max(0, Math.min(cardCount - 1, index));
    trackRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveCard(next);
  };
  const updateActiveCard = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children];
    const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - track.scrollLeft) ? index : best, 0);
    setActiveCard(nearest);
  };

  return <section id="experience" className="discovery-section" aria-labelledby="discovery-title">
    <div className="discovery-heading"><div><p className="section-label">Discover more</p><h2 id="discovery-title">Everything else, <span>when you want it.</span></h2></div><div className="discovery-controls" aria-label="Carousel navigation"><span>{String(activeCard + 1).padStart(2, '0')} / {String(cardCount).padStart(2, '0')}</span><button type="button" onClick={() => moveTo(activeCard - 1)} disabled={activeCard === 0} aria-label="Previous card"><ArrowLeft size={18} /></button><button type="button" onClick={() => moveTo(activeCard + 1)} disabled={activeCard === cardCount - 1} aria-label="Next card"><ArrowRight size={18} /></button></div></div>
    <div ref={trackRef} onScroll={updateActiveCard} className="discovery-track" tabIndex="0" aria-label="Additional information cards">
      <article className="discovery-card discovery-how"><div className="discovery-card-top"><span>01</span><ClipboardCheck size={21} /></div><p className="discovery-kicker">How it works</p><h3>Three steps. <em>Your place is saved.</em></h3><div className="discovery-steps">{steps.map(([number, title, text, Icon]) => <div key={title}><span><Icon size={17} /></span><b>{number} · {title}</b><p><BrandText>{text}</BrandText></p></div>)}</div></article>
      <article id="status" className="discovery-card discovery-benefits"><div className="discovery-card-top"><span>02</span><Sparkles size={21} /></div><p className="discovery-kicker">Built for creators</p><h3>Grow, get discovered, <em>and earn.</em></h3><div className="discovery-benefit-list">{benefits.map(([title, text, Icon]) => <div key={title}><span><Icon size={16} /></span><p><b>{title}</b><small><BrandText>{text}</BrandText></small></p></div>)}</div></article>
      <article className="discovery-card discovery-access"><div className="discovery-card-top"><span>03</span><Gem size={21} /></div><p className="discovery-kicker">Founding access</p><h3>Selected creators <em>open first.</em></h3><div className="discovery-metrics">{proofPoints.map(([title, text, Icon]) => <div key={title}><Icon size={16} /><b>{title}</b><small>{text}</small></div>)}</div><div className="discovery-promise"><Check size={16} /><p><b>No follower minimum.</b><span>Worlds matter here. Numbers don&apos;t.</span></p></div></article>
      <article className="discovery-card discovery-founder"><div className="discovery-card-top"><span>04</span><Eye size={21} /></div><div className="discovery-founder-layout"><div className="discovery-founder-copy"><div className="quote-signal" aria-hidden="true"><Eye size={18} /><i /><Sparkles size={13} /></div><blockquote><span><i aria-hidden="true">&ldquo;</i>Followers look. Fans invest.</span><span>We built the place where they can.<i aria-hidden="true">&rdquo;</i></span></blockquote><p>&mdash; the <BrandName /> founding team</p></div>{profile}</div></article>
    </div>
    <div className="discovery-dots" aria-hidden="true">{Array.from({ length: cardCount }, (_, index) => <i className={index === activeCard ? 'active' : ''} key={index} />)}</div><p className="discovery-hint"><ArrowRight size={14} /> Swipe to explore</p>
  </section>;
}