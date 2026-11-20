import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  ChatCircle,
  CheckCircle,
  DownloadSimple,
  Flag,
  MapPin,
  PencilSimple,
  Plus,
  ShieldCheck,
  Users,
  VideoCamera,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { useDemo } from "./demo-store";
import { SiteLink, navigate } from "../navigation";
import { Badge, Empty, Modal, PageHeading } from "./shared";
import {
  forumGuidelines,
  forumName,
  reportReasons,
  type Encuentro,
  type ForumThread,
} from "../content/community";
import {
  bogotaParts,
  bogotaToUtc,
  formatBogota,
  googleCalendarUrl,
  icsFile,
  icsFileName,
  outlookCalendarUrl,
  yahooCalendarUrl,
} from "../content/calendar";

const isPast = (item: Encuentro) => new Date(item.end).getTime() < Date.now();
const seatsTaken = (item: Encuentro, mine: boolean) =>
  item.others + (mine ? 1 : 0);

function dayBlock(iso: string) {
  const parts = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  }).formatToParts(new Date(iso));
  return {
    day: parts.find((p) => p.type === "day")?.value ?? "",
    month: (parts.find((p) => p.type === "month")?.value ?? "").replace(".", ""),
  };
}

function endTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(iso));
}

/** Google, Outlook, Microsoft 365 and Yahoo links, plus a real .ics download. */
function AddToCalendar({ item }: { item: Encuentro }) {
  const event = {
    id: item.id,
    title: item.title,
    description: item.description,
    location: item.location,
    start: item.start,
    end: item.end,
  };
  function download() {
    const url = URL.createObjectURL(
      new Blob([icsFile(event)], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = icsFileName(event);
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const links = [
    ["Google Calendar", googleCalendarUrl(event)],
    ["Outlook.com", outlookCalendarUrl(event, "outlook.live.com")],
    ["Microsoft 365", outlookCalendarUrl(event, "outlook.office.com")],
    ["Yahoo Calendar", yahooCalendarUrl(event)],
  ];
  return (
    <details className="vp-calendar-menu">
      <summary>
        <CalendarPlus size={19} />
        Agregar a mi calendario
      </summary>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={download}>
            <DownloadSimple size={18} />
            Descargar archivo .ics
          </button>
        </li>
      </ul>
      <p>
        El archivo .ics funciona con Apple Calendar y con la mayoría de
        calendarios.
      </p>
    </details>
  );
}

function EncuentroCard({ item }: { item: Encuentro }) {
  const store = useDemo();
  const mine = store.myEncuentros.includes(item.id);
  const taken = seatsTaken(item, mine);
  const full = taken >= item.capacity;
  const past = isPast(item);
  const cancelled = item.status === "Cancelado";
  const course = store.courses.find((c) => c.id === item.courseId);
  const day = dayBlock(item.start);
  const headingId = `enc-${item.id}`;
  return (
    <article className="vp-encuentro" aria-labelledby={headingId}>
      <div className="vp-encuentro-date" aria-hidden="true">
        <strong>{day.day}</strong>
        <span>{day.month}</span>
      </div>
      <div className="vp-encuentro-body">
        <div className="vp-encuentro-tags">
          <Badge tone="ivory">
            {item.format === "En línea" ? (
              <VideoCamera size={15} />
            ) : (
              <MapPin size={15} />
            )}
            {item.format}
          </Badge>
          {cancelled ? (
            <Badge tone="danger">Cancelado</Badge>
          ) : mine ? (
            <Badge tone="success">Inscripción confirmada</Badge>
          ) : full ? (
            <Badge tone="pending">Cupo completo</Badge>
          ) : item.capacity - taken <= 3 ? (
            <Badge tone="pending">Últimos cupos</Badge>
          ) : null}
        </div>
        <h3 id={headingId}>{item.title}</h3>
        <p className="vp-encuentro-when">
          <span className="vp-capitalize">{formatBogota(item.start)}</span> a{" "}
          {endTime(item.end)} · Hora de Colombia
        </p>
        <p>{item.description}</p>
        <ul className="vp-encuentro-meta">
          <li>
            <MapPin size={17} />
            {item.location}
          </li>
          <li>
            <Users size={17} />
            {taken} de {item.capacity} cupos
          </li>
          {course && (
            <li>
              <ChatCircle size={17} />
              Relacionado con {course.title}
            </li>
          )}
        </ul>
        {!cancelled && !past && (
          <div className="vp-encuentro-actions">
            {mine ? (
              <>
                <AddToCalendar item={item} />
                <button
                  className="vp-btn vp-btn-ghost"
                  aria-label={`Cancelar inscripción: ${item.title}`}
                  onClick={() => {
                    store.setMyEncuentros((old) =>
                      old.filter((id) => id !== item.id),
                    );
                    store.setNotice("Cancelaste tu inscripción de muestra.");
                  }}
                >
                  Cancelar inscripción
                </button>
              </>
            ) : (
              <button
                className="vp-btn vp-btn-primary"
                disabled={full}
                aria-label={`${full ? "Sin cupos disponibles" : "Inscribirme"}: ${item.title}`}
                onClick={() => {
                  store.setMyEncuentros((old) => [...old, item.id]);
                  store.setNotice(
                    "Inscripción de muestra confirmada. Ya puedes agregar el encuentro a tu calendario.",
                  );
                }}
              >
                {full ? "Sin cupos disponibles" : "Inscribirme"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function StudentEncuentros() {
  const store = useDemo();
  const [tab, setTab] = useState("Próximos");
  const visible = store.encuentros
    .filter((item) => item.status !== "Borrador")
    .sort((a, b) => a.start.localeCompare(b.start));
  const shown = visible.filter((item) =>
    tab === "Mis encuentros"
      ? store.myEncuentros.includes(item.id)
      : tab === "Anteriores"
        ? isPast(item)
        : !isPast(item),
  );
  return (
    <>
      <PageHeading
        eyebrow="Aprender también es encontrarnos"
        title="Encuentros."
        description="Conversaciones en vivo y presenciales de la Escuela. Inscríbete y agrégalas a tu calendario."
      />
      <div className="vp-tab-bar" role="group" aria-label="Filtrar encuentros">
        {["Próximos", "Mis encuentros", "Anteriores"].map((item) => (
          <button
            key={item}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "Mis encuentros" && store.myEncuentros.length > 0
              ? ` (${store.myEncuentros.length})`
              : ""}
          </button>
        ))}
      </div>
      <h2 className="sr-only">{tab}</h2>
      {shown.length ? (
        <div className="vp-encuentro-list">
          {shown.map((item) => (
            <EncuentroCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "Mis encuentros"
              ? "Aún no te inscribes en un encuentro."
              : "No hay encuentros en esta lista."
          }
          text="Los próximos encuentros aparecen en la pestaña Próximos."
          action={
            tab !== "Próximos" ? (
              <button
                className="vp-btn vp-btn-primary"
                onClick={() => setTab("Próximos")}
              >
                Ver próximos encuentros
              </button>
            ) : undefined
          }
        />
      )}
      <p className="vp-community-note">
        <ShieldCheck size={20} weight="light" />
        Inscripciones de muestra: no se envían confirmaciones ni enlaces reales.
        Los enlaces de calendario sí funcionan.
      </p>
    </>
  );
}

function Guidelines() {
  return (
    <aside className="vp-guidelines" aria-labelledby="vp-guidelines-title">
      <h2 id="vp-guidelines-title">
        <ShieldCheck size={20} weight="light" />
        Normas de convivencia
      </h2>
      <ul>
        {forumGuidelines.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </aside>
  );
}

function useForumOptions() {
  const store = useDemo();
  return [
    { value: "", label: "Foro general de la Escuela" },
    ...store.courses
      .filter((course) => course.status === "Publicado")
      .map((course) => ({ value: course.id, label: course.title })),
  ];
}

export function Community() {
  const store = useDemo();
  const options = useForumOptions();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [forum, setForum] = useState(
    store.forumFilter === "todos" ? "" : store.forumFilter,
  );
  const [error, setError] = useState("");
  const threads = store.threads.filter(
    (thread) =>
      thread.status === "Visible" &&
      (store.forumFilter === "todos" || thread.courseId === store.forumFilter),
  );
  function open(thread: ForumThread) {
    store.setSelectedThread(thread.id);
    navigate("/escuela/conversacion");
  }
  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 5 || body.trim().length < 10) {
      setError("Escribe un título de al menos 5 caracteres y un mensaje de al menos 10.");
      return;
    }
    const thread: ForumThread = {
      id: `th-${Date.now()}`,
      courseId: forum,
      title: title.trim(),
      body: body.trim(),
      author: forumName(store.session?.name ?? "Laura Gómez"),
      status: "Visible",
      replies: [],
      mine: true,
    };
    store.setThreads((old) => [thread, ...old]);
    setCreating(false);
    setTitle("");
    setBody("");
    setError("");
    store.setNotice("Conversación de muestra publicada en la comunidad.");
    open(thread);
  }
  return (
    <>
      <PageHeading
        eyebrow="Preguntas que se responden mejor en compañía"
        title="Comunidad."
        description="Foros por curso y un foro general para compartir experiencias con otras personas de la Escuela."
        actions={
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => setCreating(true)}
          >
            <Plus size={18} />
            Abrir una conversación
          </button>
        }
      />
      <div className="vp-community-layout">
        <section aria-labelledby="vp-threads-title">
          <div className="vp-community-toolbar">
            <h2 id="vp-threads-title">Conversaciones</h2>
            <label className="vp-field vp-inline-field">
              Foro
              <select
                aria-label="Foro"
                value={store.forumFilter}
                onChange={(event) => store.setForumFilter(event.target.value)}
              >
                <option value="todos">Todos los foros</option>
                {options.map((option) => (
                  <option key={option.value || "general"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {threads.length ? (
            <ul className="vp-thread-list">
              {threads.map((thread) => {
                const replies = thread.replies.filter(
                  (reply) => reply.status === "Visible",
                ).length;
                return (
                  <li key={thread.id}>
                    <button onClick={() => open(thread)}>
                      <span className="vp-thread-forum">
                        {options.find((o) => o.value === thread.courseId)
                          ?.label ?? "Foro general de la Escuela"}
                      </span>
                      <strong>{thread.title}</strong>
                      <span className="vp-thread-meta">
                        {thread.author} ·{" "}
                        {replies === 1 ? "1 respuesta" : `${replies} respuestas`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty
              title="Este foro todavía está en silencio."
              text="Puedes abrir la primera conversación."
              action={
                <button
                  className="vp-btn vp-btn-primary"
                  onClick={() => {
                    setForum(store.forumFilter === "todos" ? "" : store.forumFilter);
                    setCreating(true);
                  }}
                >
                  Abrir una conversación
                </button>
              }
            />
          )}
        </section>
        <Guidelines />
      </div>
      <Modal
        open={creating}
        title="Abrir una conversación"
        onClose={() => setCreating(false)}
      >
        <form className="vp-form vp-panel-body vp-community-form" onSubmit={create}>
          <label className="vp-field">
            Foro
            <select
              aria-label="Foro"
              value={forum}
              onChange={(event) => setForum(event.target.value)}
            >
              {options.map((option) => (
                <option key={option.value || "general"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="vp-field">
            Título
            <input
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="vp-field">
            Tu mensaje
            <textarea
              rows={5}
              maxLength={2000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          {error && (
            <div className="vp-form-error" role="alert">
              <WarningCircle size={20} />
              {error}
            </div>
          )}
          <p className="vp-small-note">
            Se mostrará como «{forumName(store.session?.name ?? "Laura Gómez")}».
            No compartas datos personales.
          </p>
          <button className="vp-btn vp-btn-primary" type="submit">
            Publicar conversación
          </button>
        </form>
      </Modal>
    </>
  );
}

type ReportTarget = { threadId: string; replyId?: string };

function ReportDialog({
  target,
  onClose,
}: {
  target: ReportTarget | null;
  onClose: () => void;
}) {
  const store = useDemo();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;
    if (!reason) {
      setError("Elige un motivo para el reporte.");
      return;
    }
    store.setReports((old) => [
      ...old,
      {
        id: `rep-${Date.now()}`,
        ...target,
        reason,
        status: "Pendiente",
        mine: true,
      },
    ]);
    store.setNotice("Gracias. El equipo de la Escuela revisará este mensaje.");
    setReason("");
    setError("");
    onClose();
  }
  return (
    <Modal open={Boolean(target)} title="Reportar mensaje" onClose={onClose}>
      <form className="vp-form vp-panel-body vp-community-form" onSubmit={send}>
        <fieldset className="vp-choice-group">
          <legend>¿Por qué quieres reportarlo?</legend>
          {reportReasons.map((item) => (
            <label className="vp-choice" key={item}>
              <input
                type="radio"
                name="report-reason"
                checked={reason === item}
                onChange={() => setReason(item)}
              />
              <span>
                <strong>{item}</strong>
              </span>
            </label>
          ))}
        </fieldset>
        {error && (
          <div className="vp-form-error" role="alert">
            <WarningCircle size={20} />
            {error}
          </div>
        )}
        <p className="vp-small-note">
          Tu reporte es confidencial: la persona que escribió el mensaje no sabrá
          quién lo reportó.
        </p>
        <button className="vp-btn vp-btn-primary" type="submit">
          Enviar reporte
        </button>
      </form>
    </Modal>
  );
}

function Message({
  author,
  body,
  hidden,
  reported,
  mine,
  onReport,
  label,
}: {
  author: string;
  body: string;
  hidden: boolean;
  reported: boolean;
  mine?: boolean;
  onReport: () => void;
  label: string;
}) {
  if (hidden)
    return (
      <div className="vp-message vp-message-hidden">
        <p>Este mensaje fue ocultado por moderación.</p>
      </div>
    );
  return (
    <div className="vp-message">
      <div className="vp-message-head">
        <strong>{author}</strong>
        {mine && <Badge tone="ivory">Tú</Badge>}
      </div>
      <p>{body}</p>
      {!mine &&
        (reported ? (
          <span className="vp-message-reported">
            <Flag size={16} />
            Reportaste este mensaje
          </span>
        ) : (
          <button
            className="vp-text-button vp-report-button"
            aria-label={`Reportar ${label}`}
            onClick={onReport}
          >
            <Flag size={16} />
            Reportar
          </button>
        ))}
    </div>
  );
}

export function ThreadView() {
  const store = useDemo();
  const thread = store.threads.find((item) => item.id === store.selectedThread);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const options = useForumOptions();
  if (!thread || thread.status === "Oculto")
    return (
      <Empty
        title="Esta conversación no está disponible."
        text="Puede que la hayan ocultado por moderación."
        action={
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate("/escuela/comunidad")}
          >
            Volver a la comunidad
          </button>
        }
      />
    );
  const reported = (replyId?: string) =>
    store.reports.some(
      (report) =>
        report.threadId === thread.id &&
        report.replyId === replyId &&
        report.status === "Pendiente" &&
        report.mine,
    );
  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!thread) return;
    if (reply.trim().length < 2) {
      setError("Escribe tu respuesta antes de publicarla.");
      return;
    }
    store.setThreads((old) =>
      old.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              replies: [
                ...item.replies,
                {
                  id: `rp-${Date.now()}`,
                  author: forumName(store.session?.name ?? "Laura Gómez"),
                  body: reply.trim(),
                  status: "Visible",
                  mine: true,
                },
              ],
            }
          : item,
      ),
    );
    setReply("");
    setError("");
    store.setNotice("Respuesta de muestra publicada.");
  }
  const visibleReplies = thread.replies.length;
  return (
    <>
      <SiteLink className="vp-back-link" href="/escuela/comunidad">
        <ArrowLeft size={17} />
        Comunidad
      </SiteLink>
      <PageHeading
        eyebrow={
          options.find((o) => o.value === thread.courseId)?.label ??
          "Foro general de la Escuela"
        }
        title={thread.title}
      />
      <div className="vp-community-layout">
        <section className="vp-thread" aria-label="Mensajes de la conversación">
          <Message
            author={thread.author}
            body={thread.body}
            hidden={false}
            reported={reported(undefined)}
            mine={thread.mine}
            label="la conversación"
            onReport={() => setTarget({ threadId: thread.id })}
          />
          <h2 className="vp-thread-count">
            {visibleReplies === 1 ? "1 respuesta" : `${visibleReplies} respuestas`}
          </h2>
          {thread.replies.map((item) => (
            <Message
              key={item.id}
              author={item.author}
              body={item.body}
              hidden={item.status === "Oculto"}
              reported={reported(item.id)}
              mine={item.mine}
              label={`la respuesta de ${item.author}`}
              onReport={() => setTarget({ threadId: thread.id, replyId: item.id })}
            />
          ))}
          <form className="vp-form vp-reply-form" onSubmit={send}>
            <label className="vp-field">
              Tu respuesta
              <textarea
                rows={4}
                maxLength={2000}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
            </label>
            {error && (
              <div className="vp-form-error" role="alert">
                <WarningCircle size={20} />
                {error}
              </div>
            )}
            <button className="vp-btn vp-btn-primary" type="submit">
              Publicar respuesta
              <ArrowRight size={18} />
            </button>
          </form>
        </section>
        <Guidelines />
      </div>
      <ReportDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}

const emptyDraft = {
  title: "",
  description: "",
  format: "En línea" as Encuentro["format"],
  location: "En línea · el enlace se envía a las personas inscritas",
  date: "",
  startTime: "18:00",
  endTime: "19:00",
  capacity: 30,
  courseId: "",
  status: "Borrador" as Encuentro["status"],
};

export function AdminEncuentros() {
  const store = useDemo();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  const list = [...store.encuentros].sort((a, b) => a.start.localeCompare(b.start));
  function start(item?: Encuentro) {
    setError("");
    if (!item) {
      setDraft(emptyDraft);
      setEditing("new");
      return;
    }
    const begin = bogotaParts(item.start);
    setDraft({
      title: item.title,
      description: item.description,
      format: item.format,
      location: item.location,
      date: begin.date,
      startTime: begin.time,
      endTime: bogotaParts(item.end).time,
      capacity: item.capacity,
      courseId: item.courseId,
      status: item.status,
    });
    setEditing(item.id);
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = !draft.title.trim()
      ? "Escribe el título del encuentro."
      : !draft.date
        ? "Elige la fecha del encuentro."
        : draft.endTime <= draft.startTime
          ? "La hora de cierre debe ser posterior a la de inicio."
          : draft.capacity < 1
            ? "El cupo debe ser de al menos 1 persona."
            : !draft.location.trim()
              ? "Indica el lugar o el formato en línea."
              : "";
    if (problem) {
      setError(problem);
      return;
    }
    const values = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      format: draft.format,
      location: draft.location.trim(),
      start: bogotaToUtc(draft.date, draft.startTime),
      end: bogotaToUtc(draft.date, draft.endTime),
      capacity: draft.capacity,
      courseId: draft.courseId,
      status: draft.status,
    };
    store.setEncuentros((old) =>
      editing === "new"
        ? [...old, { id: `enc-${Date.now()}`, others: 0, ...values }]
        : old.map((item) => (item.id === editing ? { ...item, ...values } : item)),
    );
    store.setNotice(
      editing === "new" ? "Encuentro de muestra creado." : "Encuentro actualizado.",
    );
    setEditing(null);
  }
  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((old) => ({ ...old, [key]: value }));
  return (
    <>
      <PageHeading
        eyebrow="Escuela de Familia y Longevidad"
        title="Encuentros."
        description="Programa sesiones en vivo o presenciales. La hora se guarda en hora de Colombia."
        actions={
          <button className="vp-btn vp-btn-primary" onClick={() => start()}>
            <Plus size={18} />
            Crear encuentro
          </button>
        }
      />
      <div className="vp-panel vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Encuentro</th>
              <th>Fecha</th>
              <th>Cupos</th>
              <th>Estado</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => {
              const taken = seatsTaken(item, store.myEncuentros.includes(item.id));
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <small>{item.format}</small>
                  </td>
                  <td className="vp-capitalize">{formatBogota(item.start)}</td>
                  <td>
                    {taken} de {item.capacity}
                  </td>
                  <td>
                    <Badge
                      tone={
                        item.status === "Publicado"
                          ? "success"
                          : item.status === "Cancelado"
                            ? "danger"
                            : "pending"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="vp-row-actions">
                      <button
                        aria-label={`Editar ${item.title}`}
                        title="Editar encuentro"
                        onClick={() => start(item)}
                      >
                        <PencilSimple size={19} />
                      </button>
                      <button
                        aria-label={`Cancelar ${item.title}`}
                        title="Cancelar encuentro"
                        disabled={item.status === "Cancelado"}
                        onClick={() => {
                          store.setEncuentros((old) =>
                            old.map((e) =>
                              e.id === item.id ? { ...e, status: "Cancelado" } : e,
                            ),
                          );
                          store.setNotice(
                            "Encuentro cancelado. En la fase técnica se avisará por correo a las personas inscritas.",
                          );
                        }}
                      >
                        <XCircle size={19} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal
        open={editing !== null}
        title={editing === "new" ? "Crear encuentro" : "Editar encuentro"}
        onClose={() => setEditing(null)}
        wide
      >
        <form className="vp-form vp-panel-body vp-community-form" onSubmit={save} noValidate>
          {error && (
            <div className="vp-form-error" role="alert" ref={errorRef} tabIndex={-1}>
              <WarningCircle size={20} />
              {error}
            </div>
          )}
          <label className="vp-field">
            Título
            <input
              value={draft.title}
              maxLength={140}
              onChange={(event) => set("title", event.target.value)}
            />
          </label>
          <label className="vp-field">
            Descripción
            <textarea
              rows={3}
              maxLength={600}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </label>
          <div className="vp-form-grid">
            <label className="vp-field">
              Formato
              <select
                aria-label="Formato"
                value={draft.format}
                onChange={(event) =>
                  set("format", event.target.value as Encuentro["format"])
                }
              >
                <option>En línea</option>
                <option>Presencial</option>
              </select>
            </label>
            <label className="vp-field">
              Lugar o enlace
              <input
                value={draft.location}
                maxLength={160}
                onChange={(event) => set("location", event.target.value)}
              />
            </label>
            <label className="vp-field">
              Fecha
              <input
                type="date"
                value={draft.date}
                onChange={(event) => set("date", event.target.value)}
              />
            </label>
            <label className="vp-field">
              Cupo
              <input
                type="number"
                min={1}
                max={1000}
                value={draft.capacity}
                onChange={(event) => set("capacity", Number(event.target.value))}
              />
            </label>
            <label className="vp-field">
              Hora de inicio (Colombia)
              <input
                type="time"
                value={draft.startTime}
                onChange={(event) => set("startTime", event.target.value)}
              />
            </label>
            <label className="vp-field">
              Hora de cierre (Colombia)
              <input
                type="time"
                value={draft.endTime}
                onChange={(event) => set("endTime", event.target.value)}
              />
            </label>
            <label className="vp-field">
              Curso relacionado
              <select
                aria-label="Curso relacionado"
                value={draft.courseId}
                onChange={(event) => set("courseId", event.target.value)}
              >
                <option value="">Ninguno</option>
                {store.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || "Curso sin título"}
                  </option>
                ))}
              </select>
            </label>
            <label className="vp-field">
              Estado
              <select
                aria-label="Estado"
                value={draft.status}
                onChange={(event) =>
                  set("status", event.target.value as Encuentro["status"])
                }
              >
                <option>Borrador</option>
                <option>Publicado</option>
                <option>Cancelado</option>
              </select>
            </label>
          </div>
          <button className="vp-btn vp-btn-primary" type="submit">
            {editing === "new" ? "Crear encuentro de muestra" : "Guardar cambios"}
          </button>
        </form>
      </Modal>
    </>
  );
}

export function Moderation() {
  const store = useDemo();
  const pendingReports = store.reports.filter(
    (report) => report.status === "Pendiente",
  );
  const resolved = store.reports.length - pendingReports.length;
  // One card per reported message, listing every reason it received.
  const pending = pendingReports.filter(
    (report, index) =>
      pendingReports.findIndex(
        (other) =>
          other.threadId === report.threadId && other.replyId === report.replyId,
      ) === index,
  );
  const reasonsFor = (threadId: string, replyId?: string) => [
    ...new Set(
      pendingReports
        .filter((r) => r.threadId === threadId && r.replyId === replyId)
        .map((r) => r.reason),
    ),
  ];
  function content(threadId: string, replyId?: string) {
    const thread = store.threads.find((item) => item.id === threadId);
    const reply = thread?.replies.find((item) => item.id === replyId);
    return {
      thread,
      author: reply ? reply.author : thread?.author,
      body: reply ? reply.body : thread?.body,
    };
  }
  function resolve(id: string, hide: boolean) {
    const report = store.reports.find((item) => item.id === id);
    if (!report) return;
    if (hide)
      store.setThreads((old) =>
        old.map((thread) =>
          thread.id !== report.threadId
            ? thread
            : report.replyId
              ? {
                  ...thread,
                  replies: thread.replies.map((reply) =>
                    reply.id === report.replyId ? { ...reply, status: "Oculto" } : reply,
                  ),
                }
              : { ...thread, status: "Oculto" },
        ),
      );
    // Every open report on the same message is settled together.
    store.setReports((old) =>
      old.map((item) =>
        item.threadId === report.threadId && item.replyId === report.replyId && item.status === "Pendiente"
          ? { ...item, status: hide ? "Oculto" : "Mantenido" }
          : item,
      ),
    );
    store.setNotice(hide ? "Mensaje oculto para la comunidad." : "Mensaje mantenido visible.");
  }
  return (
    <>
      <PageHeading
        eyebrow="Una comunidad que se cuida"
        title="Moderación."
        description="Revisa los mensajes que la comunidad reportó. Quien reporta se mantiene anónimo."
      />
      <div className="vp-stat-grid three">
        <div>
          <span>Reportes pendientes</span>
          <strong>{pendingReports.length}</strong>
          <small>
            {pending.length === 1
              ? "Sobre 1 mensaje"
              : `Sobre ${pending.length} mensajes`}
          </small>
        </div>
        <div>
          <span>Reportes resueltos</span>
          <strong>{resolved}</strong>
          <small>En esta sesión de muestra</small>
        </div>
        <div>
          <span>Conversaciones</span>
          <strong>{store.threads.length}</strong>
          <small>En todos los foros</small>
        </div>
      </div>
      <section className="vp-panel">
        <div className="vp-panel-heading">
          <h2>Por revisar</h2>
        </div>
        <div className="vp-panel-body">
          {pending.length ? (
            <ul className="vp-moderation-list">
              {pending.map((report) => {
                const item = content(report.threadId, report.replyId);
                const reasons = reasonsFor(report.threadId, report.replyId);
                return (
                  <li key={report.id}>
                    <span className="vp-moderation-meta">
                      {reasons.join(" · ")} · en «{item.thread?.title}»
                    </span>
                    <blockquote>
                      <strong>{item.author}</strong>
                      <p>{item.body}</p>
                    </blockquote>
                    <div className="vp-form-actions">
                      <button
                        className="vp-btn vp-btn-primary"
                        onClick={() => resolve(report.id, true)}
                      >
                        Ocultar mensaje
                      </button>
                      <button
                        className="vp-btn vp-btn-secondary"
                        onClick={() => resolve(report.id, false)}
                      >
                        <CheckCircle size={18} />
                        Mantener visible
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="vp-moderation-empty">
              <CheckCircle size={22} weight="light" />
              No hay reportes pendientes.
            </p>
          )}
        </div>
      </section>
      <p className="vp-community-note">
        <ShieldCheck size={20} weight="light" />
        En la fase técnica, la moderación quedará registrada con fecha y
        responsable.
      </p>
    </>
  );
}
