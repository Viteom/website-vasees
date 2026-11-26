import { useEffect, type ReactNode } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowDown } from '@phosphor-icons/react';
import { research, site, schoolName, initiativeConfig, organizations, observatory } from './content/home';
import { solutions, contactHref } from './content/solutions';
import { legalPages, LEGAL_REVIEW_REQUIRED, type LegalPage } from './content/legal';
import { SiteLink, navigate } from './navigation';
import { SchoolPage } from './school';
import { ChispaPage } from './chispa';

const Arrow = () => <ArrowUpRight size={21} aria-hidden="true" />;

/**
 * Full-screen inner hero, framed like the home hero: photograph behind, copy at the bottom left
 * and an optional card on the right. No breadcrumb, eyebrow or numbering above the title.
 */
function PageHero({ className, title, description, image, alt, imagePosition, actions, card }: { className: string; title: ReactNode; description: string; image: string; alt: string; imagePosition?: string; actions?: ReactNode; card?: ReactNode }) {
  return <section className={`page-hero ${className}`}>
    <img className="page-hero-image" src={image} alt={alt} fetchPriority="high" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
    <div className="page-hero-shade" aria-hidden="true" />
    <div className="page-hero-content">
      <div className="page-hero-copy"><h1 tabIndex={-1}>{title}</h1><p className="page-hero-description">{description}</p>{actions && <div className="page-hero-actions">{actions}</div>}</div>
      {card}
    </div>
  </section>;
}

/** Inner closings lead to the single contact form instead of opening another mail flow. */
function Closing({ title, text, cta = 'Hablemos de tu proyecto', href = '/?interes=explorar#contacto', tone = '' }: { title: string; text: string; cta?: string; href?: string; tone?: string }) {
  return <section className={`inner-closing ${tone}`}><h2>{title}</h2><div><p>{text}</p><SiteLink className="button button-lime" href={href}>{cta}<Arrow /></SiteLink></div></section>;
}

function Solutions() {
  return <>
    <PageHero className="page-hero-solutions" title="Tres soluciones. Un mismo propósito: preparar a tu organización para lo que viene."
      description="Hacemos marcas y campañas, construimos cultura organizacional y desarrollamos software para los retos de una sociedad más longeva."
      image="/images/hero.webp" alt="Tres personas de distintas generaciones revisan planos alrededor de una mesa, en un invernadero"
      actions={<nav className="anchor-nav" aria-label="Soluciones en esta página">{solutions.map(item => <SiteLink key={item.id} href={`#${item.anchor}`}>{item.area}<ArrowDown size={18} aria-hidden="true" /></SiteLink>)}</nav>} />
    {solutions.map(item => <section className={`solution-detail solution-detail-${item.id} section-wrap`} id={item.anchor} key={item.id} aria-labelledby={`${item.anchor}-heading`}>
      <div className="solution-detail-intro">
        <p className="solution-name">{item.name} · {item.area}</p>
        <p className="solution-question">{item.question}</p>
        <h2 id={`${item.anchor}-heading`}>{item.heading}</h2>
        <p>{item.body}</p>
      </div>
      <img className="solution-detail-image" src={item.image} alt={item.alt} width="1200" height="900" loading="lazy" />
      <div className="solution-detail-services"><h3>Qué hacemos</h3><dl>{item.groups.map(([title, text]) => <div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl></div>
      <div className="solution-detail-facts">
        <div><h3>Cuándo contratarla</h3><blockquote>«{item.challenge}»</blockquote></div>
        <div><h3>Qué recibes</h3><p>{item.receives}</p></div>
        <div><h3>Experiencia</h3><p>{item.experience}</p></div>
        <SiteLink className="button button-dark" href={contactHref(item.id)}>{item.cta}<Arrow /></SiteLink>
      </div>
    </section>)}
    <Closing title="Algunos retos necesitan marca. Otros, cultura o tecnología. Y hay proyectos que requieren las tres." text="Comencemos por entender el problema." />
  </>;
}

function Ecosystem() {
  const platforms = initiativeConfig.filter(item => item.publicEnabled && item.kind === 'plataforma');
  return <>
    <PageHero className="page-hero-ecosystem" title="El futuro se construye en red."
      description="Vasees integra servicios, conocimiento, educación y proyectos que comparten una mirada: diseñar mejores posibilidades en una sociedad más longeva."
      image="/images/studio.webp" alt="Piezas de papel coral, un libro abierto con ilustraciones lilas y una rama florecida, en un estudio iluminado por el sol" imagePosition="center 60%"
      actions={<SiteLink className="button button-lime" href="#mapa">Cómo se organiza Vasees<ArrowDown size={20} aria-hidden="true" /></SiteLink>} />

    <section className="ecosystem-map section-wrap" id="mapa" aria-labelledby="map-heading">
      <h2 id="map-heading">Cómo se organiza Vasees</h2>
      <p className="map-question">Distintas capacidades. Una misma pregunta: ¿cómo diseñamos mejores formas de vivir, trabajar y conectar en una sociedad más longeva?</p>
      <div className="map-diagram">
        <div className="map-core"><img src="/images/vasees-logo.png" alt="Vasees" width="170" height="58" /><p>La marca que reúne el ecosistema</p></div>
        <div className="map-level">
          <h3>Soluciones que puedes contratar</h3>
          <ul>{solutions.map(item => <li key={item.id}><SiteLink href={`/soluciones#${item.anchor}`}><strong>{item.name}</strong><span>{item.area}</span></SiteLink></li>)}</ul>
        </div>
        <div className="map-level map-level-platforms">
          <h3>Conocimiento, educación y conversación</h3>
          <ul>{platforms.map(item => <li key={item.slug}><SiteLink href={item.route}><strong>{item.displayName}</strong><span>{item.description}</span></SiteLink></li>)}</ul>
        </div>
        <div className="map-axis" id="transversal">
          <h3>Eje transversal: impacto, aprendizaje y alianzas</h3>
          <p>El impacto es un resultado que medimos en todas las líneas. No es una entidad constituida: la creación de una corporación o fundación es una posibilidad a futuro.</p>
        </div>
      </div>
    </section>

    <section className="ecosystem-relations section-wrap" aria-labelledby="relations-heading">
      <h2 id="relations-heading">Cómo conversan las partes</h2>
      <p>Este es el modelo hacia el que estamos creciendo. Algunas conexiones ya ocurren en nuestros proyectos; otras las estamos construyendo.</p>
      <ol>
        <li><strong>Observatorio → Consulting y Tech.</strong> Un hallazgo de investigación ayuda a diseñar un programa de cultura o a rediseñar un servicio.</li>
        <li><strong>Consulting ↔ Studio.</strong> La estrategia con personas y equipos se convierte en mensajes, marca y comunicación.</li>
        <li><strong>Tech.</strong> Desarrolla la herramienta cuando la solución es digital.</li>
        <li><strong>Escuela y La Chispa.</strong> La Escuela convierte aprendizajes en experiencias educativas; La Chispa los lleva a conversaciones públicas.</li>
        <li><strong>De vuelta al Observatorio.</strong> Los resultados de todas las líneas alimentan la siguiente pregunta de investigación.</li>
      </ol>
    </section>

    <section className="ecosystem-doors section-wrap" aria-labelledby="doors-heading">
      <h2 id="doors-heading">¿Cómo participar?</h2>
      <ul>
        <li><SiteLink href="/soluciones"><span className="door-who">Para organizaciones</span><strong>Quiero contratar una solución</strong><span>Marca, cultura organizacional o desarrollo de software.</span><Arrow /></SiteLink></li>
        <li><SiteLink href="/escuela"><span className="door-who">Para personas, familias y personas cuidadoras</span><strong>Quiero aprender</strong><span>Conoce la propuesta de la {schoolName}.</span><Arrow /></SiteLink></li>
        <li><SiteLink href="/observatorio"><span className="door-who">Para aliados e investigadores</span><strong>Quiero colaborar o investigar</strong><span>Comparte una pregunta, una fuente o una experiencia con el Observatorio.</span><Arrow /></SiteLink></li>
        <li><SiteLink href="/la-chispa"><span className="door-who">Para lectores, oyentes y creadores</span><strong>Quiero conocer historias y contenidos</strong><span>Podcast, revista y campañas de La Chispa.</span><Arrow /></SiteLink></li>
      </ul>
    </section>

    <section className="ecosystem-organizations section-wrap" aria-labelledby="orgs-heading">
      <h2 id="orgs-heading">Organizaciones con las que colaboramos</h2>
      <p>Son relaciones externas: clientes y aliados, no empresas de Vasees.</p>
      <ul>{organizations.map(item => <li key={item.name}><strong>{item.name}</strong><span>{item.relation === 'cliente' ? 'Cliente' : 'Relación por confirmar'}</span></li>)}</ul>
      <p className="source-note">Logos oficiales y permisos de uso pendientes. Mostramos solo nombres hasta contar con autorización.</p>
    </section>

    <Closing title="¿Dónde podrían encontrarse nuestras miradas?" text="Cuéntanos qué estás construyendo y qué conexión te gustaría explorar." />
  </>;
}

function Observatory() {
  return <>
    <PageHero className="page-hero-observatory" title={'Comprender para\nabrir posibilidades.'}
      description={`Vivir más transforma el trabajo, el cuidado y las relaciones entre generaciones. Reunimos preguntas, fuentes y experiencias para explorar qué significan esos cambios. El ${observatory.name} está en preparación.`}
      image="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado bajo luz natural" imagePosition="62% center"
      actions={<SiteLink className="button button-lime" href="#lineas">Ver las preguntas<ArrowDown size={20} aria-hidden="true" /></SiteLink>}
      card={<SiteLink className="page-hero-card" href="/observatorio/vivir-mas"><span className="page-hero-card-tag">Exploración editorial de muestra</span><strong>Vivir más. ¿Estamos listos?</strong><span className="page-hero-card-text">Tres puntos de partida sobre trabajo, cuidado y diseño de servicios.</span><span className="page-hero-card-link">Leer la exploración<Arrow /></span></SiteLink>} />
    <section className="research-lines section-wrap" id="lineas"><div className="section-heading"><h2>Una vida más larga.<br />Nuevas preguntas.</h2></div><div>{research.map(item => <SiteLink href="/observatorio/vivir-mas" key={item.number}><h3>{item.short}</h3><p>{item.text.split('?')[0]}{item.text.includes('?') ? '?' : ''}</p><Arrow /></SiteLink>)}</div></section>
    <section className="observatory-library section-wrap" id="lecturas"><div className="library-row"><div><span className="tag">Exploración editorial</span><h2>Vivir más.<br />¿Estamos listos?</h2><p>Tres puntos de partida sobre trayectorias laborales, redes de cuidado y diseño de servicios.</p></div><div><span className="eyebrow">Una lectura para abrir la conversación</span><p>Una muestra del enfoque editorial del Observatorio. No es una investigación propia concluida.</p><SiteLink className="text-link" href="/observatorio/vivir-mas">Leer la exploración<Arrow /></SiteLink></div></div><a className="external-reading" href={site.source} target="_blank" rel="noreferrer"><span className="tag">Fuente externa · OMS</span><span>Envejecimiento y salud</span><span>Octubre de 2025</span><Arrow /></a><p className="source-note">Las investigaciones de Vasees y sus archivos se incorporarán cuando estén publicados. No hay descargas de informes disponibles en esta versión.</p></section>
    <section className="reading-context"><p className="eyebrow">Leer con contexto</p><h2>Una cifra necesita un año.<br />Una proyección,<br /><em>un horizonte.</em></h2><p>En cada lectura indicamos de dónde viene el dato y qué pregunta ayuda a explorar.</p></section>
    <Closing title={'¿Qué pregunta falta\nen esta conversación?'} text="Compártenos una pregunta, una experiencia o una fuente que pueda ampliar esta mirada." />
  </>;
}

function ResearchArticle() {
  return <article className="research-article"><PageHero className="page-hero-article" title={<>Vivir más.<br /><em>¿Estamos listos?</em></>}
      description="Más años de vida cambian las preguntas que hacemos sobre el trabajo, el cuidado y el diseño. Una exploración editorial de muestra con tres puntos de partida para conversar sobre esas decisiones."
      image="/images/editorial.webp" alt="Retrato conceptual de una mujer mirando hacia la luz" imagePosition="62% center"
      actions={<SiteLink className="button button-lime" href={`#lectura-${research[0].number}`}>Empezar a leer<ArrowDown size={20} aria-hidden="true" /></SiteLink>} /><div className="article-reading section-wrap"><aside><p className="eyebrow">En esta lectura</p>{research.map(item => <SiteLink href={`#lectura-${item.number}`} key={item.number}>{item.short}</SiteLink>)}<SiteLink href="#fuentes"><Arrow />Fuentes y contexto</SiteLink></aside><div className="article-body"><p className="article-lead">Vivir más no es solo añadir años. También nos invita a revisar qué hacemos con ellos y qué posibilidades ayudan a construir nuestras organizaciones.</p><p>El trabajo, las redes de cuidado y los servicios reúnen decisiones que tomamos hoy. Mirarlas desde la longevidad abre preguntas sobre las distintas trayectorias de las personas y los entornos que las acompañan.</p>{research.map(item => <section id={`lectura-${item.number}`} key={item.number}><h2>{item.title}</h2><p>{item.text}</p><blockquote>{item.number === '01' ? 'La experiencia no sigue una sola línea.' : item.number === '02' ? 'Una responsabilidad compartida necesita conversaciones compartidas.' : 'Diseñar empieza por observar, no por suponer.'}</blockquote></section>)}<section id="fuentes" className="article-sources"><span className="eyebrow">Fuentes y contexto</span><h2>Los datos también<br />necesitan una mirada.</h2><p>Según las proyecciones mundiales recogidas por la OMS, en 2030 una de cada seis personas tendrá 60 años o más. Para 2050, la población mundial de 60 años o más se proyecta en 2.100 millones.</p><a className="text-link" href={site.source} target="_blank" rel="noreferrer">OMS · Envejecimiento y salud (2025)<Arrow /></a><p className="source-note">Las cifras son proyecciones mundiales para población de 60 años o más. Los tres territorios anteriores son una reflexión editorial de muestra de Vasees, no resultados de investigación propia. No se ofrece un PDF de estudio.</p></section><SiteLink className="button button-dark" href="/observatorio"><ArrowLeft size={18} />Volver al Observatorio</SiteLink></div></div><Closing title={'El futuro se entiende\ncon más de una mirada.'} text="¿Qué cambia en tu organización cuando las personas viven más? Abramos esa pregunta." /></article>;
}


function Kanna() {
  return <>
    <PageHero className="page-hero-kanna" title={'Experiencia que abre\nposibilidades.'}
      description="Las trayectorias guardan conocimiento, capacidad y nuevas preguntas. Kánna, un producto propio en desarrollo, explora cómo reconocer el talento senior y conectarlo con oportunidades."
      image="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado" imagePosition="62% center"
      actions={<SiteLink className="button button-lime" href="/?interes=tech#contacto">Hablemos<Arrow /></SiteLink>} />
    <section className="inner-intro section-wrap"><div><h2>El talento no tiene<br />una sola<br /><em>etapa de vida.</em></h2><div><p className="lead">Queremos explorar lo que sigue siendo posible.</p><p>Kánna es una plataforma propia en desarrollo para talento senior. Partimos de la escucha y de las trayectorias de las personas para pensar cómo conectar experiencia y nuevas oportunidades.</p><p>Esta página presenta la iniciativa. No hay registro de perfiles, vacantes ni procesos de selección habilitados.</p><SiteLink href="/soluciones#tech" className="text-link">Conoce el enfoque de Vasees Tech<Arrow /></SiteLink></div></div></section>
    <Closing title={'¿Qué puede aportar\nuna nueva mirada?'} text="Si te interesa explorar talento senior desde tu organización o compartir una experiencia, conversemos." />
  </>;
}


function Legal({ page }: { page: LegalPage }) {
  return <article className="legal-page section-wrap">
    <div className="inner-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><span>Legal</span></div>
    <h1 tabIndex={-1}>{page.title}</h1>
    {LEGAL_REVIEW_REQUIRED && <p className="legal-status" role="note"><strong>Pendiente de revisión jurídica.</strong> Este documento todavía no tiene un texto aprobado y no debe leerse como una política vigente.</p>}
    <p className="legal-intro">{page.intro}</p>
    <section aria-labelledby="legal-facts"><h2 id="legal-facts">Lo que ocurre hoy en este sitio</h2><ul>{page.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></section>
    <section aria-labelledby="legal-index"><h2 id="legal-index">Contenido que tendrá el documento aprobado</h2><ol>{page.sections.map(section => <li key={section}>{section}</li>)}</ol></section>
    <p>Para cualquier consulta, escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    <nav className="legal-others" aria-label="Otros documentos legales"><h2>Otros documentos</h2><ul>{legalPages.filter(item => item.path !== page.path).map(item => <li key={item.path}><SiteLink href={item.path}>{item.title}<ArrowRight size={18} aria-hidden="true" /></SiteLink></li>)}</ul></nav>
  </article>;
}

// Old service URLs keep working: the host redirects them (vercel.json) and the app does the same for in-app or static visits.
export const movedRoutes: Record<string, string> = { '/studio': '/soluciones#marca', '/consulting': '/soluciones#cultura', '/tech': '/soluciones#tech' };

function Moved({ to }: { to: string }) {
  useEffect(() => {
    // Child effects run before the router's own listener is attached, so wait a task before announcing the new URL.
    const timer = window.setTimeout(() => {
      window.history.replaceState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.setTimeout(() => document.getElementById(to.split('#')[1])?.scrollIntoView({ behavior: 'auto' }), 50);
    });
    return () => window.clearTimeout(timer);
  }, [to]);
  return <section className="not-found section-wrap"><h1 tabIndex={-1}>Esta página ahora vive en Soluciones.</h1><p>Te llevamos a la nueva sección.</p><SiteLink className="button button-dark" href={to}>Ir a Soluciones<ArrowRight size={18} /></SiteLink></section>;
}

export function InnerPage({ path, onNewsletter }: { path: string; onNewsletter: () => void }) {
  const legal = legalPages.find(page => page.path === path);
  const pages: Record<string, () => ReactNode> = {
    '/soluciones': Solutions, '/ecosistema': Ecosystem, '/observatorio': Observatory,
    '/observatorio/vivir-mas': ResearchArticle, '/escuela': SchoolPage,
    '/ecosistema/kanna': Kanna, '/la-chispa': () => <ChispaPage onNewsletter={onNewsletter} />,
  };
  const Page = pages[path];
  const content = legal ? <Legal page={legal} /> : movedRoutes[path] ? <Moved to={movedRoutes[path]} /> : Page ? <Page /> : <section className="not-found section-wrap"><p className="eyebrow">404 · Una nueva dirección</p><h1 tabIndex={-1}>Este camino<br />todavía no existe.</h1><p>Podemos volver al inicio y encontrar otra forma de seguir explorando.</p><SiteLink className="button button-dark" href="/">Volver a Vasees<ArrowRight size={18} /></SiteLink></section>;
  const withHero = !legal && !movedRoutes[path] && Boolean(Page);
  return <main id="contenido" className={`inner-page page-${legal ? 'legal' : path.split('/').filter(Boolean).join('-')}${withHero ? ' with-hero' : ''}`} key={path}>{content}</main>;
}
