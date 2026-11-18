import React, { useEffect, useRef, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { InnerPage } from './inner-pages';
import { DemoProvider, isPortalPath, portalPaths, useDemo } from './portal/demo-store';
import { Portal } from './portal';
import { FlowerMotion } from './flower-motion';
import { SiteLink, usePath } from './navigation';
import { pageMeta } from './content/pages';
import { ArrowUpRight, ArrowDown, List, X } from '@phosphor-icons/react';
import { site, schoolName, statColombia, context, vision, observatory, organizations, initiativeConfig, experience } from './content/home';
import { solutions } from './content/solutions';
import { legalPages } from './content/legal';
import { chispa } from './content/chispa';
import { ContactForm } from './contact-form';
import './styles.css';
import './inner-pages.css';
import './school.css';
import './portal/portal.css';
import './portal/learning.css';
import './brand-pages.css';
import './chispa-podcast-hero.css';
import './brief-v3.css';

export type ModalContent = { eyebrow: string; title: string; body: React.ReactNode; image?: string; subject?: string };
const mail = (subject: string, body = '') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
const IconArrow = () => <ArrowUpRight size={21} weight="regular" aria-hidden="true" />;
const navItems = [['Soluciones', '/soluciones'], ['Ecosistema', '/ecosistema'], ['Observatorio', '/observatorio'], ['Escuela', '/escuela'], ['La Chispa', '/la-chispa']] as const;
const isCurrent = (route: string, href: string) => route === href || route.startsWith(`${href}/`);

export function App({ initialPath }: { initialPath?: string } = {}) {
  return <DemoProvider><SiteApp initialPath={initialPath} /></DemoProvider>;
}

const newsletterModal: ModalContent = {
  eyebrow: 'Newsletter de Vasees', title: site.newsletter, image: '/images/editorial.webp',
  body: <><p className="dialog-intro">Ideas para una sociedad que vive más. Y quiere vivir diferente.</p><p>Estamos preparando la suscripción a {site.newsletter}. Todavía no hay una plataforma de envío conectada, así que este sitio no registra correos ni confirma suscripciones.</p><p>Si quieres recibir el primer número, escríbenos y te avisaremos cuando la suscripción esté abierta.</p></>,
  subject: `Quiero recibir ${site.newsletter}`,
};

function SiteApp({ initialPath }: { initialPath?: string }) {
  const route = usePath(initialPath);
  const schoolDemo = useDemo();
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (modal) {
      previousFocus.current = document.activeElement as HTMLElement;
      el.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      el.close();
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [modal]);

  useEffect(() => {
    const meta = pageMeta[route] ?? { title: 'Página no encontrada | Vasees', description: 'Encuentra tu camino de vuelta a Vasees.' };
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    setMenu(false); setModal(null);
  }, [route]);

  useEffect(() => {
    if (!menu) return;
    // The mobile menu behaves like a disclosure: Escape closes it and returns focus to its toggle.
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setMenu(false);
      document.querySelector<HTMLElement>('.menu-toggle')?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  function closeModal() { setModal(null); }
  const openNewsletter = () => setModal(newsletterModal);

  // Unknown URLs under /escuela/ or /admin fall through to the public 404, matching the static 404 document.
  if (isPortalPath(route) && portalPaths.includes(route)) return <Portal path={route} />;

  const school = route === '/escuela';
  return <>
    <SiteLink className="skip-link" href="#contenido">Ir al contenido</SiteLink>
    <header className="site-header">
      <nav className="nav-pill" aria-label="Navegación principal">
        <SiteLink className="brand" href="/" aria-label="Vasees, inicio" onClick={() => setMenu(false)}><img src="/images/vasees-logo.png" width="112" height="38" alt="Vasees" /></SiteLink>
        <div className="nav-links">
          {navItems.map(([label, href]) => <SiteLink key={href} href={href} aria-current={isCurrent(route, href) ? 'page' : undefined}>{label}</SiteLink>)}
        </div>
        <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenu(!menu)}>{menu ? <X size={24} /> : <List size={24} />}</button>
      </nav>
      <SiteLink className="header-cta" href={school ? schoolDemo.session ? '/escuela/inicio' : '/escuela/ingresar' : '/#contacto'} onClick={() => { if (school) schoolDemo.setAuthDestination('/escuela/inicio'); }}><span>{school ? schoolDemo.session ? 'Mi Escuela' : 'Ingresar' : 'Hablemos'}</span><span className="cta-icon"><IconArrow /></span></SiteLink>
      {menu && <nav id="mobile-navigation" className="mobile-menu" aria-label="Navegación móvil">{[...navItems, ['Hablemos', '/#contacto'] as const].map(([label, href]) => <SiteLink key={href} href={href} onClick={() => setMenu(false)} aria-current={isCurrent(route, href) ? 'page' : undefined}>{label}<IconArrow /></SiteLink>)}</nav>}
    </header>

    {route === '/' ? <Home onNewsletter={openNewsletter} /> : <InnerPage path={route} onNewsletter={openNewsletter} />}

    <footer className="footer">
      <div className="footer-top"><SiteLink className="footer-brand" href="/"><img src="/images/vasees-logo.png" alt="Vasees" width="170" height="58" /></SiteLink><p>Marcas, culturas organizacionales y tecnología<br />para una sociedad que vive más.</p><a href={mail('Hablemos de mi organización')}>{site.email}<IconArrow /></a></div>
      <div className="footer-links">
        <nav aria-label="Secciones del sitio"><p>Vasees</p>{navItems.map(([label, href]) => <SiteLink key={href} href={href}>{label}</SiteLink>)}<SiteLink href="/#contacto">Contacto</SiteLink></nav>
        <nav aria-label="Información legal"><p>Legal</p>{legalPages.map(page => <SiteLink key={page.path} href={page.path}>{page.short}</SiteLink>)}</nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Vasees</span><span>Hecho para lo que viene.</span></div>
      <p className="preview-note">Vista de revisión. Los textos legales están pendientes de revisión jurídica y los formularios no almacenan datos.</p>
    </footer>

    <dialog ref={dialog} className="detail-dialog" aria-labelledby="dialog-title" onCancel={closeModal} onClick={event => { if (event.target === event.currentTarget) closeModal(); }}>
      <button className="dialog-close" aria-label="Cerrar ventana" onClick={closeModal}><X size={24} /></button>
      {modal && <>{modal.image && <img className="dialog-cover" src={modal.image} alt="" />}<div className="dialog-content"><p className="eyebrow">{modal.eyebrow}</p><h2 id="dialog-title">{modal.title}</h2>{modal.body}{modal.subject && <a className="button button-dark" href={mail(modal.subject)}>Escribir a Vasees<IconArrow /></a>}</div></>}
    </dialog>
  </>;
}

function Home({ onNewsletter }: { onNewsletter: () => void }) {
  const platforms = initiativeConfig.filter(item => item.publicEnabled && item.kind === 'plataforma');
  return <main id="contenido">
    <section className="hero" id="inicio" aria-labelledby="hero-heading">
      <FlowerMotion />
      <div className="hero-shade" />
      <div className="hero-copy">
        <h1 id="hero-heading" tabIndex={-1}>El futuro cambia. <br />Lo humano permanece.</h1>
        <p className="hero-description">Diseñamos marcas, culturas organizacionales y tecnología para una sociedad que vive más.</p>
        <div className="hero-actions"><SiteLink className="button button-lime" href="/#soluciones">Explora nuestras soluciones <ArrowDown size={21} aria-hidden="true" /></SiteLink></div>
      </div>
    </section>

    <section className="organizations section-wrap" aria-labelledby="organizations-heading">
      <h2 id="organizations-heading">Organizaciones con las que hemos trabajado</h2>
      <ul>{organizations.map(item => <li key={item.name}>{item.name}</li>)}</ul>
    </section>

    <section className="chapter-context section-wrap" id="nosotros" aria-labelledby="context-heading">
      <div className="context-block">
        <h2 id="context-heading">{context.heading}</h2>
        <div>
          <p className="large-body">{context.text}</p>
          <figure className="context-stat"><strong>{context.stat.value}</strong><figcaption>{context.stat.text} <a href={site.source} target="_blank" rel="noreferrer">{context.stat.source}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (se abre en otra pestaña)</span></a></figcaption></figure>
          {statColombia.verified && statColombia.value && <figure className="context-stat"><strong>{statColombia.value}</strong><figcaption>Colombia, {statColombia.ageBand}, {statColombia.year} ({statColombia.projectionOrObservation}). {statColombia.source}</figcaption></figure>}
        </div>
      </div>
      <div className="vision-block">
        <h2>{vision.heading}</h2>
        <div><p>{vision.text}</p><SiteLink className="text-link" href="/ecosistema">Conoce el ecosistema Vasees<IconArrow /></SiteLink></div>
      </div>
      <article className="observatory-card" aria-labelledby="observatory-heading">
        <img src="/images/editorial.webp" alt="" width="1500" height="1000" loading="lazy" />
        <div><p className="observatory-card-name">{observatory.name}</p><h3 id="observatory-heading">{observatory.heading}</h3><p>{observatory.text}</p><p className="status-pill">Investigación en preparación</p><SiteLink className="button button-dark" href="/observatorio">Explora el Observatorio<IconArrow /></SiteLink></div>
      </article>
    </section>

    <section className="solutions section-wrap" id="soluciones" aria-labelledby="solutions-heading">
      <div className="section-heading"><h2 id="solutions-heading">Lo que hacemos</h2><p>Desde tu marca y tus campañas, hasta la cultura de tu equipo y la tecnología que necesita tu proyecto.</p></div>
      <div className="solution-grid">{solutions.map(item => <article className={`solution-card solution-${item.id}`} key={item.id} aria-labelledby={`solution-${item.id}-title`}>
        <img src={item.image} alt="" width="1200" height="900" loading="lazy" />
        <div className="solution-card-body"><p className="solution-name">{item.name} · {item.area}</p><h3 id={`solution-${item.id}-title`}>{item.card.title}</h3><p>{item.card.text}</p><ul>{item.card.services.map(service => <li key={service}>{service}</li>)}</ul><SiteLink className="solution-link" href={`/soluciones#${item.anchor}`}>{item.card.cta}<IconArrow /></SiteLink></div>
      </article>)}</div>
    </section>

    <section className="ecosystem section-wrap" id="ecosistema" aria-labelledby="ecosystem-heading">
      <div className="section-heading"><h2 id="ecosystem-heading">El futuro se construye en red.</h2><p>Distintas capacidades. Una misma pregunta: ¿cómo diseñamos mejores formas de vivir, trabajar y conectar en una sociedad más longeva?</p></div>
      <div className="ecosystem-summary">
        <div><h3>Lo que puedes contratar</h3><ul>{solutions.map(item => <li key={item.id}><SiteLink href={`/soluciones#${item.anchor}`}><strong>{item.name}</strong><span>{item.area}</span></SiteLink></li>)}</ul></div>
        <div><h3>Conocimiento, educación y conversación</h3><ul>{platforms.map(item => <li key={item.slug}><SiteLink href={item.route}><strong>{item.displayName}</strong><span>{item.description}</span></SiteLink></li>)}</ul></div>
      </div>
      <SiteLink className="text-link" href="/ecosistema">Así se conecta el ecosistema<IconArrow /></SiteLink>
    </section>

    <section className="school-teaser section-wrap" aria-labelledby="school-teaser-heading">
      <img src="/images/school-mateo-melissa.webp" alt="" width="1355" height="1161" loading="lazy" />
      <div><p className="school-teaser-name">{schoolName}</p><h2 id="school-teaser-heading">Aprender para vivir más y mejor, en cualquier etapa.</h2><p>Una escuela digital para entender el envejecimiento, cuidar y cuidarnos, relacionarnos entre generaciones y aprender herramientas que sirven en la vida cotidiana.</p><SiteLink className="button button-dark" href="/escuela">Conoce la Escuela<IconArrow /></SiteLink></div>
    </section>

    <section className="editorial section-wrap" id="insights" aria-labelledby="editorial-heading">
      <div className="section-heading"><h2 id="editorial-heading">El futuro también se lee. Y se conversa.</h2><p>Historias, ideas y entrevistas para mirar la longevidad desde la cultura, el trabajo y la vida cotidiana.</p></div>
      <div className="editorial-grid">
        <article className="editorial-chispa" aria-label="La Chispa"><img src="/images/brands/chispa-wordmark.svg" alt="La Chispa" width="252" height="39" loading="lazy" /><p>El medio editorial de Vasees: un podcast en video y una revista sobre vida, vejez, cultura y arte.</p><div className="editorial-links"><SiteLink className="text-link" href="/la-chispa">Explora La Chispa<IconArrow /></SiteLink><a className="text-link" href={chispa.podcastUrl} target="_blank" rel="noreferrer">Ver el podcast en YouTube<IconArrow /><span className="sr-only"> (se abre en otra pestaña)</span></a></div></article>
        <article className="editorial-newsletter" aria-labelledby="newsletter-heading"><p className="newsletter-kicker">El newsletter de Vasees</p><h3 id="newsletter-heading">{site.newsletter}</h3><p>Ideas para una sociedad que vive más. Y quiere vivir diferente.</p><button className="button button-dark" onClick={onNewsletter}>Suscríbete a nuestro newsletter<IconArrow /></button><p className="fine-print">La suscripción está en preparación.</p></article>
      </div>
    </section>

    <section className="experience section-wrap" aria-labelledby="experience-heading">
      <div className="section-heading"><h2 id="experience-heading">Experiencia</h2><p>Algunos de los proyectos e intervenciones que ya hemos realizado.</p></div>
      <ul className="experience-grid">{experience.map(item => <li key={item.title}><p className="experience-area">{item.area}</p><h3>{item.title}</h3><p>{item.text}</p></li>)}</ul>
    </section>

    <ContactForm />
    <section className="closing" aria-label="Firma de Vasees"><p className="closing-type">Más vida.<br /><span>Más futuro.</span></p></section>
  </main>;
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!;
  if (root.hasChildNodes()) hydrateRoot(root, <App />);
  else createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
}
