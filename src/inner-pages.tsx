import { useState, type ReactNode } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, Plus, Minus, Sparkle, Check } from '@phosphor-icons/react';
import { services, initiatives, research, site } from './content/home';
import { collaborationTopics, connections, learningTopics } from './content/pages';
import { SiteLink } from './navigation';

const Arrow = () => <ArrowUpRight size={21} aria-hidden="true" />;
const email = (subject: string) => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

function Chapter({ label, number }: { label: string; number?: string }) {
  return <div className="section-label"><span className="status-dot" />{label}{number && <span className="section-index">{number}</span>}</div>;
}

function Hero({ category, title, description, image, alt, cta, subject, tone = '', status }: { category: string; title: string; description: string; image: string; alt: string; cta: string; subject: string; tone?: string; status?: string }) {
  return <section className={`inner-hero ${tone}`}>
    <div className="inner-hero-copy"><div className="inner-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><span>{category}</span></div><div className="inner-title-block"><p className="eyebrow">{category}{status && <span className="inner-status">{status}</span>}</p><h1 tabIndex={-1}>{title}</h1><p>{description}</p><a className="button button-dark" href={email(subject)}>{cta}<Arrow /></a></div><span className="inner-hero-signature">Más años. Más futuro.</span></div>
    <div className="inner-hero-image"><img src={image} alt={alt} fetchPriority="high" /><span className="image-note">Imagen conceptual</span></div>
  </section>;
}

function Closing({ title, text, cta, subject, tone = '' }: { title: string; text: string; cta: string; subject: string; tone?: string }) {
  return <section className={`inner-closing ${tone}`}><p className="eyebrow">El siguiente paso empieza contigo</p><h2>{title}</h2><div><p>{text}</p><a className="button button-lime" href={email(subject)}>{cta}<Arrow /></a></div></section>;
}

function FAQ({ items }: { items: string[][] }) {
  return <section className="inner-faq section-wrap"><Chapter label="Un poco más de claridad" /><div><h2>Antes de dar<br />el siguiente paso.</h2><div>{items.map(([question, answer]) => <details key={question}><summary>{question}<span className="faq-plus"><Plus size={18} /></span><span className="faq-minus"><Minus size={18} /></span></summary><p>{answer}</p></details>)}</div></div></section>;
}

function RelatedServices({ current }: { current: string }) {
  return <section className="inner-related section-wrap"><Chapter label="Una mirada que conecta" /><div>{services.filter(s => s.id !== current).map(s => <SiteLink key={s.id} href={`/${s.id}`}><span className="eyebrow">{s.name}</span><h3>{s.title.replace('\n', ' ')}</h3><Arrow /></SiteLink>)}</div></section>;
}

function Studio() {
  return <>
    <Hero category="Vasees Studio" title={'Lo que eres.\nLo que proyectas.'} description="Diseñamos marcas y comunicaciones que conectan con distintas formas de vivir y envejecer. De lo que aprendemos sobre las personas a decisiones de identidad, lenguaje y comunicación." image="/images/studio.webp" alt="Composición conceptual de materiales editoriales en tonos coral, lila y marfil" cta="Conversemos sobre tu marca" subject="Vasees Studio" tone="studio-hero" />
    <section className="inner-intro section-wrap"><Chapter label="La pregunta que abre el proyecto" number="01 / Studio" /><div><h2>¿A quién está<br />dejando por fuera<br /><em>tu comunicación?</em></h2><div><p className="lead">Representar a las personas también es una decisión de marca.</p><p>Cuando tu organización cambia de públicos, amplía sus servicios o revisa cómo representa la edad, vale la pena mirar qué historias cuenta, qué palabras usa y quién aparece en sus imágenes.</p><p>Esas decisiones afectan quién se reconoce en la marca y cómo entiende lo que ofrece.</p></div></div></section>
    <section className="inner-capabilities section-wrap"><Chapter label="De la esencia a la expresión" number="02 / Studio" /><div className="inner-capability-grid">{[
      ['01', 'Estrategia de marca', 'Definimos qué lugar quiere ocupar tu marca, a quién quiere llegar y qué promesa puede sostener.', ['Posicionamiento', 'Arquitectura de marca', 'Representación']],
      ['02', 'Identidad visual y verbal', 'Llevamos esa dirección a un sistema de diseño, imágenes, mensajes y tono que tu equipo pueda aplicar.', ['Sistema visual', 'Tono de voz', 'Guías de marca']],
      ['03', 'Comunicación y contenidos', 'Diseñamos campañas y contenidos para conversaciones concretas con tus públicos o con tus equipos.', ['Comunicación interna', 'Contenidos', 'Campañas']],
    ].map(([num, title, text, tags]) => <article key={String(num)}><span className="eyebrow">{num}</span><h3>{title}</h3><p>{text}</p><div className="inner-chips">{(tags as string[]).map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div></section>
    <section className="inner-process section-wrap"><Chapter label="Cómo trabajamos" number="03 / Studio" /><div className="inner-process-layout"><h2>De la escucha<br />a las decisiones.</h2><div>{[['Escuchar', 'Comprendemos el contexto y revisamos cómo se comunica hoy la organización.'], ['Dar dirección', 'Acordamos qué necesita cambiar, con quién necesitamos conectar y qué queremos lograr.'], ['Hacerlo visible', 'Desarrollamos las expresiones y herramientas que requiere el proyecto.']].map(([title, text], i) => <div key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></section>
    <section className="inner-project section-wrap"><div className="inner-project-visual"><img src="/images/studio.webp" alt="Imagen conceptual de diseño editorial; no representa piezas del cliente" loading="lazy" /><span className="image-note">Imagen conceptual · No es un caso visual</span></div><div><p className="eyebrow">Experiencia relacionada</p><h2>Fundación Provida Colombia.</h2><span className="tag">Marca y comunicación</span><p>El trabajo de Vasees en marca y comunicación para una organización dedicada a las personas mayores conecta propósito, lenguaje y experiencia.</p><p className="source-note">Las aplicaciones visuales y los resultados del caso se incorporarán cuando haya material aprobado para su publicación.</p><a className="text-link" href={email('Quiero conocer la experiencia de Studio')}>Conversemos sobre esta experiencia<Arrow /></a></div></section>
    <FAQ items={[
      ['¿Podemos trabajar con Studio si ya tenemos una marca?', 'Podemos partir de una necesidad puntual o revisar el sistema existente según el reto. No todos los proyectos necesitan empezar de cero.'],
      ['¿Pueden trabajar comunicación interna?', 'Sí. Cuando la necesidad incluye talleres, colaboración o cambios en la cultura del equipo, podemos combinar el alcance con Vasees Consulting.'],
    ]} />
    <Closing title={'¿Qué necesita contar\nmejor tu organización?'} text="Cuéntanos qué cambió, con quién quieres conversar y dónde encuentras la dificultad." cta="Conversemos sobre tu marca" subject="Vasees Studio" />
    <RelatedServices current="studio" />
  </>;
}

function Consulting() {
  return <>
    <Hero category="Vasees Consulting" title={'Generaciones distintas.\nUn propósito común.'} description="Diseñamos talleres y experiencias para organizaciones que quieren responder a lo que cambia cuando vivimos y trabajamos durante más años." image="/images/consulting.webp" alt="Escena conceptual de personas de distintas generaciones compartiendo ideas" cta="Conversemos sobre tu equipo" subject="Vasees Consulting" tone="consulting-hero" />
    <section className="consulting-topics section-wrap"><Chapter label="Conversaciones que mueven equipos" number="01 / Consulting" /><div><h2>¿Qué conversación<br />necesita tu equipo?</h2><div>{collaborationTopics.map(([title, text], i) => <details key={title} open={i === 0}><summary><span>0{i + 1}</span>{title}<Plus size={21} /></summary><p>{text}</p></details>)}</div></div></section>
    <section className="inner-quote"><p className="eyebrow">La edad no explica toda una experiencia.</p><h2>La experiencia suma.<br />La conexión <em>multiplica.</em></h2><p>Escuchar lo que cada persona sabe, necesita y quiere compartir es una forma de empezar.</p></section>
    <section className="inner-intro section-wrap"><Chapter label="Cómo se arma una experiencia" number="02 / Consulting" /><div><h2>Cada equipo necesita<br />un punto de<br /><em>partida propio.</em></h2><div><p className="lead">Primero escuchamos. Después diseñamos el encuentro.</p><p>Qué está pasando, quiénes participarían y qué espera la organización. A partir de esa conversación acordamos formato y alcance.</p><p>Según la experiencia, podemos proponer ejercicios, materiales y preguntas para continuar la conversación después del encuentro.</p><div className="inner-chips"><span>Escucha</span><span>Diseño de la experiencia</span><span>Continuidad</span></div></div></div></section>
    <section className="inner-project section-wrap"><div className="inner-project-visual"><img src="/images/editorial.webp" alt="Retrato conceptual; no corresponde a participantes de Rödea Care" loading="lazy" /><span className="image-note">Imagen conceptual</span></div><div><p className="eyebrow">Una mirada al cuidado</p><h2>Escuchar a<br />quienes cuidan.</h2><span className="tag">Experiencia relacionada · Rödea Care</span><p>La escucha de las personas cuidadoras orienta las preguntas, los materiales y las experiencias. Acompañar empieza por comprender su vida cotidiana.</p><p className="source-note">El caso documentado y sus imágenes se incorporarán con autorización. La descripción del producto y sus resultados corresponden a Rödea Care.</p></div></section>
    <FAQ items={[
      ['¿Los talleres son solo para personas mayores?', 'Los participantes se definen según el reto. Algunas experiencias se centran en una transición y otras reúnen distintas generaciones.'],
      ['¿Hay un formato fijo?', 'Acordamos participantes, formato, tiempos y seguimiento a partir de la necesidad. Cada equipo tiene un contexto propio.'],
      ['¿Y si busco aprendizaje individual o familiar?', 'La Escuela de Hijos y Nietos es la iniciativa de Vasees en preparación para aprender sobre cuidado, envejecimiento y relaciones entre generaciones.'],
    ]} />
    <Closing title={'¿Qué está pasando\nen tu equipo?'} text="Cuéntanos qué transición están viviendo o qué conversación les cuesta tener." cta="Conversemos sobre tu equipo" subject="Vasees Consulting" tone="lilac-closing" />
    <RelatedServices current="consulting" />
  </>;
}

function Tech() {
  return <>
    <Hero category="Vasees Tech" title={'Antes del código,\nlas personas.'} description="Exploramos soluciones digitales a medida para necesidades de una sociedad más longeva. Partimos de las personas y su contexto para comprender el problema, probar posibilidades y evaluar su viabilidad." image="/images/hero-flower.png" alt="Flor translúcida como exploración conceptual entre naturaleza y tecnología" cta="Comparte una necesidad" subject="Vasees Tech" tone="tech-hero" status="En desarrollo" />
    <section className="inner-intro section-wrap"><Chapter label="Una buena pregunta de uso" number="01 / Tech" /><div><h2>La tecnología<br />tiene sentido<br /><em>cuando conecta.</em></h2><div><p className="lead">¿A quién le cuesta acceder a este servicio? ¿En qué paso se pierde?</p><p>¿Qué herramienta ayudaría a coordinar mejor una tarea? Una pregunta de uso es el punto de partida para decidir qué vale la pena desarrollar.</p><p>Exploramos retos vinculados con longevidad. La solución y el alcance dependen de la necesidad y su viabilidad.</p></div></div></section>
    <section className="tech-steps section-wrap"><Chapter label="Nuestro enfoque en construcción" number="02 / Tech" /><div>{[['Comprender', 'Descubrimiento y necesidades', 'Escuchamos a las personas y observamos su contexto. El problema se define con quienes lo viven.'], ['Probar', 'Diseño y validación', 'Llevamos las preguntas a prototipos y experiencias que se puedan explorar con usuarios.'], ['Definir', 'Viabilidad y alcance', 'Evaluamos qué solución a medida tiene sentido y qué necesitaría para hacerse realidad.']].map(([title, label, text], i) => <article key={title}><span className="eyebrow">0{i + 1} / {label}</span><h3>{title}<span>.</span></h3><p>{text}</p></article>)}</div></section>
    <section className="kanna-feature section-wrap"><div><p className="eyebrow">Producto propio en desarrollo</p><h2>La experiencia<br />sigue abriendo<br />caminos.</h2><p>Exploramos cómo reconocer el talento senior y conectar trayectorias con nuevas oportunidades.</p><SiteLink href="/ecosistema/kanna" className="button button-lime">Conocer Kánna<Arrow /></SiteLink></div><div className="kanna-word"><span className="eyebrow">Talento que sigue creciendo</span><h3>Kánna</h3><span>Una iniciativa de Vasees.</span></div></section>
    <FAQ items={[
      ['¿Puedo proponer una idea?', 'Cuéntanos quién vive el problema, cómo se resuelve hoy y qué te gustaría explorar. El reto debe tener una relación concreta con longevidad.'],
      ['¿Ya puedo registrarme en Kánna?', 'Kánna está en desarrollo. Su página presenta el enfoque y permite abrir una conversación; el registro todavía no está habilitado.'],
    ]} />
    <Closing title={'Una necesidad real.\nMuchas posibilidades.'} text="Antes de decidir qué construir, comprendamos para quién y para qué." cta="Abramos esa conversación" subject="Una necesidad para Vasees Tech" />
    <RelatedServices current="tech" />
  </>;
}

function InitiativeCards() {
  return <div className="ecosystem-grid">{initiatives.map((item, i) => <article className={`initiative ${item.className}`} key={item.name}><div className="initiative-top"><span className="eyebrow">{item.label}</span><Arrow /></div><h3>{item.name}</h3><h4>{item.title}</h4><p>{item.text}</p><SiteLink className="initiative-action" href={['/ecosistema/kanna', '/la-chispa', '/escuela'][i]}><span>{item.status}</span><span className="small-round"><Arrow /></span></SiteLink></article>)}</div>;
}

function Ecosystem() {
  const [filter, setFilter] = useState('Todas');
  const shown = connections.filter(item => filter === 'Todas' || item.category === filter);
  return <>
    <Hero category="Ecosistema silver" title={'El futuro se\nconstruye en red.'} description="Conectamos organizaciones, conocimiento y personas para explorar las posibilidades de una sociedad más longeva. Cada conexión amplía nuestra mirada." image="/images/hero.webp" alt="Imagen conceptual de colaboración entre tres generaciones" cta="Propón una conversación" subject="Ecosistema silver" tone="ecosystem-hero" />
    <section className="ecosystem-perspectives section-wrap"><Chapter label="Tres miradas que se encuentran" /><div>{[['Organizaciones.', 'Sus equipos, marcas y servicios nos acercan a retos concretos.'], ['Conocimiento.', 'La escucha, la gerontología y las fuentes ayudan a entender qué está cambiando.'], ['Personas.', 'Sus experiencias y trayectorias ponen a prueba nuestras ideas sobre la edad.']].map(([title, text]) => <article key={title}><h2>{title}</h2><p>{text}</p></article>)}</div></section>
    <section className="connections section-wrap" id="marcas"><Chapter label="Las conexiones que amplían nuestra mirada" /><div className="section-heading"><h2>Distintos mundos.<br />Más posibilidades.</h2><p>Una red que nos acerca al cuidado,<br />el conocimiento y la vida de las organizaciones.</p></div><div className="connection-filters" role="group" aria-label="Filtrar conexiones">{['Todas', 'Comunidad', 'Cuidado', 'Organizaciones'].map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label}>{label}</button>)}</div><p className="sr-only" aria-live="polite">{shown.length} organizaciones</p><div className="connection-grid">{shown.map(item => <article key={item.name}><span className="eyebrow">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p></article>)}</div><p className="source-note">Identidades gráficas oficiales pendientes de incorporar. Las descripciones y permisos de uso se revisarán antes del lanzamiento.</p></section>
    <section className="inner-initiatives section-wrap"><Chapter label="Iniciativas de Vasees" /><div className="section-heading"><h2>Ideas que encuentran<br />su propio camino.</h2></div><InitiativeCards /></section>
    <div className="knowledge-links section-wrap"><SiteLink href="/observatorio"><span>Conocimiento que abre preguntas</span><strong>Explorar el Observatorio</strong><Arrow /></SiteLink><SiteLink href="/escuela"><span>Aprender a vivir más, juntos</span><strong>Conocer la Escuela</strong><Arrow /></SiteLink></div>
    <Closing title={'¿Dónde podrían encontrarse\nnuestras miradas?'} text="Cuéntanos qué estás construyendo y qué conexión te gustaría explorar." cta="Propón una conversación" subject="Ecosistema silver" />
  </>;
}

function Observatory() {
  return <>
    <section className="observatory-cover section-wrap"><div className="inner-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><span>Observatorio</span></div><div className="observatory-cover-heading"><div><p className="eyebrow">Observatorio de Envejecimiento y Vejez <span className="inner-status">En preparación</span></p><h1 tabIndex={-1}>Comprender para<br />abrir posibilidades.</h1></div><p>Vivir más transforma el trabajo, el cuidado y las relaciones entre generaciones. Reunimos preguntas, fuentes y experiencias para explorar qué significan esos cambios.</p></div><SiteLink className="observatory-cover-image" href="/observatorio/vivir-mas"><img src="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado bajo luz natural" fetchPriority="high" /><span className="tag">Exploración editorial de muestra</span><div><span>Lectura destacada</span><h2>Vivir más.<br />¿Estamos listos?</h2><span className="button button-lime">Leer la exploración<Arrow /></span></div><span className="image-note">Imagen conceptual</span></SiteLink></section>
    <section className="research-lines section-wrap" id="lineas"><Chapter label="Nuestras líneas de exploración" /><div className="section-heading"><h2>Una vida más larga.<br />Nuevas preguntas.</h2></div><div>{research.map(item => <SiteLink href="/observatorio/vivir-mas" key={item.number}><span className="eyebrow">{item.number} /</span><h3>{item.short}</h3><p>{item.text.split('?')[0]}{item.text.includes('?') ? '?' : ''}</p><Arrow /></SiteLink>)}</div></section>
    <section className="observatory-library section-wrap" id="lecturas"><Chapter label="Estudios y lecturas" /><div className="library-row"><div><span className="tag">Exploración editorial</span><h2>Vivir más.<br />¿Estamos listos?</h2><p>Tres puntos de partida sobre trayectorias laborales, redes de cuidado y diseño de servicios.</p></div><div><span className="eyebrow">Una lectura para abrir la conversación</span><p>Una muestra del enfoque editorial del Observatorio. No es una investigación propia concluida.</p><SiteLink className="text-link" href="/observatorio/vivir-mas">Leer la exploración<Arrow /></SiteLink></div></div><a className="external-reading" href={site.source} target="_blank" rel="noreferrer"><span className="tag">Fuente externa · OMS</span><span>Envejecimiento y salud</span><span>Octubre de 2025</span><Arrow /></a><p className="source-note">Las investigaciones de Vasees y sus archivos se incorporarán cuando estén publicados. No hay descargas de informes disponibles en esta versión.</p></section>
    <section className="reading-context"><p className="eyebrow">Leer con contexto</p><h2>Una cifra necesita un año.<br />Una proyección,<br /><em>un horizonte.</em></h2><p>En cada lectura indicamos de dónde viene el dato y qué pregunta ayuda a explorar.</p></section>
    <Closing title={'¿Qué pregunta falta\nen esta conversación?'} text="Compártenos una pregunta, una experiencia o una fuente que pueda ampliar esta mirada." cta="Compartir una pregunta" subject="Observatorio Vasees" />
  </>;
}

function ResearchArticle() {
  return <article className="research-article"><header className="article-heading section-wrap"><div className="inner-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><SiteLink href="/observatorio">Observatorio</SiteLink><span>/</span><span>Lectura destacada</span></div><p className="eyebrow">Exploración editorial de muestra · Tres miradas</p><h1 tabIndex={-1}>Vivir más.<br /><em>¿Estamos listos?</em></h1><p>Más años de vida cambian las preguntas que hacemos sobre el trabajo, el cuidado y el diseño. Tres puntos de partida para conversar sobre esas decisiones.</p><div className="article-cover"><img src="/images/editorial.webp" alt="Retrato conceptual de una mujer mirando hacia la luz" fetchPriority="high" /><span className="image-note">Imagen conceptual</span></div></header><div className="article-reading section-wrap"><aside><p className="eyebrow">En esta lectura</p>{research.map(item => <SiteLink href={`#lectura-${item.number}`} key={item.number}><span>{item.number}</span>{item.short}</SiteLink>)}<SiteLink href="#fuentes"><Arrow />Fuentes y contexto</SiteLink></aside><div className="article-body"><p className="article-lead">Vivir más no es solo añadir años. También nos invita a revisar qué hacemos con ellos y qué posibilidades ayudan a construir nuestras organizaciones.</p><p>El trabajo, las redes de cuidado y los servicios reúnen decisiones que tomamos hoy. Mirarlas desde la longevidad abre preguntas sobre las distintas trayectorias de las personas y los entornos que las acompañan.</p>{research.map(item => <section id={`lectura-${item.number}`} key={item.number}><span className="eyebrow">{item.number} / {item.short}</span><h2>{item.title}</h2><p>{item.text}</p><blockquote>{item.number === '01' ? 'La experiencia no sigue una sola línea.' : item.number === '02' ? 'Una responsabilidad compartida necesita conversaciones compartidas.' : 'Diseñar empieza por observar, no por suponer.'}</blockquote></section>)}<section id="fuentes" className="article-sources"><span className="eyebrow">Fuentes y contexto</span><h2>Los datos también<br />necesitan una mirada.</h2><p>Según las proyecciones mundiales recogidas por la OMS, en 2030 una de cada seis personas tendrá 60 años o más. Para 2050, la población mundial de 60 años o más se proyecta en 2.100 millones.</p><a className="text-link" href={site.source} target="_blank" rel="noreferrer">OMS · Envejecimiento y salud (2025)<Arrow /></a><p className="source-note">Las cifras son proyecciones mundiales para población de 60 años o más. Los tres territorios anteriores son una reflexión editorial de muestra de Vasees, no resultados de investigación propia. No se ofrece un PDF de estudio.</p></section><SiteLink className="button button-dark" href="/observatorio"><ArrowLeft size={18} />Volver al Observatorio</SiteLink></div></div><Closing title={'El futuro se entiende\ncon más de una mirada.'} text="¿Qué cambia en tu organización cuando las personas viven más? Abramos esa pregunta." cta="Conversemos sobre longevidad" subject="Una pregunta para el Observatorio" /></article>;
}

function School() {
  const [selected, setSelected] = useState(0);
  const current = learningTopics[selected];
  return <>
    <Hero category="Escuela de Hijos y Nietos" title={'Aprender a vivir\nmás, juntos.'} description="¿Cómo ofrecemos ayuda sin decidir por otra persona? ¿Cómo nos repartimos el cuidado? Un espacio en preparación para abrir conversaciones que a veces dejamos para después." image="/images/consulting.webp" alt="Imagen conceptual de dos generaciones compartiendo un aprendizaje" cta="Quiero conocer la Escuela" subject="Escuela de Hijos y Nietos" tone="school-hero" status="En preparación" />
    <section className="learning section-wrap" id="cursos"><Chapter label="Lo que estamos preparando" /><div className="section-heading"><h2>Aprendizajes para<br />la vida que compartimos.</h2><p>Propuestas editoriales en preparación.<br />Aún no hay cursos ni inscripciones abiertas.</p></div><div className="learning-grid">{learningTopics.map((topic, index) => <article key={topic.id}><img src={topic.image} alt="Imagen conceptual para ilustrar el tema de aprendizaje" loading="lazy" /><div><span className="eyebrow">{topic.category} · En preparación</span><h3>{topic.title}</h3><p>{topic.text}</p><button className="text-link" onClick={() => { setSelected(index); document.getElementById('enfoque')?.scrollIntoView({ behavior: 'auto' }); }}>Explorar este tema<Arrow /></button></div></article>)}</div></section>
    <section className="learning-focus section-wrap" id="enfoque"><Chapter label="Aprender · Conectar · Aplicar" /><div className="learning-tabs" role="group" aria-label="Temas de aprendizaje">{learningTopics.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} aria-pressed={selected === index}>{item.category}</button>)}</div><div className="learning-focus-content" aria-live="polite"><h2>{current.title}</h2><div><p className="lead">{current.text}</p><p>Comprender qué cambia al envejecer. Reconocer lo que cada generación puede enseñar. Llevar una pregunta o un ejercicio a una situación cotidiana.</p><span className="tag">Contenido en preparación</span></div></div></section>
    <FAQ items={[
      ['¿Quién puede aprender en la Escuela?', 'La propuesta se dirige a personas mayores, hijos, nietos y quienes quieren comprender el envejecimiento, el cuidado y las relaciones entre generaciones.'],
      ['¿Ya puedo crear una cuenta o inscribirme?', 'Todavía no. Los temas que ves son propuestas editoriales en preparación. El catálogo, las cuentas y las inscripciones se anunciarán cuando estén habilitados.'],
    ]} />
    <Closing title={'Hay conversaciones\nque nos acercan.'} text="Cuéntanos qué te gustaría aprender o qué pregunta no has encontrado dónde hacer." cta="Conversemos sobre la Escuela" subject="Escuela de Hijos y Nietos" tone="lilac-closing" />
  </>;
}

function Kanna() {
  return <>
    <Hero category="Ecosistema · Kánna" title={'La experiencia sigue\nabriendo caminos.'} description="Las trayectorias guardan conocimiento, capacidad y nuevas preguntas. Kánna explora cómo reconocer el talento senior y conectarlo con oportunidades." image="/images/editorial.webp" alt="Retrato conceptual de una mujer de cabello plateado" cta="Conversemos sobre Kánna" subject="Kánna · Talento senior" tone="kanna-hero" status="Producto propio en desarrollo" />
    <section className="inner-intro section-wrap"><Chapter label="Una iniciativa de Vasees" /><div><h2>El talento no tiene<br />una sola<br /><em>etapa de vida.</em></h2><div><p className="lead">Queremos explorar lo que sigue siendo posible.</p><p>Kánna es una plataforma propia en desarrollo para talento senior. Partimos de la escucha y de las trayectorias de las personas para pensar cómo conectar experiencia y nuevas oportunidades.</p><p>Esta página presenta la iniciativa. No hay registro de perfiles, vacantes ni procesos de selección habilitados.</p><SiteLink href="/tech" className="text-link">Conoce el enfoque de Vasees Tech<Arrow /></SiteLink></div></div></section>
    <Closing title={'¿Qué puede aportar\nuna nueva mirada?'} text="Si te interesa explorar talento senior desde tu organización o compartir una experiencia, conversemos." cta="Conectar con Vasees" subject="Kánna · Una nueva mirada al talento" />
  </>;
}

function Chispa() {
  return <>
    <Hero category="La Chispa" title={'Las historias también\ncambian el futuro.'} description="Conversaciones sobre vida, vejez, cultura y arte. Un proyecto editorial para cuestionar prejuicios y mirar de otra manera las posibilidades de una vida más larga." image="/images/editorial.webp" alt="Imagen conceptual de una mujer de cabello plateado entre flores y luz natural" cta="Conversemos sobre La Chispa" subject="La Chispa · Historias y conversaciones" tone="chispa-hero" status="Proyecto editorial" />
    <section className="inner-intro section-wrap"><Chapter label="Conversaciones que conectan" /><div><h2>Una historia puede<br />cambiar<br /><em>una pregunta.</em></h2><div><p className="lead">No hay una sola forma de vivir, crear o envejecer.</p><p>La Chispa reúne la mirada editorial de Vasees sobre las historias y conversaciones que amplían lo que imaginamos posible.</p><p>Los videos, entrevistas y canales se incorporarán cuando estén confirmados. Mientras tanto, puedes compartir una historia que te gustaría poner en conversación.</p></div></div></section>
    <section className="chispa-newsletter section-wrap"><div><Sparkle size={30} weight="light" /><p className="eyebrow">Insights · El newsletter de Vasees</p><h2>El Futuro<br />tiene Canas.</h2><p>Ideas sobre longevidad, cultura y las posibilidades de una vida más larga. Una conversación para seguir mirando lo que viene.</p><a className="button button-dark" href={email('Quiero leer El Futuro tiene Canas')}>Consultar el newsletter<Arrow /></a><span className="source-note">Acceso en preparación. La consulta abre tu correo; no registra una suscripción.</span></div><img src="/images/editorial.webp" alt="Retrato conceptual de una mujer mirando hacia la luz" loading="lazy" /></section>
    <Closing title={'¿Qué historia merece\nseguir conversándose?'} text="Una experiencia, una idea o una pregunta puede ser el comienzo." cta="Comparte tu mirada" subject="Una historia para La Chispa" />
  </>;
}

export function InnerPage({ path }: { path: string }) {
  const pages: Record<string, () => ReactNode> = {
    '/studio': Studio, '/consulting': Consulting, '/tech': Tech,
    '/ecosistema': Ecosystem, '/observatorio': Observatory,
    '/observatorio/vivir-mas': ResearchArticle, '/escuela': School,
    '/ecosistema/kanna': Kanna, '/la-chispa': Chispa,
  };
  const Page = pages[path];
  return <main id="contenido" className={`inner-page page-${path.split('/').filter(Boolean).join('-')}`} key={path}>{Page ? <Page /> : <section className="not-found section-wrap"><p className="eyebrow">404 · Una nueva dirección</p><h1 tabIndex={-1}>Este camino<br />todavía no existe.</h1><p>Podemos volver al inicio y encontrar otra forma de seguir explorando.</p><SiteLink className="button button-dark" href="/">Volver a Vasees<ArrowRight size={18} /></SiteLink></section>}</main>;
}
