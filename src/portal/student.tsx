import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  MagnifyingGlass,
  CreditCard,
  ShieldCheck,
  DownloadSimple,
  FileText,
  PlayCircle,
  Clock,
  X,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  useDemo,
  money,
  type ManagedCourse,
  type DemoOrder,
} from "./demo-store";
import { SiteLink, navigate } from "../navigation";
import { Badge, Empty, Modal, PageHeading } from "./shared";

const clean = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function CourseTile({
  course,
  onSelect,
  learning = false,
}: {
  course: ManagedCourse;
  onSelect: (course: ManagedCourse) => void;
  learning?: boolean;
}) {
  const store = useDemo();
  const completed = (store.progress[course.id] ?? []).length;
  const enrolled = store.enrolled.includes(course.id);
  return (
    <article className="vp-course-card">
      <div className="vp-course-cover">
        <img src={course.image} alt={course.imageAlt} loading="lazy" />
        <Badge tone="ivory">{course.category}</Badge>
      </div>
      <div className="vp-course-info">
        <span className="vp-card-meta">
          {course.lessons.length} lecciones · {course.level}
        </span>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        {learning && (
          <div className="vp-course-progress">
            <div>
              <span>Tu recorrido</span>
              <strong>
                {Math.round((completed / course.lessons.length) * 100)}%
              </strong>
            </div>
            <progress value={completed} max={course.lessons.length} />
          </div>
        )}
        <div className="vp-course-card-bottom">
          <span>
            {learning
              ? `${completed} de ${course.lessons.length} lecciones`
              : enrolled
                ? "En tu biblioteca"
                : money(course.price)}
          </span>
          <button onClick={() => onSelect(course)}>
            {learning ? "Continuar" : "Ver curso"}
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function CoursePreview({
  course,
  onClose,
}: {
  course: ManagedCourse | null;
  onClose: () => void;
}) {
  const store = useDemo();
  function proceed() {
    if (!course) return;
    store.setSelectedCourse(course.id);
    const owned = store.enrolled.includes(course.id);
    if (!owned && !course.price)
      store.setEnrolled((old) => [...new Set([...old, course.id])]);
    navigate(owned || !course.price ? "/escuela/aula" : "/escuela/pago");
  }
  return (
    <Modal
      open={Boolean(course)}
      title="Conoce este curso de muestra"
      onClose={onClose}
      wide
    >
      {course && (
        <div className="vp-course-preview">
          <img src={course.image} alt={course.imageAlt} />
          <div>
            <Badge>{course.category} · Demo</Badge>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="vp-inline-meta">
              <span>
                <BookOpen size={17} />
                {course.lessons.length} lecciones
              </span>
              <span>{course.level}</span>
            </div>
            <h4>Lo que vas a explorar</h4>
            <ol>
              {course.lessons.map((lesson) => (
                <li key={lesson.title}>{lesson.title}</li>
              ))}
            </ol>
            <div className="vp-preview-price">
              <span>
                {store.enrolled.includes(course.id)
                  ? "Ya está en tus cursos de muestra"
                  : "Valor de muestra · COP"}
              </span>
              <strong>{money(course.price)}</strong>
            </div>
            <button className="vp-btn vp-btn-primary" onClick={proceed}>
              {store.enrolled.includes(course.id)
                ? "Continuar mi curso"
                : !course.price
                  ? "Añadir a mis cursos"
                  : "Continuar al pago de prueba"}
              <ArrowRight size={18} />
            </button>
            <p className="vp-small-note">
              Catálogo de demostración. No se realiza una inscripción o un cobro
              real.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function StudentDashboard() {
  const store = useDemo();
  const [preview, setPreview] = useState<ManagedCourse | null>(null);
  const mine = store.courses.filter((course) =>
    store.enrolled.includes(course.id),
  );
  const completed = mine.filter(
    (course) =>
      (store.progress[course.id] ?? []).length >= course.lessons.length,
  ).length;
  function learn(course: ManagedCourse) {
    store.setSelectedCourse(course.id);
    navigate("/escuela/aula");
  }
  return (
    <>
      <PageHeading
        eyebrow="Tu espacio para seguir creciendo"
        title={`Hola, ${store.session?.name.split(" ")[0] ?? "Laura"}.`}
        description="Una buena pregunta puede ser el comienzo de algo nuevo."
        actions={
          <SiteLink
            className="vp-btn vp-btn-secondary"
            href="/escuela/explorar"
          >
            Explorar cursos
            <ArrowUpRight size={18} />
          </SiteLink>
        }
      />
      <section className="vp-student-welcome">
        <div>
          <Badge tone="ivory">Escuela de Hijos y Nietos</Badge>
          <h2>
            Hay mucho por vivir.
            <br />
            <em>Y mucho por aprender.</em>
          </h2>
          <p>
            Vuelve a tu recorrido o descubre una conversación que todavía no
            habías empezado.
          </p>
          <SiteLink className="vp-btn vp-btn-white" href="/escuela/mis-cursos">
            Continuar aprendiendo
            <ArrowRight size={18} />
          </SiteLink>
        </div>
        <img src="/images/school-mateo-melissa.webp" alt="Mateo y Melissa" />
      </section>
      <div className="vp-stat-grid three">
        <div>
          <span>En tu biblioteca</span>
          <strong>{mine.length}</strong>
          <small>Cursos de muestra</small>
        </div>
        <div>
          <span>Lecciones exploradas</span>
          <strong>
            {Object.values(store.progress).reduce(
              (sum, value) => sum + value.length,
              0,
            )}
          </strong>
          <small>Un paso a la vez</small>
        </div>
        <div>
          <span>Recorridos completados</span>
          <strong>{completed}</strong>
          <small>Siempre hay algo por descubrir</small>
        </div>
      </div>
      <div className="vp-section-heading">
        <div>
          <p className="eyebrow">Retoma tu curiosidad</p>
          <h2>Sigue donde te quedaste.</h2>
        </div>
        <SiteLink href="/escuela/mis-cursos">
          Mis cursos
          <ArrowUpRight size={18} />
        </SiteLink>
      </div>
      <div className="vp-course-grid">
        {mine.slice(0, 2).map((course) => (
          <CourseTile
            course={course}
            key={course.id}
            onSelect={learn}
            learning
          />
        ))}
      </div>
      <div className="vp-section-heading">
        <div>
          <p className="eyebrow">Una nueva mirada</p>
          <h2>También puede interesarte.</h2>
        </div>
        <SiteLink href="/escuela/explorar">
          Ver catálogo
          <ArrowUpRight size={18} />
        </SiteLink>
      </div>
      <div className="vp-course-grid">
        {store.courses
          .filter(
            (course) =>
              course.status === "Publicado" &&
              !store.enrolled.includes(course.id),
          )
          .slice(0, 2)
          .map((course) => (
            <CourseTile course={course} key={course.id} onSelect={setPreview} />
          ))}
      </div>
      <CoursePreview course={preview} onClose={() => setPreview(null)} />
    </>
  );
}

export function StudentCatalog({ mine = false }: { mine?: boolean }) {
  const store = useDemo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [preview, setPreview] = useState<ManagedCourse | null>(null);
  const source = store.courses.filter((course) =>
    mine ? store.enrolled.includes(course.id) : course.status === "Publicado",
  );
  const categories = [
    "Todos",
    ...new Set(source.map((course) => course.category)),
  ];
  const shown = source.filter(
    (course) =>
      (category === "Todos" || course.category === category) &&
      clean(`${course.title} ${course.description}`).includes(clean(query)),
  );
  function select(course: ManagedCourse) {
    if (mine) {
      store.setSelectedCourse(course.id);
      navigate("/escuela/aula");
    } else setPreview(course);
  }
  return (
    <>
      <PageHeading
        eyebrow="Escuela de Hijos y Nietos"
        title={mine ? "Mis cursos." : "¿Qué quieres aprender hoy?"}
        description={
          mine
            ? "Tus conversaciones, tus preguntas y todo lo que viene después."
            : "Cuidado, generaciones y nuevas posibilidades para una vida más larga."
        }
      />
      <div className="vp-toolbar">
        <label className="vp-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">Buscar cursos</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca una buena pregunta…"
            type="search"
          />
        </label>
        <span className="vp-muted">{shown.length} cursos de muestra</span>
      </div>
      <div
        className="vp-filter-pills"
        role="group"
        aria-label="Categorías de cursos"
      >
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>
      {shown.length ? (
        <h2 className="sr-only">
          {mine ? "Cursos en tu biblioteca" : "Cursos disponibles"}
        </h2>
      ) : null}
      {shown.length ? (
        <div className="vp-course-grid">
          {shown.map((course) => (
            <CourseTile
              course={course}
              key={course.id}
              onSelect={select}
              learning={mine}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Sigamos buscando."
          text="No encontramos cursos con esos filtros. Puedes explorar otra pregunta."
          action={
            <button
              className="vp-btn vp-btn-primary"
              onClick={() => {
                setQuery("");
                setCategory("Todos");
              }}
            >
              Ver todos los cursos
            </button>
          }
        />
      )}
      <CoursePreview course={preview} onClose={() => setPreview(null)} />
    </>
  );
}

export function Classroom() {
  const store = useDemo();
  const course = store.courses.find((item) => item.id === store.selectedCourse);
  const [lesson, setLesson] = useState(0);
  const [tab, setTab] = useState("Lección");
  const [notes, setNotes] = useState("");
  if (!course)
    return (
      <Empty
        title="Elige tu próximo aprendizaje."
        text="Encuentra un curso para empezar tu recorrido."
        action={
          <SiteLink className="vp-btn vp-btn-primary" href="/escuela/explorar">
            Explorar cursos
          </SiteLink>
        }
      />
    );
  if (!store.enrolled.includes(course.id))
    return (
      <>
        <PageHeading
          title="Este curso aún no está en tu biblioteca."
          description="Puedes conocerlo y recorrer el pago de prueba antes de entrar al aula de muestra."
        />
        <button
          className="vp-btn vp-btn-primary"
          onClick={() => navigate("/escuela/pago")}
        >
          Ir al pago de prueba
          <ArrowRight size={18} />
        </button>
      </>
    );
  const current = course.lessons[Math.min(lesson, course.lessons.length - 1)];
  const read = store.progress[course.id] ?? [];
  function mark() {
    if (!course) return;
    store.setProgress((old) => ({
      ...old,
      [course.id]: old[course.id]?.includes(lesson)
        ? old[course.id].filter((item) => item !== lesson)
        : [...(old[course.id] ?? []), lesson],
    }));
  }
  return (
    <>
      <SiteLink className="vp-back-link" href="/escuela/mis-cursos">
        <ArrowLeft size={17} />
        Mis cursos
      </SiteLink>
      <PageHeading
        eyebrow={`${course.category} · Curso de demostración`}
        title={course.title}
      />
      <div className="vp-classroom">
        <aside className="vp-lesson-sidebar">
          <div>
            <h2>Tu recorrido</h2>
            <span>
              {read.length} de {course.lessons.length} lecciones
            </span>
            <progress value={read.length} max={course.lessons.length} />
          </div>
          <nav aria-label="Lecciones del curso">
            {course.lessons.map((item, index) => (
              <button
                key={`${index}-${item.title}`}
                onClick={() => {
                  setLesson(index);
                  setTab("Lección");
                }}
                aria-current={lesson === index ? "step" : undefined}
              >
                <span className={read.includes(index) ? "complete" : ""}>
                  {read.includes(index) ? <Check size={15} /> : `0${index + 1}`}
                </span>
                <span>{item.title}</span>
              </button>
            ))}
          </nav>
          <p>
            <BookOpen size={16} />
            Cada conversación cuenta.
          </p>
        </aside>
        <div className="vp-classroom-main">
          <div className="vp-lesson-poster">
            <img src={course.image} alt={course.imageAlt} />
            <div>
              <Badge tone="ivory">Aula de muestra</Badge>
              <BookOpen size={32} weight="light" />
              <span>Lección {lesson + 1}</span>
              <h2>{current.title}</h2>
              <p>El recurso audiovisual se incorporará en la siguiente fase.</p>
            </div>
          </div>
          <div
            className="vp-tab-bar"
            role="group"
            aria-label="Contenido de la lección"
          >
            {["Lección", "Recursos", "Mis notas"].map((item) => (
              <button
                key={item}
                aria-pressed={tab === item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <section className="vp-lesson-reading">
            {tab === "Lección" ? (
              <>
                <p className="eyebrow">Una pregunta para abrir posibilidades</p>
                <h2>{current.title}</h2>
                <p>{current.text}</p>
                <div className="vp-reflection">
                  <span>Para llevar a la vida</span>
                  <p>{current.reflection}</p>
                </div>
                <button
                  className={`vp-btn ${read.includes(lesson) ? "vp-btn-primary" : "vp-btn-secondary"}`}
                  onClick={mark}
                >
                  <Check size={18} />
                  {read.includes(lesson)
                    ? "Lección completada"
                    : "Marcar como completada"}
                </button>
              </>
            ) : tab === "Recursos" ? (
              <>
                <h2>Una idea para llevar contigo.</h2>
                <div className="vp-resource">
                  <FileText size={28} />
                  <div>
                    <strong>Ejercicio de reflexión</strong>
                    <p>{current.reflection}</p>
                    <span>Contenido de muestra incluido en esta lección.</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Tus ideas también cuentan.</h2>
                <label className="vp-field">
                  Mis notas de esta vista
                  <textarea
                    aria-label="Mis notas de esta vista"
                    rows={6}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Una pregunta, una idea, algo que quieres conversar…"
                    maxLength={2000}
                  />
                </label>
                <button
                  className="vp-btn vp-btn-primary"
                  onClick={() =>
                    store.setNotice(
                      "Nota de muestra guardada en esta vista del aula.",
                    )
                  }
                >
                  Guardar nota de muestra
                </button>
                <p className="vp-small-note">
                  Las notas se conservan mientras permanezcas en esta vista.
                </p>
              </>
            )}
            <div className="vp-lesson-nav">
              <button
                className="vp-btn vp-btn-ghost"
                disabled={lesson === 0}
                onClick={() => setLesson(lesson - 1)}
              >
                <ArrowLeft size={18} />
                Anterior
              </button>
              <button
                className="vp-btn vp-btn-secondary"
                disabled={lesson >= course.lessons.length - 1}
                onClick={() => setLesson(lesson + 1)}
              >
                Siguiente lección
                <ArrowRight size={18} />
              </button>
            </div>
            {read.length >= course.lessons.length && (
              <div className="vp-feedback">
                <CheckCircle size={20} />
                Completaste este recorrido de muestra. Siempre hay una nueva
                pregunta por explorar.
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export function StudentProfile() {
  const store = useDemo();
  const [tab, setTab] = useState("Mis datos");
  const [name, setName] = useState(store.session?.name ?? "Laura Gómez");
  const [email, setEmail] = useState(
    store.session?.email ?? "laura@ejemplo.com",
  );
  const [city, setCity] = useState(store.profile.city);
  const [notifications, setNotifications] = useState(
    store.profile.notifications,
  );
  const [newsletter, setNewsletter] = useState(store.profile.newsletter);
  function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (store.session) store.setSession({ ...store.session, name, email });
    store.setUsers((old) =>
      old.map((user) => (user.id === "u1" ? { ...user, name, email } : user)),
    );
    store.setProfile((old) => ({ ...old, city }));
    store.setNotice("Perfil actualizado en la sesión de demostración.");
  }
  return (
    <>
      <PageHeading
        eyebrow="Tu espacio, a tu manera"
        title="Mi perfil."
        description="Un lugar para cuidar tus datos, tus preferencias y tu acceso."
      />
      <div className="vp-profile-layout">
        <aside className="vp-profile-card">
          <span className="vp-avatar large">
            {name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </span>
          <h2>{name}</h2>
          <p>{email}</p>
          <Badge>Estudiante · Demo</Badge>
          <div>
            <span>Mi biblioteca</span>
            <strong>{store.enrolled.length} cursos</strong>
          </div>
        </aside>
        <section className="vp-panel">
          <div
            className="vp-tab-bar"
            role="group"
            aria-label="Secciones del perfil"
          >
            {["Mis datos", "Preferencias", "Acceso"].map((item) => (
              <button
                key={item}
                aria-pressed={tab === item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {tab === "Mis datos" ? (
            <form className="vp-form vp-panel-body" onSubmit={save}>
              <h2>Qué bueno conocerte.</h2>
              <div className="vp-form-grid">
                <label className="vp-field">
                  Nombre completo
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                  />
                </label>
                <label className="vp-field">
                  Correo electrónico
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={180}
                  />
                </label>
                <label className="vp-field">
                  Ciudad
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    maxLength={100}
                  />
                </label>
                <label className="vp-field">
                  Idioma
                  <select aria-label="Idioma" defaultValue="Español">
                    <option>Español</option>
                  </select>
                </label>
              </div>
              <button className="vp-btn vp-btn-primary" type="submit">
                Guardar datos de muestra
                <Check size={17} />
              </button>
            </form>
          ) : tab === "Preferencias" ? (
            <div className="vp-panel-body vp-form">
              <h2>Sigamos conversando.</h2>
              <label className="vp-setting-toggle">
                <span>
                  <strong>Novedades de mis cursos</strong>
                  <small>
                    Vista de la preferencia de correo para futuras
                    comunicaciones.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) => setNotifications(event.target.checked)}
                />
              </label>
              <label className="vp-setting-toggle">
                <span>
                  <strong>El Futuro tiene Canas</strong>
                  <small>
                    Explora cómo se verá la suscripción al newsletter.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(event) => setNewsletter(event.target.checked)}
                />
              </label>
              <button
                className="vp-btn vp-btn-primary"
                onClick={() => {
                  store.setProfile((old) => ({
                    ...old,
                    notifications,
                    newsletter,
                  }));
                  store.setNotice(
                    "Preferencias simuladas. No se registró una suscripción ni se enviará un correo.",
                  );
                }}
              >
                Guardar preferencias
              </button>
            </div>
          ) : (
            <div className="vp-panel-body vp-form">
              <h2>Tu acceso a la Escuela.</h2>
              <div className="vp-security-row">
                <ShieldCheck size={24} />
                <div>
                  <strong>Verificación por correo</strong>
                  <p>
                    Vista del flujo de códigos. Se conectará con Resend en la
                    fase técnica.
                  </p>
                </div>
                <Badge tone="pending">Por conectar</Badge>
              </div>
              <div className="vp-security-row">
                <CreditCard size={24} />
                <div>
                  <strong>Contraseña y sesiones</strong>
                  <p>Esta demo no crea credenciales ni sesiones reales.</p>
                </div>
              </div>
              <SiteLink
                href="/escuela/recuperar"
                className="vp-btn vp-btn-secondary"
              >
                Ver recuperación de acceso
                <ArrowUpRight size={18} />
              </SiteLink>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function Checkout() {
  const store = useDemo();
  const course =
    store.courses.find((item) => item.id === store.selectedCourse) ??
    store.courses[0];
  const [method, setMethod] = useState("Tarjeta");
  const [scenario, setScenario] = useState("Aprobado");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [consent, setConsent] = useState(false);
  // Evaluated once on entry: returning to this view (for example with the
  // browser's back button) must not offer a second payment for an owned course.
  const [ownedOnEntry] = useState(() => store.enrolled.includes(course.id));
  async function pay(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || state === "loading") return;
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (scenario === "Rechazado") {
      setState("error");
      return;
    }
    store.setOrders((old) => [
      {
        id: `DEMO-${Date.now().toString().slice(-6)}`,
        userId: "student-demo",
        name: store.session?.name ?? "Laura Gómez",
        courseId: course.id,
        amount: course.price,
        status: "Simulado",
        date: "Esta sesión",
      },
      ...old,
    ]);
    store.setEnrolled((old) => [...new Set([...old, course.id])]);
    setState("success");
  }
  return (
    <>
      <SiteLink className="vp-back-link" href="/escuela/explorar">
        <ArrowLeft size={17} />
        Volver a los cursos
      </SiteLink>
      <PageHeading
        eyebrow="Un siguiente paso para aprender"
        title="Tu próximo aprendizaje."
        description="Recorre una pasarela de pago de muestra. No se solicita una tarjeta real ni se realiza ningún cargo."
      />
      {ownedOnEntry ? (
        <div className="vp-payment-success">
          <CheckCircle size={58} weight="light" />
          <Badge>Ya en tu biblioteca</Badge>
          <h2>Este curso ya es parte de tu recorrido.</h2>
          <p>
            No hace falta repetir el pago de prueba. Puedes continuar donde te
            quedaste o explorar otra conversación.
          </p>
          <div className="vp-payment-summary">
            <span>{course.title}</span>
            <strong>En tu biblioteca</strong>
          </div>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate("/escuela/aula")}
          >
            Ir a mi curso
            <ArrowRight size={18} />
          </button>
          <SiteLink href="/escuela/explorar" className="vp-text-button">
            Explorar otros cursos
          </SiteLink>
        </div>
      ) : state === "success" ? (
        <div className="vp-payment-success">
          <CheckCircle size={58} weight="light" />
          <Badge>Operación simulada</Badge>
          <h2>Tu curso ya está en la demo.</h2>
          <p>
            No se ha realizado ningún cobro. Añadimos el curso a tu biblioteca
            de muestra para que puedas continuar el recorrido.
          </p>
          <div className="vp-payment-summary">
            <span>{course.title}</span>
            <strong>{money(course.price)}</strong>
          </div>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate("/escuela/aula")}
          >
            Ir a mi curso
            <ArrowRight size={18} />
          </button>
          <SiteLink href="/escuela/pagos" className="vp-text-button">
            Ver el registro de prueba
          </SiteLink>
        </div>
      ) : (
        <div className="vp-checkout-layout">
          <form className="vp-panel vp-panel-body vp-form" onSubmit={pay}>
            <div className="vp-checkout-title">
              <h2>Completa el recorrido.</h2>
              <Badge tone="pending">Pago de prueba</Badge>
            </div>
            <div
              className="vp-tab-bar"
              role="group"
              aria-label="Método de pago de prueba"
            >
              {["Tarjeta", "PSE"].map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={method === item}
                  onClick={() => setMethod(item)}
                >
                  {item === "Tarjeta" && <CreditCard size={18} />}
                  {item}
                </button>
              ))}
            </div>
            {method === "Tarjeta" ? (
              <>
                <label className="vp-field">
                  Número de tarjeta de prueba
                  <input
                    value="4242 4242 4242 4242"
                    readOnly
                    aria-describedby="vp-card-help"
                  />
                </label>
                <div className="vp-form-grid">
                  <label className="vp-field">
                    Vencimiento
                    <input value="12 / 30" readOnly />
                  </label>
                  <label className="vp-field">
                    Código de prueba
                    <input value="123" readOnly />
                  </label>
                </div>
                <p id="vp-card-help" className="vp-small-note">
                  Estos datos son ficticios y no se pueden sustituir por una
                  tarjeta real.
                </p>
              </>
            ) : (
              <>
                <label className="vp-field">
                  Banco de demostración
                  <select aria-label="Banco de demostración">
                    <option>Banco de prueba · Persona natural</option>
                    <option>Banco de prueba · Persona jurídica</option>
                  </select>
                </label>
                <p className="vp-small-note">
                  No se abrirá una entidad bancaria ni se realizará una
                  transferencia.
                </p>
              </>
            )}
            <div className="vp-demo-scenario">
              <span>Resultado de prueba</span>
              <select
                aria-label="Resultado de prueba"
                value={scenario}
                onChange={(event) => {
                  setScenario(event.target.value);
                  setState("idle");
                }}
              >
                <option>Aprobado</option>
                <option>Rechazado</option>
              </select>
            </div>
            <label className="vp-checkbox">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
              />
              Entiendo que este es un pago simulado.
            </label>
            {state === "error" && (
              <div className="vp-form-error" role="alert">
                <WarningCircle size={20} />
                Pago de prueba rechazado. Puedes cambiar el resultado de prueba
                y volver a intentarlo.
              </div>
            )}
            <button
              className="vp-btn vp-btn-primary"
              type="submit"
              disabled={!consent || state === "loading"}
            >
              {state === "loading" ? "Simulando operación…" : "Simular pago"}
              <ArrowRight size={18} />
            </button>
            <p className="vp-small-note">
              El resumen por correo y la pasarela real se conectarán en la fase
              técnica.
            </p>
          </form>
          <aside className="vp-order-summary">
            <img src={course.image} alt={course.imageAlt} />
            <div>
              <Badge>{course.category}</Badge>
              <h2>{course.title}</h2>
              <p>
                <BookOpen size={17} />
                {course.lessons.length} lecciones de muestra
              </p>
              <div className="vp-order-total">
                <span>Total de prueba</span>
                <strong>{money(course.price)}</strong>
              </div>
              <span className="vp-small-note">
                Valores ilustrativos en pesos colombianos. Sin cobro real.
              </span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export function StudentPayments() {
  const store = useDemo();
  const [receipt, setReceipt] = useState<DemoOrder | null>(null);
  const orders = store.orders.filter(
    (order) => order.userId === "student-demo",
  );
  return (
    <>
      <PageHeading
        eyebrow="Todo en un mismo lugar"
        title="Mis pagos."
        description="Un registro de muestra de tus cursos y operaciones simuladas."
      />
      <div className="vp-panel vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Curso</th>
              <th>Valor de muestra</th>
              <th>Estado</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.id}</strong>
                  <small>{order.date}</small>
                </td>
                <td>
                  {store.courses.find((course) => course.id === order.courseId)
                    ?.title ?? "Curso de muestra"}
                </td>
                <td>{money(order.amount)}</td>
                <td>
                  <Badge
                    tone={order.status === "Simulado" ? "success" : "danger"}
                  >
                    {order.status}
                  </Badge>
                </td>
                <td>
                  <button
                    className="vp-table-action"
                    onClick={() => setReceipt(order)}
                  >
                    Ver resumen
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="vp-small-note">
        Estos registros no son comprobantes fiscales ni pagos procesados.
      </p>
      <Modal
        open={Boolean(receipt)}
        title="Resumen de operación de muestra"
        onClose={() => setReceipt(null)}
      >
        {receipt && (
          <div className="vp-panel-body vp-receipt">
            <Badge>Sin validez fiscal · Demo</Badge>
            <h3>{receipt.id}</h3>
            <dl>
              <div>
                <dt>Participante de muestra</dt>
                <dd>{receipt.name}</dd>
              </div>
              <div>
                <dt>Curso</dt>
                <dd>
                  {
                    store.courses.find(
                      (course) => course.id === receipt.courseId,
                    )?.title
                  }
                </dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{receipt.status}</dd>
              </div>
              <div>
                <dt>Valor ilustrativo</dt>
                <dd>{money(receipt.amount)}</dd>
              </div>
            </dl>
            <p>No se realizó ningún cargo ni se envió un correo.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
