import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from '@phosphor-icons/react';

export function FlowerMotion() {
  const video = useRef<HTMLVideoElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    if (visual.current) observer.observe(visual.current);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (paused || reduced || !visible || !pageVisible || failed) element.pause();
    else {
      void element.play().catch((error: DOMException) => {
        // Pausing or unmounting can abort a pending play without a media failure.
        if (error.name !== 'AbortError') { setFailed(true); setReady(false); }
      });
    }
  }, [paused, reduced, visible, pageVisible, failed]);

  const showingMotion = ready && !reduced && !failed;
  return <>
    <div ref={visual} className={`hero-flower-visual ${showingMotion ? 'is-ready' : ''}`}>
      <img className="hero-image" src="/images/hero-flower.png" alt="Flor coral translúcida sobre un fondo azul petróleo, una exploración visual entre naturaleza y tecnología" width="1536" height="1024" fetchPriority="high" />
      {!reduced && !failed && <video ref={video} className="hero-flower-video" src="/videos/hero-flower-breeze.mp4" poster="/images/hero-flower.png" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} onPlaying={() => setReady(true)} onError={() => { setFailed(true); setReady(false); }} />}
    </div>
    {showingMotion && <button className="hero-flower-control" aria-label={paused ? 'Reanudar animación de la flor' : 'Pausar animación de la flor'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} weight="fill" /> : <Pause size={15} weight="fill" />}<span>{paused ? 'Reanudar flor' : 'Pausar flor'}</span></button>}
  </>;
}
