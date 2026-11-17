import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Plus,
  MagnifyingGlass,
  BookOpen,
  Users,
  Files,
  CreditCard,
  PencilSimple,
  Copy,
  Archive,
  Check,
  Eye,
  UploadSimple,
  Image,
  FileText,
  VideoCamera,
  Trash,
  ArrowUp,
  ArrowDown,
  EnvelopeSimple,
  ShieldCheck,
  GearSix,
  Clock,
  X,
} from "@phosphor-icons/react";
import {
  useDemo,
  money,
  type ManagedCourse,
  type ContentPage,
  type DemoUser,
  type DemoOrder,
  type MediaItem,
} from "./demo-store";
import { SiteLink, navigate } from "../navigation";
import { Badge, Empty, Modal, PageHeading } from "./shared";

const normalized = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const statusTone = (status: string) =>
  ["Publicado", "Activo", "Simulado"].includes(status)
    ? "success"
    : ["Archivado", "Suspendido", "Rechazado"].includes(status)
      ? "muted"
      : "pending";

function useCourseActions() {
  const store = useDemo();
  function edit(course: ManagedCourse) {
    store.setSelectedCourse(course.id);
    navigate("/admin/curso");
  }
  function create() {
    const course: ManagedCourse = {
      id: uid("curso"),
      title: "",
      description: "",
      category: "Cuidado",
      image: "/images/school-care.webp",
      imageAlt: "Portada conceptual de cuidado compartido",
      price: 0,
      level: "Introductorio",
      status: "Borrador",
      lessons: [
        {
          title: "Una primera conversación",
          text: "Escribe aquí el contenido de esta lección de muestra.",
          reflection: "¿Qué pregunta quieres llevar a la vida?",
        },
      ],
    };
    store.setCourses((old) => [course, ...old]);
    edit(course);
  }
  return { edit, create };
}

export function AdminDashboard() {
  const store = useDemo();
  const { create, edit } = useCourseActions();
  const stats = [
    {
      label: "Cursos publicados",
      value: store.courses.filter((c) => c.status === "Publicado").length,
      note: `${store.courses.filter((c) => c.status === "Borrador").length} en borrador`,
      icon: BookOpen,
    },
    {
      label: "Páginas en el CMS",
      value: store.pages.length,
      note: "Contenido de muestra",
      icon: Files,
    },
    {
      label: "Personas de ejemplo",
      value: store.users.length,
      note: "Sin cuentas reales",
      icon: Users,
    },
    {
      label: "Operaciones simuladas",
      value: store.orders.filter((o) => o.status === "Simulado").length,
      note: "Sin transacciones reales",
      icon: CreditCard,
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="El ecosistema, en tus manos"
        title="Hagamos crecer las buenas ideas."
        description="Un lugar para preparar lo que Vasees comparte, enseña y conecta."
        actions={
          <button className="vp-btn vp-btn-primary" onClick={create}>
            <Plus size={18} />
            Crear curso
          </button>
        }
      />
      <div className="vp-admin-intro">
        <div>
          <Badge tone="ivory">Tu mesa de trabajo</Badge>
          <h2>
            Contenido con propósito.
            <br />
            <em>Todo conectado.</em>
          </h2>
          <p>
            Organiza la Escuela y las páginas de Vasees desde un mismo espacio.
          </p>
        </div>
        <span className="vp-intro-orbit">
          <Files size={58} weight="thin" />
          <BookOpen size={40} weight="thin" />
        </span>
      </div>
      <div className="vp-stat-grid">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <div key={label}>
            <span>
              {label}
              <Icon size={19} />
            </span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="vp-admin-columns">
        <section className="vp-panel">
          <div className="vp-panel-heading">
            <h2>En la mesa de trabajo</h2>
            <SiteLink href="/admin/cursos">
              Ver cursos
              <ArrowUpRight size={17} />
            </SiteLink>
          </div>
          <div className="vp-activity-list">
            {store.courses.slice(0, 4).map((course) => (
              <button key={course.id} onClick={() => edit(course)}>
                <img src={course.image} alt="" />
                <span>
                  <strong>{course.title || "Curso sin título"}</strong>
                  <small>
                    {course.lessons.length} lecciones · {course.category}
                  </small>
                </span>
                <Badge tone={statusTone(course.status)}>{course.status}</Badge>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </section>
        <section className="vp-panel">
          <div className="vp-panel-heading">
            <h2>Empieza por aquí</h2>
          </div>
          <div className="vp-quick-links">
            {[
              {
                href: "/admin/contenido",
                icon: Files,
                title: "Dar forma a una página",
                text: "Portadas, secciones y textos del sitio.",
              },
              {
                href: "/admin/medios",
                icon: Image,
                title: "Organizar la biblioteca",
                text: "Imágenes y recursos para tus contenidos.",
              },
              {
                href: "/admin/mensajes",
                icon: EnvelopeSimple,
                title: "Preparar los correos",
                text: "Plantillas y códigos para conectar con Resend.",
              },
            ].map(({ href, icon: Icon, title, text }) => (
              <SiteLink href={href} key={href}>
                <Icon size={24} weight="light" />
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
                <ArrowUpRight size={18} />
              </SiteLink>
            ))}
          </div>
        </section>
      </div>
      <div className="vp-integration-note">
        <ShieldCheck size={24} weight="light" />
        <div>
          <strong>La experiencia está lista para recorrer.</strong>
          <p>
            Autenticación, permisos, almacenamiento, pasarela y Resend se
            implementarán en la fase técnica.
          </p>
        </div>
        <Badge tone="pending">Integraciones pendientes</Badge>
      </div>
    </>
  );
}

export function AdminCourses() {
  const store = useDemo();
  const { create, edit } = useCourseActions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const courses = store.courses.filter(
    (course) =>
      (status === "Todos" || course.status === status) &&
      normalized(`${course.title} ${course.category}`).includes(
        normalized(query),
      ),
  );
  function duplicate(course: ManagedCourse) {
    const copy = {
      ...course,
      id: uid("curso"),
      title: `${course.title} · Copia`,
      status: "Borrador" as const,
      lessons: course.lessons.map((lesson) => ({ ...lesson })),
    };
    store.setCourses((old) => [copy, ...old]);
    store.setNotice("Copia creada como borrador en esta demo.");
  }
  function archive(course: ManagedCourse) {
    store.setCourses((old) =>
      old.map((item) =>
        item.id === course.id
          ? {
              ...item,
              status: item.status === "Archivado" ? "Borrador" : "Archivado",
            }
          : item,
      ),
    );
    store.setNotice(
      course.status === "Archivado"
        ? "Curso recuperado como borrador de muestra."
        : "Curso archivado en la demo. Puedes recuperarlo desde este listado.",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="Escuela de Familia y Longevidad"
        title="Una biblioteca de posibilidades."
        description="Crea, organiza y prepara los cursos que abrirán nuevas conversaciones."
        actions={
          <button className="vp-btn vp-btn-primary" onClick={create}>
            <Plus size={18} />
            Crear curso
          </button>
        }
      />
      <div className="vp-toolbar">
        <label className="vp-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">Buscar cursos en administración</span>
          <input
            type="search"
            placeholder="Buscar por título o tema…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="vp-select-filter">
          <span>Estado</span>
          <select
            aria-label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["Todos", "Publicado", "Borrador", "Archivado"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="vp-panel vp-table-wrap">
        <table className="vp-table vp-courses-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Estado</th>
              <th>Contenido</th>
              <th>Valor de muestra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <button
                    className="vp-table-course"
                    onClick={() => edit(course)}
                  >
                    <img src={course.image} alt="" />
                    <span>
                      <strong>{course.title || "Curso sin título"}</strong>
                      <small>{course.category}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <Badge tone={statusTone(course.status)}>
                    {course.status}
                  </Badge>
                </td>
                <td>{course.lessons.length} lecciones</td>
                <td>{money(course.price)}</td>
                <td>
                  <div className="vp-row-actions">
                    <button
                      aria-label={`Editar ${course.title || "curso"}`}
                      title="Editar curso"
                      onClick={() => edit(course)}
                    >
                      <PencilSimple size={19} />
                    </button>
                    <button
                      aria-label={`Duplicar ${course.title || "curso"}`}
                      title="Duplicar como borrador"
                      onClick={() => duplicate(course)}
                    >
                      <Copy size={19} />
                    </button>
                    <button
                      aria-label={`${course.status === "Archivado" ? "Recuperar" : "Archivar"} ${course.title || "curso"}`}
                      title={
                        course.status === "Archivado"
                          ? "Recuperar como borrador"
                          : "Archivar"
                      }
                      onClick={() => archive(course)}
                    >
                      <Archive size={19} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!courses.length && (
          <Empty
            title="No hay cursos con esos filtros."
            text="Prueba con otro título o estado."
            action={
              <button
                className="vp-btn vp-btn-secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("Todos");
                }}
              >
                Limpiar filtros
              </button>
            }
          />
        )}
      </div>
      <p className="vp-small-note">
        Publicar aquí solo cambia el catálogo de esta sesión de demostración.
      </p>
    </>
  );
}

export function CourseEditor() {
  const store = useDemo();
  const original = store.courses.find(
    (course) => course.id === store.selectedCourse,
  );
  const [draft, setDraft] = useState<ManagedCourse | undefined>(
    original
      ? {
          ...original,
          lessons: original.lessons.map((lesson) => ({ ...lesson })),
        }
      : undefined,
  );
  const [tab, setTab] = useState("Información");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  if (!draft)
    return (
      <Empty
        title="Elige un curso para continuar."
        text="Puedes crear uno nuevo o editar un curso de muestra."
        action={
          <SiteLink className="vp-btn vp-btn-primary" href="/admin/cursos">
            Volver a cursos
          </SiteLink>
        }
      />
    );
  function patch(value: Partial<ManagedCourse>) {
    setDraft((old) => (old ? { ...old, ...value } : old));
  }
  function lessonPatch(
    index: number,
    value: Partial<ManagedCourse["lessons"][number]>,
  ) {
    if (draft)
      patch({
        lessons: draft.lessons.map((lesson, i) =>
          i === index ? { ...lesson, ...value } : lesson,
        ),
      });
  }
  function move(index: number, direction: number) {
    if (!draft) return;
    const lessons = [...draft.lessons];
    [lessons[index], lessons[index + direction]] = [
      lessons[index + direction],
      lessons[index],
    ];
    patch({ lessons });
  }
  function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (
      !draft.title.trim() ||
      !draft.description.trim() ||
      !draft.lessons.length ||
      draft.lessons.some(
        (lesson) => !lesson.title.trim() || !lesson.text.trim(),
      )
    ) {
      setError(
        "Añade título, descripción y al menos una lección con título y contenido antes de guardar.",
      );
      return;
    }
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
      "value",
    );
    const status =
      action === "publish"
        ? "Publicado"
        : action === "draft"
          ? "Borrador"
          : draft.status;
    store.setCourses((old) =>
      old.map((course) =>
        course.id === draft.id
          ? { ...draft, title: draft.title.trim(), status }
          : course,
      ),
    );
    if (JSON.stringify(original?.lessons) !== JSON.stringify(draft.lessons))
      store.setProgress((old) => ({ ...old, [draft.id]: [] }));
    store.setNotice(
      status === "Publicado"
        ? "Curso publicado en el catálogo de esta demo. No se modificó la web en producción."
        : "Curso guardado en la sesión de demostración.",
    );
    navigate("/admin/cursos");
  }
  return (
    <>
      <SiteLink href="/admin/cursos" className="vp-back-link">
        <ArrowLeft size={17} />
        Todos los cursos
      </SiteLink>
      <PageHeading
        eyebrow="Editor de cursos"
        title={draft.title || "Una nueva conversación."}
        description="Dale forma al recorrido, una lección a la vez."
        actions={
          <button
            className="vp-btn vp-btn-secondary"
            onClick={() => setPreview(true)}
          >
            <Eye size={18} />
            Vista previa
          </button>
        }
      />
      <form className="vp-editor-layout" onSubmit={save}>
        <section className="vp-panel">
          <div className="vp-tab-bar" role="group" aria-label="Editor de curso">
            {["Información", "Lecciones", "Publicación"].map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={tab === item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="vp-panel-body vp-form">
            {tab === "Información" ? (
              <>
                <h2>La idea que abre el curso.</h2>
                <label className="vp-field">
                  Título del curso
                  <input
                    value={draft.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    maxLength={140}
                    placeholder="¿Qué quieres enseñar?"
                  />
                </label>
                <label className="vp-field">
                  Descripción
                  <textarea
                    aria-label="Descripción"
                    rows={4}
                    value={draft.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    maxLength={1000}
                    placeholder="Una invitación clara para quien quiere aprender."
                  />
                </label>
                <div className="vp-form-grid">
                  <label className="vp-field">
                    Categoría
                    <select
                      aria-label="Categoría"
                      value={draft.category}
                      onChange={(e) => patch({ category: e.target.value })}
                    >
                      {[
                        "Cuidado",
                        "Generaciones",
                        "Proyecto de vida",
                        "Tecnología",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="vp-field">
                    Nivel
                    <select
                      aria-label="Nivel"
                      value={draft.level}
                      onChange={(e) => patch({ level: e.target.value })}
                    >
                      <option>Introductorio</option>
                      <option>Intermedio</option>
                      <option>Para profundizar</option>
                    </select>
                  </label>
                </div>
                <label className="vp-field">
                  Valor de muestra en COP
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="1000"
                    value={draft.price}
                    onChange={(e) => patch({ price: Number(e.target.value) })}
                  />
                </label>
                <span className="vp-small-note">
                  Usa 0 para un curso gratuito de muestra.
                </span>
              </>
            ) : tab === "Lecciones" ? (
              <>
                <div className="vp-section-heading compact">
                  <div>
                    <h2>Pequeños pasos. Nuevas miradas.</h2>
                    <p>Ordena las lecciones y prepara su contenido.</p>
                  </div>
                  <button
                    type="button"
                    className="vp-btn vp-btn-secondary"
                    onClick={() =>
                      patch({
                        lessons: [
                          ...draft.lessons,
                          { title: "", text: "", reflection: "" },
                        ],
                      })
                    }
                  >
                    <Plus size={17} />
                    Añadir lección
                  </button>
                </div>
                <div className="vp-lesson-editor-list">
                  {draft.lessons.map((lesson, index) => (
                    <article className="vp-lesson-editor" key={index}>
                      <div className="vp-lesson-editor-heading">
                        <strong>Lección {index + 1}</strong>
                        <div className="vp-row-actions">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                            aria-label={`Subir lección ${index + 1}`}
                          >
                            <ArrowUp size={17} />
                          </button>
                          <button
                            type="button"
                            disabled={index === draft.lessons.length - 1}
                            onClick={() => move(index, 1)}
                            aria-label={`Bajar lección ${index + 1}`}
                          >
                            <ArrowDown size={17} />
                          </button>
                          <button
                            type="button"
                            disabled={draft.lessons.length === 1}
                            onClick={() =>
                              patch({
                                lessons: draft.lessons.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                            aria-label={`Eliminar lección ${index + 1}`}
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </div>
                      <label className="vp-field">
                        Título de la lección {index + 1}
                        <input
                          value={lesson.title}
                          onChange={(e) =>
                            lessonPatch(index, { title: e.target.value })
                          }
                          maxLength={140}
                        />
                      </label>
                      <label className="vp-field">
                        Contenido de la lección {index + 1}
                        <textarea
                          aria-label={`Contenido de la lección ${index + 1}`}
                          rows={4}
                          value={lesson.text}
                          onChange={(e) =>
                            lessonPatch(index, { text: e.target.value })
                          }
                          maxLength={10000}
                        />
                      </label>
                      <label className="vp-field">
                        Pregunta de reflexión {index + 1}
                        <textarea
                          aria-label={`Pregunta de reflexión ${index + 1}`}
                          rows={2}
                          value={lesson.reflection}
                          onChange={(e) =>
                            lessonPatch(index, { reflection: e.target.value })
                          }
                          maxLength={2000}
                        />
                      </label>
                    </article>
                  ))}
                </div>
                <label className="vp-upload-label">
                  <UploadSimple size={22} />
                  <span>
                    <strong>
                      {draft.resourceName || "Elegir recurso de muestra"}
                    </strong>
                    <small>
                      PDF o video · Se mostrará el nombre, sin subirlo a un
                      servidor.
                    </small>
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,video/mp4"
                    onChange={(e) =>
                      patch({ resourceName: e.target.files?.[0]?.name })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <h2>Lista para encontrarse con alguien.</h2>
                <label className="vp-field">
                  Estado del curso
                  <select
                    aria-label="Estado del curso"
                    value={draft.status}
                    onChange={(e) =>
                      patch({
                        status: e.target.value as ManagedCourse["status"],
                      })
                    }
                  >
                    <option>Borrador</option>
                    <option>Publicado</option>
                    <option>Archivado</option>
                  </select>
                </label>
                <div className="vp-publish-checklist">
                  <p>
                    <Check size={18} />
                    Portada y categoría
                  </p>
                  <p>
                    <Check size={18} />
                    {draft.lessons.length} lecciones preparadas
                  </p>
                  <p>
                    <CreditCard size={18} />
                    {money(draft.price)} · Valor de muestra
                  </p>
                </div>
                <div className="vp-callout">
                  <strong>Publicación de demostración</strong>
                  <p>
                    El curso aparecerá en Explorar cursos de esta sesión. No se
                    guardará en un servidor ni se publicará en Vercel.
                  </p>
                </div>
              </>
            )}
            {error && (
              <p className="vp-form-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
        <aside className="vp-editor-aside">
          <div className="vp-panel vp-cover-picker">
            <img src={draft.image} alt={draft.imageAlt} />
            <div className="vp-panel-body">
              <h2>La primera mirada.</h2>
              <p>Elige una portada de la biblioteca.</p>
              <div
                className="vp-cover-options"
                role="group"
                aria-label="Portada del curso"
              >
                {store.media
                  .filter((item) => item.type === "image")
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-label={`Usar portada ${item.name}`}
                      aria-pressed={draft.image === item.url}
                      onClick={() =>
                        patch({ image: item.url, imageAlt: item.name })
                      }
                    >
                      <img src={item.url} alt="" />
                      {draft.image === item.url && <Check size={17} />}
                    </button>
                  ))}
              </div>
              <SiteLink href="/admin/medios" className="vp-text-button">
                Ver biblioteca
                <ArrowUpRight size={16} />
              </SiteLink>
            </div>
          </div>
          <div className="vp-editor-save vp-panel">
            <Badge tone={statusTone(draft.status)}>{draft.status}</Badge>
            <span>
              {draft.lessons.length} lecciones · {money(draft.price)}
            </span>
            <button
              className="vp-btn vp-btn-primary"
              type="submit"
              value="publish"
            >
              Publicar en la demo
              <ArrowUpRight size={17} />
            </button>
            <button
              className="vp-btn vp-btn-secondary"
              type="submit"
              value="draft"
            >
              Guardar borrador
            </button>
            <button className="vp-text-button" type="submit" value="save">
              Guardar estado seleccionado
            </button>
            <span className="vp-small-note">
              Cambios temporales de esta sesión.
            </span>
          </div>
        </aside>
      </form>
      <Modal
        open={preview}
        title="Vista previa del curso"
        onClose={() => setPreview(false)}
      >
        <div className="vp-admin-course-preview">
          <img src={draft.image} alt={draft.imageAlt} />
          <div className="vp-panel-body">
            <Badge>{draft.category}</Badge>
            <h3>{draft.title || "Tu próximo curso"}</h3>
            <p>
              {draft.description ||
                "Aquí aparecerá la invitación a este recorrido."}
            </p>
            <ol>
              {draft.lessons.map((lesson, i) => (
                <li key={i}>{lesson.title || "Lección sin título"}</li>
              ))}
            </ol>
            <strong>{money(draft.price)}</strong>
            <p className="vp-small-note">
              Vista de muestra. No realiza inscripciones.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ContentPages() {
  const store = useDemo();
  const [query, setQuery] = useState("");
  const pages = store.pages.filter((page) =>
    normalized(`${page.title} ${page.path}`).includes(normalized(query)),
  );
  function edit(page: ContentPage) {
    store.setSelectedPage(page.id);
    navigate("/admin/pagina");
  }
  return (
    <>
      <PageHeading
        eyebrow="CMS Vasees"
        title="Cada página, una conversación."
        description="Organiza mensajes, secciones y contenidos del ecosistema."
      />
      <div className="vp-toolbar">
        <label className="vp-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">Buscar páginas</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar una página…"
          />
        </label>
        <span className="vp-muted">{pages.length} páginas de muestra</span>
      </div>
      <div className="vp-content-grid">
        {pages.map((page) => (
          <article className="vp-panel vp-page-card" key={page.id}>
            <div>
              <span className="vp-page-icon">
                <Files size={24} weight="light" />
              </span>
              <Badge tone={statusTone(page.status)}>{page.status}</Badge>
            </div>
            <span className="vp-path">
              {page.path === "/" ? "Página de inicio" : page.path}
            </span>
            <h2>{page.title.split("|")[0].trim()}</h2>
            <p>{page.description}</p>
            <button
              className="vp-btn vp-btn-secondary"
              onClick={() => edit(page)}
            >
              Editar contenido
              <PencilSimple size={17} />
            </button>
          </article>
        ))}
      </div>
      {!pages.length && (
        <Empty
          title="No encontramos esa página."
          text="Intenta buscar por su nombre o ruta."
          action={
            <button
              className="vp-btn vp-btn-secondary"
              onClick={() => setQuery("")}
            >
              Ver todas las páginas
            </button>
          }
        />
      )}
      <div className="vp-callout">
        <strong>Una maqueta de tu futuro CMS.</strong>
        <p>
          Los textos editados se muestran en la vista previa del panel. La
          conexión con las páginas públicas y el almacenamiento se construirá en
          la fase técnica.
        </p>
      </div>
    </>
  );
}

export function PageEditor() {
  const store = useDemo();
  const original = store.pages.find((page) => page.id === store.selectedPage);
  const [draft, setDraft] = useState(
    original
      ? {
          ...original,
          sections: original.sections.map((section) => ({ ...section })),
        }
      : undefined,
  );
  const [preview, setPreview] = useState(false);
  if (!draft)
    return (
      <Empty
        title="Encuentra la página que quieres editar."
        text="Vuelve al contenido del ecosistema."
        action={
          <SiteLink href="/admin/contenido" className="vp-btn vp-btn-primary">
            Ver páginas
          </SiteLink>
        }
      />
    );
  function patch(value: Partial<ContentPage>) {
    setDraft((old) => (old ? { ...old, ...value } : old));
  }
  function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    store.setPages((old) =>
      old.map((page) => (page.id === draft.id ? draft : page)),
    );
    store.setNotice(
      "Contenido guardado en la vista previa de esta demo. La página pública no ha cambiado.",
    );
    navigate("/admin/contenido");
  }
  function move(index: number, direction: number) {
    const sections = [...draft!.sections];
    [sections[index], sections[index + direction]] = [
      sections[index + direction],
      sections[index],
    ];
    patch({ sections });
  }
  return (
    <>
      <SiteLink href="/admin/contenido" className="vp-back-link">
        <ArrowLeft size={17} />
        Páginas y contenido
      </SiteLink>
      <PageHeading
        eyebrow="Editor de página"
        title={
          draft.path === "/"
            ? "El comienzo de Vasees."
            : draft.title.split("|")[0].trim()
        }
        description={`Ruta de la página: ${draft.path}`}
        actions={
          <button
            className="vp-btn vp-btn-secondary"
            onClick={() => setPreview(true)}
          >
            <Eye size={18} />
            Vista previa de contenido
          </button>
        }
      />
      <form className="vp-editor-layout" onSubmit={save}>
        <div className="vp-form">
          <section className="vp-panel vp-panel-body vp-form">
            <h2>El mensaje principal.</h2>
            <label className="vp-field">
              Título para buscadores
              <input
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                required
                maxLength={160}
              />
            </label>
            <label className="vp-field">
              Título de la página
              <textarea
                aria-label="Título de la página"
                rows={2}
                value={draft.heading}
                onChange={(e) => patch({ heading: e.target.value })}
                required
                maxLength={200}
              />
            </label>
            <label className="vp-field">
              Descripción de la página
              <textarea
                aria-label="Descripción de la página"
                rows={3}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                required
                maxLength={500}
              />
            </label>
          </section>
          <section className="vp-panel vp-panel-body vp-form">
            <div className="vp-section-heading compact">
              <div>
                <h2>Una sección a la vez.</h2>
                <p>Edita, organiza o deja una sección en pausa.</p>
              </div>
              <button
                type="button"
                className="vp-btn vp-btn-secondary"
                onClick={() =>
                  patch({
                    sections: [
                      ...draft.sections,
                      {
                        id: uid("section"),
                        title: "Nueva sección",
                        text: "",
                        enabled: true,
                      },
                    ],
                  })
                }
              >
                <Plus size={17} />
                Añadir sección
              </button>
            </div>
            {draft.sections.map((section, index) => (
              <article className="vp-cms-section" key={section.id}>
                <div className="vp-cms-section-top">
                  <label className="vp-checkbox">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        patch({
                          sections: draft.sections.map((item) =>
                            item.id === section.id
                              ? { ...item, enabled: e.target.checked }
                              : item,
                          ),
                        })
                      }
                    />
                    Sección {index + 1} visible
                  </label>
                  <div className="vp-row-actions">
                    <button
                      type="button"
                      aria-label={`Subir sección ${index + 1}`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={17} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar sección ${index + 1}`}
                      disabled={index === draft.sections.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={17} />
                    </button>
                  </div>
                </div>
                <label className="vp-field">
                  Título de la sección {index + 1}
                  <input
                    value={section.title}
                    onChange={(e) =>
                      patch({
                        sections: draft.sections.map((item) =>
                          item.id === section.id
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                    required
                    maxLength={160}
                  />
                </label>
                <label className="vp-field">
                  Texto de la sección {index + 1}
                  <textarea
                    aria-label={`Texto de la sección ${index + 1}`}
                    rows={3}
                    value={section.text}
                    onChange={(e) =>
                      patch({
                        sections: draft.sections.map((item) =>
                          item.id === section.id
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                    maxLength={5000}
                  />
                </label>
              </article>
            ))}
          </section>
        </div>
        <aside className="vp-editor-aside">
          <section className="vp-panel vp-panel-body vp-form">
            <h2>Estado del contenido.</h2>
            <label className="vp-field">
              Estado de la página
              <select
                aria-label="Estado de la página"
                value={draft.status}
                onChange={(e) =>
                  patch({ status: e.target.value as ContentPage["status"] })
                }
              >
                <option>Publicado</option>
                <option>Borrador</option>
              </select>
            </label>
            <button className="vp-btn vp-btn-primary" type="submit">
              Guardar en la demo
              <Check size={17} />
            </button>
            <p className="vp-small-note">
              Los cambios se conservan hasta recargar. No modifican la web
              pública.
            </p>
          </section>
          <div className="vp-callout">
            <Files size={24} />
            <strong>Un CMS para todo Vasees.</strong>
            <p>
              Home, soluciones, Observatorio, iniciativas y Escuela en un mismo
              entorno de edición.
            </p>
          </div>
        </aside>
      </form>
      <Modal
        open={preview}
        title="Vista previa de contenido"
        onClose={() => setPreview(false)}
        wide
      >
        <div className="vp-cms-preview">
          <div>
            <img src="/images/vasees-logo.png" alt="Vasees" width="120" />
            <Badge>Previsualización editorial</Badge>
          </div>
          <p className="eyebrow">{draft.path}</p>
          <h3>{draft.heading}</h3>
          <p>{draft.description}</p>
          {draft.sections
            .filter((section) => section.enabled)
            .map((section) => (
              <section key={section.id}>
                <h4>{section.title}</h4>
                <p>{section.text}</p>
              </section>
            ))}
        </div>
      </Modal>
    </>
  );
}

export function MediaLibrary() {
  const store = useDemo();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Todos");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const items = store.media.filter(
    (item) =>
      (type === "Todos" || item.type === type) &&
      normalized(item.name).includes(normalized(query)),
  );
  function upload(file?: File) {
    if (!file) return;
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "application/pdf",
    ];
    if (!allowed.includes(file.type)) {
      setError("Elige una imagen PNG, JPG o WebP, un video MP4 o un PDF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Para esta demo, elige un archivo de hasta 20 MB.");
      return;
    }
    setError("");
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "document";
    store.setMedia((old) => [
      {
        id: uid("media"),
        name: file.name,
        type,
        url: type === "image" ? URL.createObjectURL(file) : "",
        label: `${(file.size / 1024).toFixed(0)} KB · Solo en esta sesión`,
        local: true,
      },
      ...old,
    ]);
    store.setNotice(
      "Archivo añadido a la biblioteca de muestra. No se ha enviado a un servidor.",
    );
    if (input.current) input.current.value = "";
  }
  return (
    <>
      <PageHeading
        eyebrow="Biblioteca de medios"
        title="Imágenes que abren una mirada."
        description="Reúne las portadas y recursos del ecosistema en un solo lugar."
        actions={
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => input.current?.click()}
          >
            <UploadSimple size={18} />
            Añadir archivo de muestra
          </button>
        }
      />
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,application/pdf"
        aria-label="Archivo para la biblioteca de muestra"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <div className="vp-upload-zone">
        <UploadSimple size={28} weight="light" />
        <div>
          <strong>Un lugar para lo que quieres compartir.</strong>
          <p>Imágenes, PDF y video MP4 · Hasta 20 MB en esta demo.</p>
        </div>
        <span>Los archivos no se suben a un servidor.</span>
      </div>
      {error && (
        <p className="vp-form-error" role="alert">
          {error}
        </p>
      )}
      <div className="vp-toolbar">
        <label className="vp-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">Buscar medios</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la biblioteca…"
          />
        </label>
        <label className="vp-select-filter">
          <span>Tipo</span>
          <select
            aria-label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Todos</option>
            <option value="image">Imágenes</option>
            <option value="video">Videos</option>
            <option value="document">Documentos</option>
          </select>
        </label>
      </div>
      <div className="vp-media-grid">
        {items.map((item) => (
          <button
            className="vp-panel vp-media-card"
            key={item.id}
            onClick={() => setSelected(item)}
          >
            <div>
              {item.type === "image" ? (
                <img src={item.url} alt={item.name} />
              ) : item.type === "video" ? (
                <VideoCamera size={44} weight="light" />
              ) : (
                <FileText size={44} weight="light" />
              )}
              {item.local && <Badge tone="ivory">Local · Demo</Badge>}
            </div>
            <span>
              <strong>{item.name}</strong>
              <small>{item.label}</small>
            </span>
          </button>
        ))}
      </div>
      {!items.length && (
        <Empty
          title="Aquí hay espacio para nuevas ideas."
          text="Prueba otro filtro o añade un recurso de muestra."
        />
      )}
      <Modal
        open={Boolean(selected)}
        title="Detalle del recurso"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="vp-media-detail vp-panel-body">
            {selected.type === "image" ? (
              <img src={selected.url} alt={selected.name} />
            ) : (
              <FileText size={60} weight="light" />
            )}
            <h3>{selected.name}</h3>
            <p>{selected.label}</p>
            <Badge>
              {selected.local
                ? "Recurso local de muestra"
                : "Recurso del sitio"}
            </Badge>
            <p className="vp-small-note">
              {selected.local
                ? "Solo está disponible en esta sesión del navegador."
                : "Las imágenes pueden elegirse como portada en el editor de cursos."}
            </p>
            {selected.local && (
              <button
                className="vp-btn vp-btn-secondary"
                onClick={() => {
                  store.setMedia((old) =>
                    old.filter((item) => item.id !== selected.id),
                  );
                  setSelected(null);
                  store.setNotice(
                    "Recurso local eliminado de esta biblioteca de muestra.",
                  );
                }}
              >
                <Trash size={17} />
                Quitar de la demo
              </button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export function AdminUsers() {
  const store = useDemo();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DemoUser | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Estudiante");
  const [status, setStatus] = useState("Pendiente");
  const [error, setError] = useState("");
  function modal(user?: DemoUser) {
    setEditing(user ?? null);
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setRole(user?.role ?? "Estudiante");
    setStatus(user?.status ?? "Pendiente");
    setError("");
    setOpen(true);
  }
  function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      store.users.some(
        (user) =>
          user.id !== editing?.id &&
          user.email.toLowerCase() === email.toLowerCase(),
      )
    ) {
      setError("Ese correo ya aparece en la lista de muestra.");
      return;
    }
    const record = {
      id: editing?.id ?? uid("user"),
      name,
      email,
      role,
      status,
      courses: editing?.courses ?? 0,
    };
    store.setUsers((old) =>
      editing
        ? old.map((user) => (user.id === editing.id ? record : user))
        : [record, ...old],
    );
    setOpen(false);
    store.setNotice(
      editing
        ? "Perfil de muestra actualizado. No se cambiaron permisos reales."
        : "Invitación simulada añadida a la lista. No se envió ningún correo.",
    );
  }
  const users = store.users.filter((user) =>
    normalized(`${user.name} ${user.email} ${user.role}`).includes(
      normalized(query),
    ),
  );
  return (
    <>
      <PageHeading
        eyebrow="Personas y acceso"
        title="Las personas hacen la Escuela."
        description="Un recorrido visual por los perfiles, roles e invitaciones."
        actions={
          <button className="vp-btn vp-btn-primary" onClick={() => modal()}>
            <Plus size={18} />
            Simular invitación
          </button>
        }
      />
      <div className="vp-toolbar">
        <label className="vp-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">Buscar personas</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o rol…"
          />
        </label>
        <span className="vp-muted">Perfiles ficticios de demostración</span>
      </div>
      <div className="vp-panel vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Cursos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="vp-person">
                    <span className="vp-avatar">
                      {user.name
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </span>
                  </div>
                </td>
                <td>{user.role}</td>
                <td>
                  <Badge tone={statusTone(user.status)}>{user.status}</Badge>
                </td>
                <td>{user.courses}</td>
                <td>
                  <button
                    className="vp-table-action"
                    onClick={() => modal(user)}
                  >
                    Editar perfil
                    <PencilSimple size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <Empty
            title="No encontramos ese perfil."
            text="Prueba otro nombre o correo de muestra."
          />
        )}
      </div>
      <div className="vp-callout">
        <ShieldCheck size={24} />
        <strong>Roles preparados para la siguiente fase.</strong>
        <p>
          Este panel no protege rutas ni otorga permisos reales. Los roles,
          sesiones y validaciones se implementarán en el backend; Resend se
          reservará para códigos y mensajes.
        </p>
      </div>
      <Modal
        open={open}
        title={editing ? "Editar perfil de muestra" : "Simular una invitación"}
        onClose={() => setOpen(false)}
      >
        <form className="vp-panel-body vp-form" onSubmit={save}>
          <label className="vp-field">
            Nombre de muestra
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label className="vp-field">
            Correo de muestra
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={180}
              placeholder="persona@example.com"
            />
          </label>
          <div className="vp-form-grid">
            <label className="vp-field">
              Rol
              <select
                aria-label="Rol"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Estudiante</option>
                <option>Editor de contenido</option>
                <option>Administrador</option>
              </select>
            </label>
            <label className="vp-field">
              Estado
              <select
                aria-label="Estado"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Pendiente</option>
                <option>Activo</option>
                <option>Suspendido</option>
              </select>
            </label>
          </div>
          {error && (
            <p className="vp-form-error" role="alert">
              {error}
            </p>
          )}
          <p className="vp-small-note">
            Solo se añade o actualiza un registro temporal. No se crea una
            cuenta ni se envía un mensaje.
          </p>
          <button type="submit" className="vp-btn vp-btn-primary">
            {editing
              ? "Guardar perfil de muestra"
              : "Crear invitación de muestra"}
            <ArrowRight size={18} />
          </button>
        </form>
      </Modal>
    </>
  );
}

export function AdminPayments() {
  const store = useDemo();
  const [status, setStatus] = useState("Todos");
  const [receipt, setReceipt] = useState<DemoOrder | null>(null);
  const orders = store.orders.filter(
    (order) => status === "Todos" || order.status === status,
  );
  return (
    <>
      <PageHeading
        eyebrow="Pagos e inscripciones"
        title="Una mirada a cada operación."
        description="Explora el registro de pagos simulados. No hay dinero recibido ni movimientos bancarios."
      />
      <div className="vp-stat-grid three">
        <div>
          <span>Operaciones de muestra</span>
          <strong>{store.orders.length}</strong>
          <small>Datos ilustrativos</small>
        </div>
        <div>
          <span>Resultado aprobado</span>
          <strong>
            {store.orders.filter((order) => order.status === "Simulado").length}
          </strong>
          <small>Sin cobro real</small>
        </div>
        <div>
          <span>Resultado rechazado</span>
          <strong>
            {
              store.orders.filter((order) => order.status === "Rechazado")
                .length
            }
          </strong>
          <small>Ejemplo de estado</small>
        </div>
      </div>
      <div className="vp-toolbar">
        <label className="vp-select-filter">
          <span>Estado</span>
          <select
            aria-label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Todos</option>
            <option>Simulado</option>
            <option>Rechazado</option>
          </select>
        </label>
        <Badge tone="pending">Pasarela por conectar</Badge>
      </div>
      <div className="vp-panel vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Participante</th>
              <th>Curso</th>
              <th>Valor de muestra</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.id}</strong>
                  <small>{order.date}</small>
                </td>
                <td>{order.name}</td>
                <td>
                  {store.courses.find((course) => course.id === order.courseId)
                    ?.title ?? "Curso de muestra"}
                </td>
                <td>{money(order.amount)}</td>
                <td>
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </td>
                <td>
                  <button
                    className="vp-table-action"
                    onClick={() => setReceipt(order)}
                  >
                    Ver detalle
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && (
          <Empty
            title="Sin operaciones para este estado."
            text="Cambia el filtro para ver los registros de muestra."
          />
        )}
      </div>
      <Modal
        open={Boolean(receipt)}
        title="Detalle de pago simulado"
        onClose={() => setReceipt(null)}
      >
        {receipt && (
          <div className="vp-panel-body vp-receipt">
            <Badge>Operación de muestra</Badge>
            <h3>{receipt.id}</h3>
            <dl>
              <div>
                <dt>Participante</dt>
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
                <dt>Valor ilustrativo</dt>
                <dd>{money(receipt.amount)}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{receipt.status}</dd>
              </div>
            </dl>
            <p>
              No es un recibo fiscal. No hay un cobro, un reembolso ni un correo
              asociado a este registro.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

export function AdminMessages() {
  const store = useDemo();
  const [selected, setSelected] = useState(store.templates[0].id);
  const [preview, setPreview] = useState(false);
  const template = store.templates.find((item) => item.id === selected)!;
  function patch(value: Partial<typeof template>) {
    store.setTemplates((old) =>
      old.map((item) => (item.id === selected ? { ...item, ...value } : item)),
    );
  }
  const render = (value: string) =>
    value
      .replaceAll("{nombre}", "Laura")
      .replaceAll("{codigo}", "123456")
      .replaceAll("{curso}", "Cuidar sin dejar de vivir");
  return (
    <>
      <PageHeading
        eyebrow="Correos y códigos"
        title="Cada mensaje también cuida."
        description="Prepara la voz de Vasees para acompañar el acceso y el aprendizaje."
        actions={
          <button
            className="vp-btn vp-btn-secondary"
            onClick={() => setPreview(true)}
          >
            <Eye size={18} />
            Ver correo de muestra
          </button>
        }
      />
      <div className="vp-provider-card">
        <span className="vp-provider-logo">R</span>
        <div>
          <h2>Resend</h2>
          <p>Proveedor previsto para códigos y correos transaccionales.</p>
        </div>
        <Badge tone="pending">Sin conectar</Badge>
        <span>No hay envíos activos</span>
      </div>
      <div className="vp-message-layout">
        <nav
          className="vp-panel vp-message-list"
          aria-label="Plantillas de correo"
        >
          {store.templates.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              aria-current={selected === item.id ? "true" : undefined}
            >
              <EnvelopeSimple size={21} weight="light" />
              <span>
                <strong>{item.name}</strong>
                <small>Plantilla de muestra</small>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
        </nav>
        <section className="vp-panel vp-panel-body vp-form">
          <h2>{template.name}</h2>
          <label className="vp-field">
            Asunto del correo
            <input
              value={template.subject}
              onChange={(e) => patch({ subject: e.target.value })}
              maxLength={180}
            />
          </label>
          <label className="vp-field">
            Contenido del correo
            <textarea
              aria-label="Contenido del correo"
              rows={12}
              value={template.body}
              onChange={(e) => patch({ body: e.target.value })}
              maxLength={10000}
            />
          </label>
          <div className="vp-variable-list">
            <span>Variables de muestra</span>
            {["{nombre}", "{codigo}", "{curso}"].map((variable) => (
              <code key={variable}>{variable}</code>
            ))}
          </div>
          <div className="vp-form-actions">
            <button
              className="vp-btn vp-btn-primary"
              onClick={() =>
                store.setNotice(
                  "Plantilla conservada en esta demo. No se envió ningún correo.",
                )
              }
            >
              <Check size={17} />
              Guardar plantilla de muestra
            </button>
            <button
              className="vp-btn vp-btn-secondary"
              onClick={() => setPreview(true)}
            >
              <Eye size={17} />
              Previsualizar
            </button>
          </div>
        </section>
      </div>
      <div className="vp-callout">
        <ShieldCheck size={24} />
        <strong>
          Resend enviará los mensajes; el backend validará el acceso.
        </strong>
        <p>
          En la fase técnica se configurarán códigos, caducidad, límites de
          intentos y permisos en el servidor. Esta vista solo muestra las
          plantillas; 123456 es un código fijo para la demo.
        </p>
      </div>
      <Modal
        open={preview}
        title="Vista previa del correo"
        onClose={() => setPreview(false)}
        wide
      >
        <div className="vp-email-preview">
          <div className="vp-email-envelope">
            <p>
              <strong>Para</strong> Laura · laura@example.com
            </p>
            <p>
              <strong>Asunto</strong> {render(template.subject)}
            </p>
            <Badge>Vista previa · No enviado</Badge>
          </div>
          <div className="vp-email-paper">
            <img src="/images/vasees-logo.png" alt="Vasees" width="140" />
            <p>{render(template.body)}</p>
            <span>Más años. Más futuro.</span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function AdminSettings() {
  const store = useDemo();
  const [tab, setTab] = useState("Identidad");
  const [settings, setSettings] = useState({
    ...store.settings,
    menu: store.settings.menu.map((item) => ({ ...item })),
  });
  function move(index: number, direction: number) {
    const menu = [...settings.menu];
    [menu[index], menu[index + direction]] = [
      menu[index + direction],
      menu[index],
    ];
    setSettings({ ...settings, menu });
  }
  function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    store.setSettings(settings);
    store.setNotice(
      "Configuración guardada en esta demo. La navegación pública no ha cambiado.",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="Configuración general"
        title="La casa de todas las ideas."
        description="Identidad, navegación y una vista de las integraciones que vendrán."
      />
      <section className="vp-panel">
        <div
          className="vp-tab-bar"
          role="group"
          aria-label="Secciones de configuración"
        >
          {["Identidad", "Navegación", "Acceso e integraciones"].map((item) => (
            <button
              key={item}
              aria-pressed={tab === item}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <form
          className="vp-panel-body vp-form vp-settings-form"
          onSubmit={save}
        >
          {tab === "Identidad" ? (
            <>
              <h2>Esto es Vasees.</h2>
              <div className="vp-settings-logo">
                <img src="/images/vasees-logo.png" alt="Vasees" width="180" />
                <span>Logo del sitio · Sin eslogan</span>
              </div>
              <div className="vp-form-grid">
                <label className="vp-field">
                  Nombre del sitio
                  <input
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    required
                    maxLength={80}
                  />
                </label>
                <label className="vp-field">
                  Correo de contacto propuesto
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    required
                    maxLength={180}
                  />
                </label>
              </div>
              <p className="vp-small-note">
                El correo de contacto no configura un remitente ni verifica un
                dominio en Resend.
              </p>
            </>
          ) : tab === "Navegación" ? (
            <>
              <h2>Un mapa para encontrarnos.</h2>
              <p className="vp-muted">
                Prepara las etiquetas y el orden del menú principal. La
                aplicación al sitio será parte de la fase técnica.
              </p>
              <div className="vp-navigation-editor">
                {settings.menu.map((item, index) => (
                  <div key={item.path}>
                    <label className="vp-field">
                      Etiqueta {index + 1}
                      <input
                        value={item.label}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            menu: settings.menu.map((entry, i) =>
                              i === index
                                ? { ...entry, label: e.target.value }
                                : entry,
                            ),
                          })
                        }
                        required
                        maxLength={35}
                      />
                    </label>
                    <span>{item.path}</span>
                    <label className="vp-checkbox">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            menu: settings.menu.map((entry, i) =>
                              i === index
                                ? { ...entry, visible: e.target.checked }
                                : entry,
                            ),
                          })
                        }
                      />
                      Visible
                    </label>
                    <div className="vp-row-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label={`Subir enlace ${index + 1}`}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp size={17} />
                      </button>
                      <button
                        type="button"
                        disabled={index === settings.menu.length - 1}
                        aria-label={`Bajar enlace ${index + 1}`}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="vp-menu-preview">
                <span>Vista previa del menú</span>
                <div>
                  {settings.menu
                    .filter((item) => item.visible)
                    .map((item) => (
                      <span key={item.path}>{item.label}</span>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>Preparado para la siguiente fase.</h2>
              <div className="vp-integration-list">
                {[
                  {
                    title: "Códigos y correos · Resend",
                    text: "Será el único proveedor de correo transaccional. Falta configurar remitente y dominio.",
                  },
                  {
                    title: "Identidad, sesiones y permisos",
                    text: "Requieren un backend para validar el acceso y proteger contenido y administración.",
                  },
                  {
                    title: "Pasarela de pago",
                    text: "La pasarela, confirmaciones y conciliación están pendientes de integración.",
                  },
                  {
                    title: "Contenido y archivos",
                    text: "El CMS y los recursos necesitan almacenamiento y permisos del servidor.",
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <ShieldCheck size={22} weight="light" />
                    <span>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </span>
                    <Badge tone="pending">Por conectar</Badge>
                  </div>
                ))}
              </div>
              <h3>Roles propuestos</h3>
              <div className="vp-table-wrap">
                <table className="vp-table">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Recorrido previsto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Estudiante</td>
                      <td>Sus cursos, progreso, perfil y pagos</td>
                    </tr>
                    <tr>
                      <td>Editor de contenido</td>
                      <td>Preparar cursos, páginas y medios</td>
                    </tr>
                    <tr>
                      <td>Administrador</td>
                      <td>Contenido, personas y configuración</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="vp-small-note">
                Este cuadro es una propuesta visual, no una política de permisos
                implementada.
              </p>
            </>
          )}
          {tab !== "Acceso e integraciones" && (
            <button className="vp-btn vp-btn-primary" type="submit">
              Guardar configuración de muestra
              <Check size={17} />
            </button>
          )}
        </form>
      </section>
    </>
  );
}
