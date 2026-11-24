import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, BookOpen, MagnifyingGlass, X, Play, Plus, Minus } from '@phosphor-icons/react';
import { schoolRoutes, schoolAudience, type SchoolCourse } from './content/school';
import { schoolName } from './content/home';
import { SiteLink, navigate } from './navigation';
import { useDemo, type ManagedCourse } from './portal/demo-store';
import { hasAccess } from './content/membership';

const Arrow = () => <ArrowUpRight size={21} aria-hidden="true" />;
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function CourseCard({ course, onOpen }: { course: SchoolCourse; onOpen: (course: SchoolCourse, trigger: HTMLButtonElement) => void }) {
  return <article className="school-course-card">
    <div className="school-course-image"><button className="school-trailer-trigger" aria-label={`${course.trailer ? "Ver tráiler de muestra" : "Conocer curso"}: ${course.title} (próximamente)`} aria-haspopup="dialog" onClick={event => onOpen(course, event.currentTarget)}><img src={course.image} alt="" width="1200" height="675" loading="lazy" />{course.trailer && <span className="school-play-icon" aria-hidden="true"><Play size={25} weight="fill" /></span>}</button><span className="school-demo-tag">Próximamente · Muestra</span></div>
    <div className="school-course-copy"><p className="school-course-meta">{course.category}<span />{course.lessons.length} lecciones</p><h3><button aria-haspopup="dialog" onClick={event => onOpen(course, event.currentTarget)}>{course.title}</button></h3><p>{course.description}</p><div className="school-course-bottom"><span><BookOpen size={16} />Conocer el curso</span><Arrow /></div></div>
  </article>;
}

export function SchoolPage() {
  const store = useDemo();
  const schoolCourses = store.courses.filter(item => item.status === 'Publicado');
  const [route, setRoute] = useState<string | null>(null);
  const selectedRoute = schoolRoutes.find(item => item.id === route) ?? null;
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState<ManagedCourse | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const matchingCourses = schoolCourses.filter(item => (!selectedRoute || selectedRoute.categories.includes(item.category)) && normalize(`${item.title} ${item.description} ${item.category}`).includes(normalize(query.trim())));

  useEffect(() => {
    if (course) {
      dialog.current?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.current?.close();
      document.body.style.overflow = '';
      trigger.current?.focus({ preventScroll: true });
    }
    return () => { document.body.style.overflow = ''; };
  }, [course]);

  function openCourse(item: SchoolCourse, element: HTMLButtonElement) {
    trigger.current = element;
    setCourse(store.courses.find(course => course.id === item.id) ?? null);
  }
  function closeCourse() { setCourse(null); }
  function startCourse() {
    if (!course) return;
    store.setSelectedCourse(course.id);
    // Courses are included in the membership: signed-in members go straight to the classroom.
    if (store.session) {
      if (!hasAccess(store.membership)) { navigate('/escuela/membresia'); return; }
      store.setEnrolled(old => [...new Set([...old, course.id])]);
      navigate('/escuela/aula');
    } else {
      store.setAuthDestination('/escuela/aula');
      navigate('/escuela/ingresar');
    }
  }
  return <>
    <section className="school-landing-hero" aria-labelledby="school-title">
      <div className="school-hero-copy"><div className="school-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><span>Escuela</span></div><div className="school-hero-message"><p className="school-hero-name">{schoolName}</p><h1 id="school-title" tabIndex={-1}>Aprender para vivir más y mejor, en cualquier etapa.</h1><p className="school-hero-description">Una escuela digital para entender el envejecimiento, cuidar y cuidarnos, relacionarnos entre generaciones y aprender herramientas que sirven en la vida cotidiana. Para ti, tu familia y quienes acompañas.</p><div className="school-audience"><h2>¿Para quién es?</h2><ul>{schoolAudience.map(item => <li key={item}>{item}</li>)}</ul></div><div className="school-hero-actions"><a className="button school-button-white" href="#intereses">Explora lo que puedes aprender<ArrowDown size={20} aria-hidden="true" /></a></div></div></div>
      <div className="school-hero-art"><img src="/images/school-mateo-melissa.webp" alt={`Mateo y Melissa, juntos en la ${schoolName} de Vasees`} width="1355" height="1161" fetchPriority="high" /></div>
    </section>

    <section className="school-interests school-wrap" id="intereses" aria-labelledby="interests-heading">
      <div className="school-section-heading"><div><h2 id="interests-heading">¿Qué quieres aprender?</h2><p>Elige una ruta. Puedes entrar por más de un interés.</p></div></div>
      <div className="school-routes" role="group" aria-label="Rutas de aprendizaje">{schoolRoutes.map(item => {
        const count = schoolCourses.filter(course => item.categories.includes(course.category)).length;
        return <button key={item.id} aria-pressed={route === item.id} onClick={() => setRoute(route === item.id ? null : item.id)}><strong>{item.title}</strong><span>{item.text}</span><span className="school-route-state">{count ? `${count} ${count === 1 ? 'curso de muestra' : 'cursos de muestra'}` : 'Próximamente'}</span></button>;
      })}</div>
      <div className="school-catalog-tools"><label className="school-search"><MagnifyingGlass size={20} aria-hidden="true" /><span className="sr-only">Buscar cursos</span><input type="search" placeholder="Busca un tema…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={17} /></button>}</label><p className="school-results" aria-live="polite">{selectedRoute ? `${selectedRoute.title}: ` : ''}{matchingCourses.length} {matchingCourses.length === 1 ? 'curso de muestra' : 'cursos de muestra'}</p></div>
      <p className="school-demo-note"><strong>Estado de los cursos:</strong> todos los cursos que ves son de muestra y están marcados como próximamente. Aún no hay cursos activos ni pilotos abiertos. Los avances visuales son de demostración y no tienen audio.</p>
      {matchingCourses.length ? <div className="school-catalog-grid" id="catalogo">{matchingCourses.map(item => <CourseCard key={item.id} course={item} onOpen={openCourse} />)}</div> : <div className="school-empty" id="catalogo"><BookOpen size={38} weight="light" aria-hidden="true" /><h3>{selectedRoute && !query ? 'Esta ruta llegará pronto.' : 'Sigamos buscando.'}</h3><p>{selectedRoute && !query ? 'Todavía no hay cursos de muestra en esta ruta. Puedes explorar las demás mientras tanto.' : 'No encontramos cursos con esa búsqueda. Prueba otra palabra o explora todas las rutas.'}</p><button className="button button-dark" onClick={() => { setRoute(null); setQuery(''); }}>Ver todos los cursos<ArrowRight size={18} /></button></div>}
    </section>

    <section className="school-proposal school-wrap" aria-labelledby="proposal-heading">
      <div><h2 id="proposal-heading">Conoce la propuesta educativa</h2><p>Estamos preparando la Escuela para abrir sus primeros cursos. Cuando la oferta esté definida, aquí explicaremos con claridad a quién está dirigida, qué incluye el acceso, cómo y por cuánto tiempo se estudia, el precio, la renovación, la cancelación y las devoluciones.</p><p>Hoy no hay membresías, inscripciones ni pagos abiertos. Mi Escuela es una demostración de cómo funcionará la plataforma: puedes recorrerla sin datos reales.</p><SiteLink className="text-link" href="/terminos-escuela">Términos del servicio educativo<ArrowRight size={18} aria-hidden="true" /></SiteLink></div>
      <ul className="school-approach-grid" aria-label="Cómo aprendemos">{[
        ['Aprender', 'Comprender lo que cambia al envejecer, más allá de los supuestos y de una sola forma de vivir.'],
        ['Conectar', 'Reconocer lo que cada generación puede enseñar, lo que necesita escuchar y lo que le gustaría conversar.'],
        ['Llevarlo a la vida', 'Salir con una pregunta, un ejercicio o una idea para una situación de tu vida cotidiana.'],
      ].map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ul>
    </section>

    <section className="school-faq school-wrap" id="escuela-preguntas" aria-labelledby="school-faq-heading"><div><h2 id="school-faq-heading">Preguntas frecuentes</h2></div><div>{[
      ['¿Qué se aprende?', 'Cinco rutas: tu propia longevidad, cuidado y autocuidado, familias y generaciones, tecnología y vida cotidiana, y propósito y nuevas oportunidades. Cada curso propone lecciones cortas y una reflexión para llevar a la práctica.'],
      ['¿Cómo se estudia?', 'En línea y a tu ritmo, desde Mi Escuela. Por ahora puedes recorrer una versión de demostración con cursos de muestra.'],
      ['¿Qué incluye el acceso?', 'Lo definiremos con la oferta de lanzamiento y lo publicaremos aquí antes de abrir inscripciones. No mostramos beneficios que todavía no existen.'],
      ['¿Cómo se compra o se cancela?', 'Todavía no hay compras ni membresías habilitadas. Las condiciones de pago, renovación, cancelación y devoluciones se publicarán en los términos del servicio educativo, con revisión jurídica, antes del lanzamiento.'],
    ].map(([question, answer]) => <details key={question}><summary>{question}<Plus className="school-faq-plus" size={19} aria-hidden="true" /><Minus className="school-faq-minus" size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

    <section className="school-closing"><h2>Hay mucho por vivir.<br /><em>Y mucho por aprender.</em></h2><a className="button school-button-white" href="#intereses">Explorar cursos<ArrowUpRight size={21} aria-hidden="true" /></a></section>

    <dialog className="school-course-dialog" ref={dialog} aria-labelledby="school-course-title" onCancel={closeCourse} onClick={event => { if (event.target === event.currentTarget) closeCourse(); }}>
      <button className="school-dialog-close" aria-label="Cerrar curso" onClick={closeCourse}><X size={23} /></button>
      {course && <><div className="school-trailer-player">{course.trailer ? <video key={course.id} controls playsInline preload="none" poster={course.image} aria-label={`Avance visual de muestra: ${course.title}`} aria-describedby="school-trailer-description"><source src={course.trailer} type="video/mp4" />{course.trailerCaptions && <track kind="captions" src={course.trailerCaptions} srcLang="es" label="Español" />}Tu navegador no puede reproducir este avance. Puedes leer su contenido a continuación.</video> : <div className="school-trailer-pending"><img src={course.image} alt={course.imageAlt} /><span>Avance en preparación</span></div>}</div><div className="school-dialog-body"><p className="eyebrow">{course.category} · {schoolName}</p><h2 id="school-course-title">{course.title}</h2><p className="school-dialog-description">{course.description}</p><p className="school-trailer-description" id="school-trailer-description">{course.trailer ? 'Avance visual de demostración, sin audio. Presenta el tema y el recorrido del curso.' : 'Conoce el recorrido de este curso de muestra. Su tráiler se incorporará más adelante.'}</p><div className="school-public-preview"><div><h3>Una primera mirada.</h3><ol>{course.lessons.map((item, index) => <li key={`${index}-${item.title}`}><span>0{index + 1}</span>{item.title}</li>)}</ol></div><aside><span>{course.lessons.length} lecciones de muestra</span><strong>Incluido en la membresía</strong><p>Entra a Mi Escuela para acceder al aula con una membresía de muestra.</p><button className="button button-dark" onClick={startCourse}>{store.session ? hasAccess(store.membership) ? 'Entrar al aula' : 'Ver planes de membresía' : 'Ingresar para continuar'}<ArrowRight size={18} /></button><span className="school-dialog-note">Cuenta, membresía y pagos de demostración.</span></aside></div></div></>}

    </dialog>
  </>;
}
