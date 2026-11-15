import React, { useEffect, useRef, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { InnerPage } from './inner-pages';
import { SiteLink, usePath, navigate } from './navigation';
import { pageMeta } from './content/pages';
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, List, X, Pause, Play, ArrowLeft, Sparkle, Check, GlobeHemisphereWest } from '@phosphor-icons/react';
import { site, services, clients, initiatives, research, faqGroups, type Service } from './content/home';
import './styles.css';
import './inner-pages.css';

type ModalContent = { eyebrow: string; title: string; body: React.ReactNode; image?: string; subject?: string };
const mail = (subject: string, body = '') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const IconArrow = () => <ArrowUpRight size={21} weight="regular" aria-hidden="true" />;

export function App({ initialPath }: { initialPath?: string } = {}) {
  const route = usePath(initialPath);
  const [menu, setMenu] = useState(false);
  const [paused, setPaused] = useState(false);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [faqGroup, setFaqGroup] = useState<keyof typeof faqGroups>('Sobre Vasees');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const manifesto = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (modal || diagnostic) {
      previousFocus.current = document.activeElement as HTMLElement;
      el.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      el.close();
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [modal, diagnostic]);

  useEffect(() => {
    const section = manifesto.current;
    if (!section) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      const spans = section!.querySelectorAll<HTMLElement>('[data-reveal]');
      const rect = section!.getBoundingClientRect();
      const progress = (window.innerHeight * 0.25 - rect.top) / (rect.height - window.innerHeight * 0.6);
      spans.forEach((word, index) => {
        const value = media.matches ? 1 : Math.max(0, Math.min(1, (progress * 1.7 - index * 0.23) * 3));
        word.style.opacity = String(0.3 + value * 0.7);
        word.style.filter = `blur(${(1 - value) * 9}px)`;
      });
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    media.addEventListener('change', update);
    return () => { window.removeEventListener('scroll', onScroll); media.removeEventListener('change', update); cancelAnimationFrame(frame); };
  }, [route]);

  useEffect(() => {
    const meta = pageMeta[route] ?? { title: 'Página no encontrada | Vasees', description: 'Encuentra tu camino de vuelta a Vasees.' };
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    setMenu(false); setModal(null); setDiagnostic(false);
  }, [route]);

  function closeModal() { setModal(null); setDiagnostic(false); }
  function showResearch() { navigate('/observatorio/vivir-mas'); }


  return <>
    <SiteLink className="skip-link" href="#contenido">Ir al contenido</SiteLink>
    <header className="site-header">
      <nav className="nav-pill" aria-label="Navegación principal">
        <SiteLink className="brand" href="/" aria-label="Vasees, inicio" onClick={() => setMenu(false)}><img src="/images/vasees-logo.png" width="112" height="38" alt="Vasees" /></SiteLink>
        <div className={`nav-links ${menu ? 'is-open' : ''}`}>
          {[['Soluciones', '/#soluciones'], ['Observatorio', '/observatorio'], ['Ecosistema', '/ecosistema'], ['Insights', '/#insights']].map(([label, href]) => <SiteLink key={href} href={href} onClick={() => setMenu(false)} aria-current={route === href ? "page" : undefined}>{label}</SiteLink>)}
        </div>
        <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenu(!menu)}>{menu ? <X size={24} /> : <List size={24} />}</button>
      </nav>
      <SiteLink className="header-cta" href="/#contacto"><span>Diseña tu futuro</span><span className="cta-icon"><IconArrow /></span></SiteLink>
      {menu && <nav id="mobile-navigation" className="mobile-menu" aria-label="Navegación móvil">{[['Soluciones', '/#soluciones'], ['Observatorio', '/observatorio'], ['Ecosistema', '/ecosistema'], ['Insights', '/#insights'], ['Conversemos', '/#contacto']].map(([label, href]) => <SiteLink key={href} href={href} onClick={() => setMenu(false)}>{label}<IconArrow /></SiteLink>)}</nav>}
    </header>

    {route === "/" ? <main id="contenido">
      <section className="hero" id="inicio" aria-labelledby="hero-heading">
        <img className="hero-image" src="/images/hero-flower.png" alt="Flor coral translúcida sobre un fondo azul petróleo, una exploración visual entre naturaleza y tecnología" width="1536" height="1024" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="status-dot" /> Más años. Más futuro.</p>
          <h1 id="hero-heading" tabIndex={-1}>El futuro cambia. <br />Lo humano permanece.</h1>
          <p className="hero-description">Existimos para conectar ambos.<br /><span>Comunicación, cultura y tecnología<br className="desktop-break" /> para una sociedad más longeva.</span></p>
          <div className="hero-actions"><a className="button button-lime" href="#soluciones">Explora nuestras soluciones <ArrowUpRight size={21} /></a><a className="hero-text-link" href="#nosotros">Conoce nuestra mirada <ArrowRight size={18} /></a></div>
        </div>
        <div className="hero-bottom">
          <div className="client-module"><div className="clients-heading"><span>Las conexiones que amplían nuestra mirada</span><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar movimiento de nombres' : 'Pausar movimiento de nombres'}>{paused ? <Play size={12} weight="fill" /> : <Pause size={12} weight="fill" />}</button></div><div className={`client-viewport ${paused ? 'paused' : ''}`}><div className="client-track">{[0, 1].map(copy => <div className="client-row" key={copy} aria-hidden={copy === 1 ? true : undefined}>{clients.map((client, i) => <span className={`client-name client-${i}`} key={client}>{client}</span>)}</div>)}</div></div></div>
          <button className="hero-research" onClick={showResearch}><img src="/images/editorial.webp" width="140" height="160" alt="" /><span className="hero-research-content"><span className="tag">Desde el Observatorio</span><strong>Vivir más.<br />¿Estamos listos?</strong><span className="research-link">Explora nuestra última lectura <ArrowUpRight size={18} /></span></span></button>
        </div>
        <a className="scroll-hint" href="#manifiesto" aria-label="Descubrir más"><ArrowDown size={16} /><span>Hay más por descubrir</span></a>
      </section>

      <section className="intro section-wrap" id="nosotros">
        <div className="section-label"><span className="status-dot" /> Nuestra mirada <span className="section-index">01 / 07</span></div>
        <div className="intro-grid"><h2>Vivir más<br />lo cambia <em>todo.</em></h2><div><p className="large-body">Cambia cómo trabajamos, cuidamos, aprendemos y nos relacionamos.</p><p>En Vasees conectamos estrategia, creatividad y conocimiento gerontológico para ayudar a las organizaciones a diseñar para esa realidad. Escuchamos antes de comunicar. Comprendemos antes de crear.</p><a className="text-link" href="#soluciones">Una nueva mirada a lo que viene <IconArrow /></a></div></div>
      </section>

      <section ref={manifesto} className="manifesto" id="manifiesto" aria-label="Futuro. Longevidad. Humanidad.">
        <div className="manifesto-sticky"><img src="/images/hero-flower.png" alt="" loading="lazy" /><div className="manifesto-overlay" /><p className="eyebrow">Tres palabras. Una misma visión.</p><p className="manifesto-type" aria-hidden="true"><span data-reveal>Futuro.</span><span data-reveal>Longevidad.</span><span data-reveal>Humanidad.</span></p><p className="manifesto-caption">Más tiempo para vivir.<br />Más posibilidades para construir juntos.</p></div>
      </section>

      <section className="solutions section-wrap" id="soluciones">
        <div className="section-label"><span className="status-dot" /> Lo que hacemos <span className="section-index">02 / 07</span></div>
        <div className="section-heading"><h2>Tres formas de abrir<br />nuevas posibilidades.</h2><p>La marca que construyes. Las personas<br className="desktop-break" /> que la hacen posible. La tecnología<br className="desktop-break" /> que conecta sus mundos.</p></div>
        <div className="service-stack">{services.filter(service => service.enabled).map((service, index) => <article className={`service-card service-${service.id}`} key={service.id}>
          <div className="service-info"><div className="service-top"><span className="tag">{service.label}</span><span className="service-number">0{index + 1}</span></div><p className="service-brand">{service.name}{service.status === 'in-development' && <span className="development">En desarrollo</span>}</p><h3>{service.title.split('\n').map(line => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</h3><p className="service-description">{service.description}</p><div className="service-capabilities"><p>Una mirada, muchas formas de hacer.</p><div>{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><SiteLink className="service-button" href={`/${service.id}`}>Conoce {service.name.replace('Vasees ', '')}<IconArrow /></SiteLink></div><div className="service-visual"><img src={service.image} alt={service.alt} width="1200" height="900" loading="lazy" /><span className="image-note">Imagen conceptual</span><p>{index === 0 ? 'Una marca que entiende\na las personas.' : index === 1 ? 'La experiencia suma.\nLa conexión multiplica.' : 'El mejor punto de partida\nsiempre es humano.'}</p></div>
        </article>)}</div>
      </section>

      <section className="observatory section-wrap" id="observatorio">
        <div className="section-label"><span className="status-dot" /> Observatorio de Envejecimiento y Vejez <span className="section-index">03 / 07</span></div>
        <div className="section-heading"><h2>Comprender hoy.<br />Imaginar lo que viene.</h2><p>Preguntas, fuentes y perspectivas para<br className="desktop-break" /> convertir el cambio demográfico<br className="desktop-break" /> en decisiones con sentido.</p></div>
        <div className="research-feature"><div className="research-story"><div className="research-story-copy"><span className="eyebrow">Lectura destacada · Muestra editorial</span><h3>Vivir más.<br />¿Estamos listos?</h3><p>Más años de vida abren preguntas sobre lo que queremos hacer con ellos. Exploramos tres territorios donde la longevidad ya está cambiando las reglas.</p><div className="research-topics">{research.map(item => <button onClick={showResearch} key={item.number} aria-label={`Leer sobre ${item.short.toLowerCase()}`}><span>{item.number}</span><span>{item.short}</span><ArrowUpRight size={17} /></button>)}</div><button className="text-link" onClick={showResearch}>Leer la exploración completa <IconArrow /></button><SiteLink className="text-link observatory-more" href="/observatorio">Explorar el Observatorio <IconArrow /></SiteLink></div><div className="research-stats"><div><strong>1 de cada 6</strong><p>personas en el mundo tendrá<br />60 años o más en 2030.</p></div><div><strong>2.100<span> M</span></strong><p>de personas de 60 años o más<br />en el mundo para 2050.</p></div><a className="source-note" href={site.source} target="_blank" rel="noreferrer">Proyecciones mundiales · OMS, 2025 <ArrowUpRight size={14} /></a></div></div><div className="research-photo"><img src="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado bajo luz natural" width="1500" height="1000" loading="lazy" /><span className="image-note">Imagen conceptual</span><div className="photo-caption"><span>Una sociedad más longeva.</span><strong>Muchas formas<br />de vivirla.</strong></div><button onClick={showResearch} className="round-arrow" aria-label="Leer Vivir más. ¿Estamos listos?"><IconArrow /></button></div></div>
      </section>

      <section className="ecosystem section-wrap" id="ecosistema">
        <div className="section-label"><span className="status-dot" /> Ecosistema Vasees <span className="section-index">04 / 07</span></div>
        <div className="section-heading"><h2>El futuro se<br />construye en red.</h2><p>Ideas que se encuentran.<br />Experiencias que se comparten.<br />Una mirada que sigue creciendo.</p></div>
        <div className="ecosystem-grid">{initiatives.map((item, index) => <article className={`initiative ${item.className}`} key={item.name}><div className="initiative-top"><span className="eyebrow">{item.label}</span>{index === 1 ? <Sparkle size={30} weight="light" /> : <ArrowUpRight size={28} />}</div><h3>{item.name}</h3><h4>{item.title}</h4><p>{item.text}</p><SiteLink className="initiative-action" href={['/ecosistema/kanna', '/la-chispa', '/escuela'][index]}><span>{item.status}</span><span className="small-round"><IconArrow /></span></SiteLink></article>)}</div>
      </section>

      <section className="diagnostic section-wrap" id="diagnostico"><div><p className="eyebrow"><GlobeHemisphereWest size={17} /> Un punto de partida</p><h2>¿Qué tan preparado<br />está tu presente<br />para el futuro?</h2></div><div className="diagnostic-right"><span className="tag">Diagnóstico de futuro</span><p>Tus públicos cambian.<br />Tus equipos también.<br />¿Y tu organización?</p><button className="button button-dark" onClick={() => setDiagnostic(true)}>Abre la conversación <IconArrow /></button><span className="fine-print">3 preguntas para explorar tu reto. Sin registro.</span></div></section>

      <section className="faq section-wrap" id="preguntas">
        <div className="section-label"><span className="status-dot" /> Para conocernos mejor <span className="section-index">05 / 07</span></div>
        <div className="faq-layout"><div><h2>Las buenas ideas<br />empiezan con<br />una pregunta.</h2><p>Algunas respuestas para<br />dar el siguiente paso.</p><a className="text-link" href="#contacto">¿Tienes otra pregunta? <IconArrow /></a></div><div className="faq-container"><div className="faq-tabs" role="tablist" aria-label="Categorías de preguntas">{Object.keys(faqGroups).map(group => <button key={group} id={`tab-${group.replaceAll(' ', '-')}`} role="tab" tabIndex={faqGroup === group ? 0 : -1} onKeyDown={event => {
            const groups = Object.keys(faqGroups) as (keyof typeof faqGroups)[];
            let index = groups.indexOf(faqGroup);
            if (event.key === 'ArrowRight') index = (index + 1) % groups.length;
            else if (event.key === 'ArrowLeft') index = (index - 1 + groups.length) % groups.length;
            else if (event.key === 'Home') index = 0;
            else if (event.key === 'End') index = groups.length - 1;
            else return;
            event.preventDefault(); setFaqGroup(groups[index]); setOpenFaq(0);
            document.getElementById(`tab-${groups[index].replaceAll(' ', '-')}`)?.focus();
          }} aria-selected={faqGroup === group} aria-controls="faq-panel" onClick={() => { setFaqGroup(group as keyof typeof faqGroups); setOpenFaq(0); }}>{group}</button>)}</div><div id="faq-panel" role="tabpanel" aria-labelledby={`tab-${faqGroup.replaceAll(' ', '-')}`}>{faqGroups[faqGroup].map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><h3><button aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<span>{openFaq === index ? <Minus size={17} /> : <Plus size={17} />}</span></button></h3><div className="faq-answer" id={`faq-answer-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></div>)}</div></div></div>
      </section>

      <section className="insights section-wrap" id="insights">
        <div className="section-label"><span className="status-dot" /> Ideas para seguir mirando <span className="section-index">06 / 07</span></div>
        <div className="insights-layout"><div className="insights-intro"><span className="eyebrow">Insights</span><h2>El futuro<br />también <br />se lee.</h2><p>Perspectivas sobre longevidad,<br />cultura y las posibilidades<br />de una vida más larga.</p><a className="button button-dark" href={mail('Quiero conocer El Futuro tiene Canas')}>Sigamos conectados <IconArrow /></a></div><button className="newsletter-card" onClick={() => setModal({ eyebrow: 'Insights · Newsletter Vasees', title: site.newsletter, image: '/images/editorial.webp', body: <><p className="dialog-intro">El futuro no tiene una sola edad.</p><p>Una mirada a las transformaciones que trae vivir más: las culturas que construimos, las tecnologías que usamos y las historias que todavía nos quedan por contar.</p><p className="source-note">El acceso al newsletter está en preparación. Puedes consultarnos por correo; este sitio no registra suscripciones ni almacena tus datos.</p></>, subject: 'Quiero leer El Futuro tiene Canas' })}><img src="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado y flores en primer plano" width="1500" height="1000" loading="lazy" /><span className="tag">El newsletter de Vasees</span><div className="newsletter-copy"><span>Una mirada distinta a la longevidad</span><h3>El Futuro<br />tiene Canas<span className="newsletter-period">.</span></h3><p>Ideas para una sociedad que vive más.<br />Y quiere vivir diferente.</p><span className="newsletter-bottom">Descubre el newsletter <span className="small-round"><IconArrow /></span></span></div></button></div>
      </section>

      <Contact />
      <section className="closing"><p className="eyebrow">Future proof. Human first.</p><h2>Más años.<br /><span>Más futuro.</span></h2><a className="round-arrow" href="#inicio" aria-label="Volver al inicio"><ArrowUpRight size={28} /></a></section>
    </main> : <InnerPage path={route} />}
    <footer className="footer"><div className="footer-top"><SiteLink className="footer-brand" href="/"><img src="/images/vasees-logo.png" alt="Vasees" width="170" height="58" /></SiteLink><p>Comunicación, cultura y tecnología<br />para una sociedad más longeva.</p><a href={mail('Hablemos del futuro')}>{site.email}<IconArrow /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Vasees</span><div><SiteLink href="/#soluciones">Soluciones</SiteLink><SiteLink href="/ecosistema">Ecosistema</SiteLink><SiteLink href="/observatorio">Observatorio</SiteLink><button onClick={() => setModal({ eyebrow: 'Información del sitio', title: 'Privacidad y contacto', body: <><p>Esta vista de revisión no almacena formularios, respuestas al diagnóstico ni suscripciones. Los botones de correo abren tu aplicación de correo para que revises y envíes el mensaje.</p><p>La política de tratamiento de datos y las integraciones de formularios se incorporarán antes de habilitar la recopilación de información.</p></> })}>Privacidad</button></div><span>Hecho para lo que viene.</span></div><p className="preview-note">Vista de diseño · Fotografías conceptuales generadas con IA. Nombres de organizaciones como referencia; logos oficiales pendientes.</p></footer>

    <dialog ref={dialog} className={`detail-dialog ${diagnostic ? 'diagnostic-dialog' : ''}`} aria-labelledby="dialog-title" onCancel={closeModal} onClick={event => { if (event.target === event.currentTarget) closeModal(); }}>
      <button className="dialog-close" aria-label="Cerrar ventana" onClick={closeModal}><X size={24} /></button>
      {diagnostic ? <Diagnostic onClose={closeModal} /> : modal && <>{modal.image && <img className="dialog-cover" src={modal.image} alt="Imagen conceptual" />}<div className="dialog-content"><p className="eyebrow">{modal.eyebrow}</p><h2 id="dialog-title">{modal.title}</h2>{modal.body}{modal.subject && <a className="button button-dark" href={mail(modal.subject)}>Conversemos por correo <IconArrow /></a>}</div></>}
    </dialog>
  </>;
}

function Contact() {
  const [error, setError] = useState('');
  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get('name')).trim();
    if (!name) { setError('Cuéntanos tu nombre para preparar el correo.'); return; }
    setError('');
    const body = `Hola, Vasees.\n\nSoy ${name}.\nCorreo de contacto: ${values.get('email')}\nOrganización: ${values.get('organization') || 'Por conversar'}\nMe interesa: ${values.get('interest')}\n\n${values.get('message') || 'Me gustaría explorar cómo podemos trabajar juntos.'}\n`;
    window.location.href = mail('Diseñemos el futuro · Hablemos', body);
  }
  return <section className="contact section-wrap" id="contacto"><div className="section-label"><span className="status-dot" /> Trabajemos juntos <span className="section-index">07 / 07</span></div><div className="contact-layout"><div><h2>¿Qué quieres<br />construir<br /><em>con Vasees?</em></h2><p>Cuéntanos qué está cambiando.<br />Empecemos por una conversación.</p><a className="contact-email" href={mail('Hablemos de mi organización')}>{site.email}<IconArrow /></a></div><form onSubmit={submit}><div className="form-row"><label>Tu nombre<input name="name" autoComplete="name" placeholder="¿Cómo te llamas?" required maxLength={100} /></label><label>Tu correo<input name="email" type="email" autoComplete="email" placeholder="nombre@organizacion.com" required maxLength={200} /></label></div><label>Organización<input name="organization" autoComplete="organization" placeholder="¿Desde dónde nos escribes?" maxLength={150} /></label><label>¿Qué te gustaría explorar?<select name="interest" defaultValue="Aún no lo sé"><option>Aún no lo sé</option><option>Studio · Marca y comunicación</option><option>Consulting · Cultura y generaciones</option><option>Tech · Tecnología y longevidad</option><option>Observatorio e investigación</option><option>Ecosistema Vasees</option></select></label><label>Cuéntanos un poco más <span className="optional">(opcional)</span><textarea name="message" placeholder="Una idea, un reto, una buena pregunta…" maxLength={600} rows={3} /></label>{error && <p role="alert">{error}</p>}<button className="button button-dark" type="submit">Preparar correo <IconArrow /></button><p className="form-note">Se abrirá tu aplicación de correo. Podrás revisar el mensaje antes de enviarlo. No guardamos tus datos aquí.</p></form></div></section>;
}

const diagnosticQuestions = [
  { title: '¿Dónde está cambiando tu organización?', text: 'Piensa en las personas y en sus distintas etapas de vida.', options: ['En nuestros públicos y nuestra marca', 'En nuestros equipos y su cultura', 'En los servicios y las experiencias que ofrecemos'] },
  { title: '¿Qué les gustaría comprender mejor?', text: 'No necesitas tener todas las respuestas para empezar.', options: ['Cómo conectar con personas de distintas edades', 'Cómo compartir experiencia y colaborar entre generaciones', 'Qué barreras encuentran las personas al usar nuestros servicios'] },
  { title: '¿En qué momento se encuentran?', text: 'Cada proceso tiene su propio punto de partida.', options: ['Queremos abrir la conversación', 'Tenemos un reto y queremos explorarlo', 'Tenemos una idea y queremos ponerla a prueba'] },
];

function Diagnostic({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const complete = step === diagnosticQuestions.length;
  const question = diagnosticQuestions[step];
  const recommendation = answers[0]?.includes('equipos') ? 'Vasees Consulting' : answers[0]?.includes('servicios') ? 'Vasees Tech' : 'Vasees Studio';
  return <div className="dialog-content diagnostic-content"><p className="eyebrow">Diagnóstico de futuro · {complete ? 'Tu punto de partida' : `0${step + 1} / 03`}</p><div className="step-indicator" aria-hidden="true">{[0, 1, 2].map(n => <span className={step >= n ? 'active' : ''} key={n} />)}</div><h2 id="dialog-title">{complete ? 'Ya tenemos una buena pregunta.' : question.title}</h2>{complete ? <><p className="dialog-intro">Podemos empezar por {recommendation} y explorar juntos el alcance.</p><div className="diagnostic-summary">{answers.map((answer, index) => <p key={answer}><span>0{index + 1}</span>{answer}</p>)}</div><p className="source-note">Este ejercicio es orientativo; no es una evaluación validada. Tus respuestas solo existen en esta ventana y no se guardan ni se envían.</p><a className="button button-dark" href={mail('Mi punto de partida · Diagnóstico de futuro', `Hola, Vasees. Me gustaría conversar sobre:\n\n${answers.join('\n')}\n\n¿Podemos explorar este reto?`)}>Lleva tu pregunta a Vasees <IconArrow /></a><button className="text-link diagnostic-restart" onClick={() => { setStep(0); setAnswers([]); }}>Volver a empezar <ArrowRight size={18} /></button></> : <><p>{question.text}</p><fieldset className="diagnostic-options"><legend className="sr-only">{question.title}</legend>{question.options.map(option => <label className={answers[step] === option ? 'selected' : ''} key={option}><input type="radio" name={`question-${step}`} value={option} checked={answers[step] === option} onChange={() => setAnswers(old => { const next = [...old]; next[step] = option; return next; })} /><span>{option}</span>{answers[step] === option && <Check size={20} />}</label>)}</fieldset><div className="diagnostic-actions"><button className="text-link" onClick={() => step ? setStep(step - 1) : onClose()}><ArrowLeft size={18} /> {step ? 'Atrás' : 'Salir'}</button><button className="button button-dark" disabled={!answers[step]} onClick={() => setStep(step + 1)}>{step === 2 ? 'Ver mi punto de partida' : 'Continuar'}<ArrowRight size={19} /></button></div></>}</div>;
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!;
  if (root.hasChildNodes()) hydrateRoot(root, <App />);
  else createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
}
