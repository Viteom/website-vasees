import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from '@phosphor-icons/react';
import { podcastGuests, type PodcastGuest } from './content/chispa';
import { SiteLink } from './navigation';

function GuestPortrait({ guest, priority }: { guest: PodcastGuest; priority: boolean }) {
  return <div className="chispa-guest-portrait"><img src={guest.image} alt={`Retrato de ${guest.name}`} style={{ objectPosition: guest.position }} width="400" height="500" fetchPriority={priority ? 'high' : 'auto'} decoding="async" /></div>;
}

export function ChispaPodcastHero({ onListen }: { onListen: () => void }) {
  const stage = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const position = useRef(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [resumeWhileFocused, setResumeWhileFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const running = !paused && !hovered && (!focused || resumeWhileFocused) && !reduced && visible && inView;

  // The same periodic position drives every card. Wrapping happens outside the
  // visible arc; there is one DOM item per guest, without repeated portraits.
  const paint = useCallback(() => {
    if (!stage.current) return;
    const width = stage.current.clientWidth;
    const cardWidth = width > 1100 ? 216 : width > 600 ? 184 : 170;
    const step = cardWidth + (width > 600 ? 22 : 18);
    stage.current.style.setProperty('--guest-width', `${cardWidth}px`);
    cards.current.forEach((card, index) => {
      if (!card) return;
      const count = podcastGuests.length;
      const slot = ((index - position.current + count * 1.5) % count + count) % count - count / 2;
      const distance = Math.abs(slot);
      card.style.transform = `translate3d(${slot * step}px, ${-9 * slot * slot}px, 0) rotateY(${-slot * 13}deg) rotateZ(${-slot * 1.4}deg)`;
      card.style.opacity = String(Math.min(1, Math.max(0, (4 - distance) * 2)));
      card.style.zIndex = String(10 - Math.round(distance));
    });
  }, []);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), { threshold: .05 });
    if (stage.current) observer.observe(stage.current);
    const resize = new ResizeObserver(paint);
    if (stage.current) resize.observe(stage.current);
    paint();
    return () => { media.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updateVisibility); observer.disconnect(); resize.disconnect(); };
  }, [paint]);

  useEffect(() => {
    if (!running) return;
    let frame = 0, previous = 0;
    const tick = (time: number) => {
      // Clamp the elapsed time after a suspended tab; no catch-up jump.
      if (previous) position.current = (position.current + Math.min(time - previous, 50) / 9000) % podcastGuests.length;
      previous = time;
      paint();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, paint]);

  function step(direction: number) {
    setPaused(true);
    position.current = (Math.round(position.current) + direction + podcastGuests.length) % podcastGuests.length;
    paint();
    const current = Math.round(position.current);
    setAnnouncement(`${podcastGuests[current].name}. Invitado ${current + 1} de ${podcastGuests.length}.`);
  }

  return <section className="chispa-podcast-hero" aria-labelledby="chispa-podcast-title">
    <header className="chispa-podcast-intro">
      <div className="chispa-podcast-brand"><img src="/images/brands/chispa-mark.svg" alt="" width="35" height="35" /><img src="/images/brands/chispa-wordmark.svg" alt="La Chispa" width="188" height="29" /><span>Podcast</span></div>
      <h1 id="chispa-podcast-title" tabIndex={-1}>Conversaciones<br /><em>que encienden.</em></h1>
      <p>Vida, vejez, cultura y arte. Conversaciones para escuchar otras experiencias y ampliar nuestra mirada.</p>
      <div className="chispa-podcast-hero-actions"><button className="button" onClick={onListen} aria-controls="podcast"><Play size={17} weight="fill" />Escuchar el podcast</button><SiteLink href="#cartografia">Nuestra última campaña<ArrowUpRight size={17} /></SiteLink></div>
    </header>
    <div className="chispa-guests" role="region" aria-roledescription="carrusel" aria-label="Invitados de La Chispa Podcast" data-motion={running ? 'running' : 'paused'}
      onFocusCapture={() => { setFocused(true); setResumeWhileFocused(false); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setFocused(false); setResumeWhileFocused(false); } }}>
      <ul className="chispa-guests-stage" ref={stage} aria-live="off" onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}>{podcastGuests.map((guest, index) => {
        const slot = (index + 4) % 8 - 4;
        const initialStyle = { '--guest-slot': slot, '--guest-lift': `${-9 * slot * slot}px`, '--guest-turn': `${-slot * 13}deg`, '--guest-tilt': `${-slot * 1.4}deg`, opacity: Math.min(1, Math.max(0, (4 - Math.abs(slot)) * 2)) } as CSSProperties;
        return <li className="chispa-guest" key={guest.name} style={initialStyle} ref={element => { cards.current[index] = element; }}><figure><GuestPortrait guest={guest} priority={index === 0} /><figcaption>{guest.name}</figcaption></figure></li>;
      })}</ul>
      <div className="chispa-guests-toolbar"><p>Voces que encienden La Chispa</p><div><button onClick={() => step(-1)} aria-label="Ver invitado anterior"><ArrowLeft size={19} /></button>{!reduced && <button className="chispa-guests-pause" onClick={() => { if (paused) { setPaused(false); setResumeWhileFocused(true); } else setPaused(true); }} aria-label={paused ? 'Reanudar movimiento de invitados' : 'Pausar movimiento de invitados'}>{paused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}<span>{paused ? 'Reanudar' : 'Pausar'}</span></button>}<button onClick={() => step(1)} aria-label="Ver invitado siguiente"><ArrowRight size={19} /></button></div></div>
      <p role="status" className="sr-only">{announcement}</p>
    </div>
  </section>;
}
