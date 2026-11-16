import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, CaretLeft, CaretRight, BookOpen, MagnifyingGlass, X, Check, Plus, Minus } from '@phosphor-icons/react';
import { schoolCourses, schoolCategories, type SchoolCourse } from './content/school';
import { site } from './content/home';
import { SiteLink } from './navigation';

const Arrow = () => <ArrowUpRight size={21} aria-hidden="true" />;
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function CourseCard({ course, onOpen }: { course: SchoolCourse; onOpen: (course: SchoolCourse, trigger: HTMLButtonElement) => void }) {
  return <article className="school-course-card">
    <div className="school-course-image"><img src={course.image} alt={course.imageAlt} width="1200" height="675" loading="lazy" /><span className="school-demo-tag">Curso de muestra</span></div>
    <div className="school-course-copy"><p className="school-course-meta">{course.category}<span />{course.lessons.length} lecciones</p><h3><button aria-haspopup="dialog" onClick={event => onOpen(course, event.currentTarget)}>{course.title}</button></h3><p>{course.description}</p><div className="school-course-bottom"><span><BookOpen size={16} />Explorar curso</span><Arrow /></div></div>
  </article>;
}

function SliderControls({ slider }: { slider: RefObject<HTMLDivElement | null> }) {
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = slider.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft < 5, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 5 });
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, [slider]);
  function move(direction: number) {
    const element = slider.current;
    if (!element) return;
    const card = element.querySelector('article')?.getBoundingClientRect().width ?? 340;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * (card + 20), behavior: reduced ? 'instant' : 'smooth' });
  }
  return <div className="school-slider-controls"><button aria-label="Cursos anteriores" disabled={edges.start} onClick={() => move(-1)}><CaretLeft size={20} /></button><button aria-label="Cursos siguientes" disabled={edges.end} onClick={() => move(1)}><CaretRight size={20} /></button></div>;
}

export function SchoolPage() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState<SchoolCourse | null>(null);
  const [lesson, setLesson] = useState(0);
  const [read, setRead] = useState<number[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const slider = useRef<HTMLDivElement>(null);
  const matchingCourses = schoolCourses.filter(item => (category === 'Todos' || item.category === category) && normalize(`${item.title} ${item.description} ${item.category}`).includes(normalize(query.trim())));

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
    setLesson(0); setRead([]); setCourse(item);
  }
  function closeCourse() { setCourse(null); }
  function showCategory(value: string) {
    setCategory(value); setQuery('');
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'auto' });
  }

  return <>
    <section className="school-landing-hero" aria-labelledby="school-title">
      <div className="school-hero-copy"><div className="school-breadcrumb"><SiteLink href="/">Inicio</SiteLink><span>/</span><span>Escuela</span></div><div className="school-hero-message"><p className="eyebrow"><span className="status-dot" />Escuela de Hijos y Nietos</p><h1 id="school-title" tabIndex={-1}>Aprender a vivir<br />más, <em>juntos.</em></h1><p>Hay conversaciones que nos acercan.<br />Y aprendizajes que nos acompañan toda la vida.</p><p className="school-hero-description">Un espacio para explorar el cuidado, las relaciones entre generaciones y las posibilidades de una vida más larga.</p><div className="school-hero-actions"><a className="button school-button-white" href="#catalogo">Explora los cursos<Arrow /></a><a className="school-hero-secondary" href="#enfoque">Así aprendemos<ArrowRight size={18} /></a></div></div><p className="school-hero-signature">Más años. Más preguntas. Más por descubrir.</p></div>
      <div className="school-hero-art"><img src="/images/school-mateo-melissa.webp" alt="Mateo y Melissa, juntos en la Escuela de Hijos y Nietos de Vasees" width="1355" height="1161" fetchPriority="high" /><div className="school-presenter-caption"><span>Una invitación a aprender</span><strong>Mateo <span>&</span> Melissa</strong><p>Nos encontramos en las buenas preguntas.</p></div></div>
    </section>

    <nav className="school-local-nav school-wrap" aria-label="Dentro de la Escuela"><span>Una escuela para la vida.</span><div><a href="#catalogo">Nuestros cursos</a><a href="#enfoque">Nuestra mirada</a><a href="#escuela-preguntas">Preguntas frecuentes</a></div></nav>

    <section className="school-featured school-wrap" aria-labelledby="featured-heading"><div className="school-section-heading"><div><p className="eyebrow">Abre una nueva conversación</p><h2 id="featured-heading">Cursos para empezar.</h2></div><div className="school-featured-actions"><a className="text-link" href="#catalogo">Ver todos<Arrow /></a><SliderControls slider={slider} /></div></div><p className="school-demo-note">Una primera mirada a la Escuela: los cursos y las lecciones de este catálogo son de demostración.</p><div className="school-featured-row" ref={slider}>{schoolCourses.slice(0, 4).map(item => <CourseCard key={item.id} course={item} onOpen={openCourse} />)}</div></section>

    <section className="school-manifesto" id="enfoque"><div className="school-wrap"><p className="eyebrow">Aprender · Conectar · Aplicar</p><h2>Nadie tiene todas las respuestas.<br /><em>Podemos buscarlas juntos.</em></h2><div className="school-approach-grid">{[
      ['01', 'Aprender.', 'Comprender lo que cambia al envejecer, más allá de los supuestos y de una sola forma de vivir.'],
      ['02', 'Conectar.', 'Reconocer lo que cada generación puede enseñar, lo que necesita escuchar y lo que le gustaría conversar.'],
      ['03', 'Llevarlo a la vida.', 'Salir con una pregunta, un ejercicio o una idea para una situación de tu vida cotidiana.'],
    ].map(([num, title, text]) => <article key={num}><span>{num} /</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="school-catalog school-wrap" id="catalogo" aria-labelledby="catalog-heading"><div className="school-section-heading"><div><p className="eyebrow">A tu ritmo. Desde tu curiosidad.</p><h2 id="catalog-heading">¿Qué quieres<br />aprender hoy?</h2></div><label className="school-search"><MagnifyingGlass size={20} /><span className="sr-only">Buscar cursos</span><input type="search" placeholder="Busca una buena pregunta…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={17} /></button>}</label></div><div className="school-categories" role="group" aria-label="Categorías de cursos">{schoolCategories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><p className="school-results" aria-live="polite">{matchingCourses.length} {matchingCourses.length === 1 ? 'curso de muestra' : 'cursos de muestra'}</p>{matchingCourses.length ? <div className="school-catalog-grid">{matchingCourses.map(item => <CourseCard key={item.id} course={item} onOpen={openCourse} />)}</div> : <div className="school-empty"><BookOpen size={38} weight="light" /><h3>Sigamos buscando.</h3><p>No encontramos cursos con esa búsqueda. Prueba otra palabra o explora todos los temas.</p><button className="button button-dark" onClick={() => { setCategory('Todos'); setQuery(''); }}>Ver todos los cursos<ArrowRight size={18} /></button></div>}</section>

    <section className="school-invitation school-wrap"><div><p className="eyebrow">Una mirada que no deja de crecer</p><h2>Para personas.<br />Para familias.<br /><em>Para seguir juntos.</em></h2></div><div><p>La longevidad es parte de nuestra vida cotidiana. Nos atraviesa cuando cuidamos, aprendemos, trabajamos y construimos vínculos.</p><p>Esta Escuela nace para hacer espacio a esas conversaciones. Con curiosidad, experiencias compartidas y preguntas que podemos llevar a la práctica.</p><div className="school-topic-links">{['Cuidado', 'Generaciones', 'Proyecto de vida'].map(item => <button key={item} onClick={() => showCategory(item)}>{item}<Arrow /></button>)}</div></div></section>

    <section className="school-faq school-wrap" id="escuela-preguntas"><div><p className="eyebrow">Antes de empezar</p><h2>Una pregunta<br />puede abrir<br />muchos caminos.</h2></div><div>{[
      ['¿Para quién es la Escuela?', 'Para personas mayores, hijos, nietos y quienes quieren comprender mejor el cuidado, el envejecimiento y las relaciones entre generaciones. No necesitas conocimientos previos para explorar los temas de muestra.'],
      ['¿Estos cursos ya están disponibles?', 'Este catálogo contiene cursos y lecciones demo para conocer cómo se sentirá la Escuela. Puedes abrirlos y recorrer el contenido de muestra. La oferta definitiva se anunciará cuando esté disponible.'],
      ['¿Necesito crear una cuenta?', 'Para esta vista de muestra no necesitas registro. Puedes explorar los cursos directamente. No se habilitan pagos, certificados o matrículas en esta etapa.'],
      ['¿Puedo proponer un tema?', `Sí. Escríbenos a ${site.email} y cuéntanos qué te gustaría aprender o qué conversación no has encontrado dónde tener.`],
    ].map(([question, answer]) => <details key={question}><summary>{question}<Plus className="school-faq-plus" size={19} /><Minus className="school-faq-minus" size={19} /></summary><p>{answer}</p></details>)}</div></section>

    <section className="school-closing"><p className="eyebrow">La próxima conversación puede empezar aquí.</p><h2>Hay mucho por vivir.<br /><em>Y mucho por aprender.</em></h2><a className="button school-button-white" href={`mailto:${site.email}?subject=${encodeURIComponent('Una pregunta para la Escuela de Hijos y Nietos')}`}>Conversemos sobre la Escuela<Arrow /></a></section>

    <dialog className="school-course-dialog" ref={dialog} aria-labelledby="school-course-title" onCancel={closeCourse} onClick={event => { if (event.target === event.currentTarget) closeCourse(); }}>
      <button className="school-dialog-close" aria-label="Cerrar curso" onClick={closeCourse}><X size={23} /></button>
      {course && <><div className="school-dialog-cover"><img src={course.image} alt={course.imageAlt} /><span className="school-demo-tag">Curso y lecciones de muestra</span></div><div className="school-dialog-body"><p className="eyebrow">{course.category} · Escuela de Hijos y Nietos</p><h2 id="school-course-title">{course.title}</h2><p className="school-dialog-description">{course.description}</p><div className="school-lesson-layout"><aside aria-label="Contenido del curso"><p className="eyebrow">Tu recorrido</p>{course.lessons.map((item, index) => <button key={item.title} aria-pressed={lesson === index} onClick={() => setLesson(index)}><span className={read.includes(index) ? 'lesson-read' : ''}>{read.includes(index) ? <Check size={14} /> : `0${index + 1}`}</span><span>{item.title}</span></button>)}<p className="school-lesson-count">{read.length} de {course.lessons.length} lecciones leídas</p></aside><section className="school-lesson-content" aria-live="polite"><p className="eyebrow">Lección {lesson + 1} de {course.lessons.length} · Demo</p><h3>{course.lessons[lesson].title}</h3><p>{course.lessons[lesson].text}</p><div className="school-reflection"><span>Para llevar a la vida</span><p>{course.lessons[lesson].reflection}</p></div><button className={`school-read-button ${read.includes(lesson) ? 'is-read' : ''}`} onClick={() => setRead(old => old.includes(lesson) ? old.filter(index => index !== lesson) : [...old, lesson])}><Check size={17} />{read.includes(lesson) ? 'Lección leída' : 'Marcar como leída'}</button><div className="school-lesson-navigation"><button disabled={lesson === 0} onClick={() => setLesson(lesson - 1)}><ArrowLeft size={17} />Anterior</button><button disabled={lesson === course.lessons.length - 1} onClick={() => setLesson(lesson + 1)}>Siguiente lección<ArrowRight size={17} /></button></div>{read.length === course.lessons.length && <p className="school-demo-complete" role="status"><Check size={18} />Completaste este recorrido de muestra.</p>}</section></div><p className="school-dialog-note">Contenido de demostración. El progreso de esta ficha se reinicia al cerrarla. No hay inscripción ni certificación.</p></div></>}
    </dialog>
  </>;
}
