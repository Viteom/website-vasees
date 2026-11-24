import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  DownloadSimple,
  EnvelopeSimple,
  FileText,
  Plus,
  ShieldCheck,
  UploadSimple,
  UserPlus,
  WarningCircle,
} from "@phosphor-icons/react";
import { useDemo, money } from "./demo-store";
import "./companies.css";
import { SiteLink, navigate } from "../navigation";
import { Badge, Empty, Modal, PageHeading } from "./shared";
import {
  isActiveMember,
  isUpToDate,
  lastActiveLabel,
  parseCsv,
  progressPercent,
  segments,
  validEmail,
  type Collaborator,
  type Company,
  type CrmPerson,
  type Segment,
} from "../content/companies";
import {
  newPeriod,
  planById,
  plans,
  statusLabel,
  statusTone,
  type PlanId,
} from "../content/membership";
import { forumName } from "../content/community";

const upcoming = (end: string) => new Date(end).getTime() > Date.now();

function useCourseTitle() {
  const store = useDemo();
  return (id: string) =>
    store.courses.find((course) => course.id === id)?.title ?? "Curso de muestra";
}

/** Everyone the CRM follows: the live demo student, sample individuals and active company collaborators. */
function usePeople(): (CrmPerson & { origin: string })[] {
  const store = useDemo();
  const live: CrmPerson & { origin: string } = {
    id: "live-student",
    name:
      store.session?.role === "student"
        ? store.session.name
        : (store.users.find((user) => user.id === "u1")?.name ?? "Laura Gómez"),
    email:
      store.session?.role === "student" ? store.session.email : "laura@ejemplo.com",
    membership: store.membership.status,
    courses: store.enrolled.map((courseId) => ({
      courseId,
      passed: (store.tests[courseId] ?? []).length,
      lessons: store.courses.find((c) => c.id === courseId)?.lessons.length ?? 3,
    })),
    lastActive: 0,
    registeredUpcoming: store.encuentros.some(
      (item) => store.myEncuentros.includes(item.id) && upcoming(item.end),
    ),
    cancelReason: store.membership.cancelReason,
    origin: store.membership.sponsor?.company ?? "Individual",
  };
  const companyName = (id: string) =>
    store.companies.find((company) => company.id === id)?.name ?? "Empresa";
  const collaborators = store.collaborators
    .filter((c) => c.status === "Activa")
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      membership: "activa" as const,
      courses: c.courses,
      lastActive: c.lastActive,
      registeredUpcoming: false,
      cancelReason: "",
      companyId: c.companyId,
      origin: companyName(c.companyId),
    }));
  return [
    live,
    ...store.crmPeople.map((p) => ({ ...p, origin: "Individual" })),
    ...collaborators,
  ];
}

function SegmentPreview({
  segment,
  people,
  onClose,
}: {
  segment: Segment | null;
  people: (CrmPerson & { origin: string })[];
  onClose: () => void;
}) {
  const title = useCourseTitle();
  const matches = segment ? people.filter(segment.match) : [];
  const first = matches[0];
  const course =
    first?.courses.find((c) => c.passed < c.lessons) ?? first?.courses[0];
  const fill = (text: string) =>
    text
      .replaceAll("{nombre}", first?.name.split(" ")[0] ?? "")
      .replaceAll("{curso}", course ? title(course.courseId) : "tu curso");
  return (
    <Modal
      open={Boolean(segment)}
      title={segment ? `Comunicación: ${segment.title}` : "Comunicación"}
      onClose={onClose}
      wide
    >
      {segment && (
        <div className="vp-panel-body vp-crm-preview">
          <p className="vp-crm-rule">{segment.rule}</p>
          <p>
            <strong>
              {matches.length === 1
                ? "1 persona"
                : `${matches.length} personas`}
            </strong>
            {matches.length > 0 &&
              `: ${matches
                .slice(0, 5)
                .map((p) => p.name)
                .join(", ")}${matches.length > 5 ? ` y ${matches.length - 5} más` : ""}.`}
          </p>
          {first ? (
            <div className="vp-mail-preview">
              <span>Para: {first.email}</span>
              <strong>Asunto: {fill(segment.subject)}</strong>
              <p>{fill(segment.body)}</p>
            </div>
          ) : (
            <p>Nadie cumple esta condición ahora.</p>
          )}
          <p className="vp-small-note">
            Vista previa: no se envía ningún correo. El envío se conectará con
            Resend en la fase técnica.
          </p>
        </div>
      )}
    </Modal>
  );
}

export function AdminCrm() {
  const store = useDemo();
  const people = usePeople();
  const title = useCourseTitle();
  const [status, setStatus] = useState("Todas");
  const [origin, setOrigin] = useState("Todos");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment | null>(null);
  const plainText = (text: string) =>
    text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const shown = people.filter(
    (p) =>
      (status === "Todas" ||
        (status === "Activas" && isActiveMember(p.membership)) ||
        (status === "No activas" && !isActiveMember(p.membership)) ||
        (status === "Al día" && isUpToDate(p.membership)) ||
        (status === "No al día" && !isUpToDate(p.membership)) ||
        (status === "Canceladas" &&
          (p.membership === "cancelada" || p.membership === "vencida"))) &&
      (origin === "Todos" ||
        (origin === "Individual" ? p.origin === "Individual" : p.origin !== "Individual")) &&
      plainText(`${p.name} ${p.email}`).includes(plainText(query)),
  );
  return (
    <>
      <PageHeading
        eyebrow="Escuela de Familia y Longevidad"
        title="CRM de personas."
        description="Quién está activo, qué cursos sigue, cuánto avanza y quién necesita un mensaje. Datos de muestra."
      />
      <div className="vp-stat-grid">
        <div>
          <span>Personas</span>
          <strong>{people.length}</strong>
          <small>Individuales y por empresa</small>
        </div>
        <div>
          <span>Activas</span>
          <strong>{people.filter((p) => isActiveMember(p.membership)).length}</strong>
          <small>Con acceso a la Escuela</small>
        </div>
        <div>
          <span>No al día</span>
          <strong>{people.filter((p) => !isUpToDate(p.membership)).length}</strong>
          <small>Pago pendiente, vencida o sin membresía</small>
        </div>
        <div>
          <span>Avance promedio</span>
          <strong>{progressPercent(people.flatMap((p) => p.courses))}%</strong>
          <small>Tests aprobados en sus cursos</small>
        </div>
      </div>
      <section className="vp-crm-segments" aria-labelledby="vp-segments-title">
        <h2 id="vp-segments-title">Segmentos para comunicaciones</h2>
        <ul>
          {segments.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span className="vp-crm-count">
                {people.filter(item.match).length}
              </span>
              <p>{item.rule}</p>
              <button
                className="vp-text-button"
                aria-label={`Previsualizar mensaje de ${item.title}`}
                onClick={() => setSegment(item)}
              >
                <EnvelopeSimple size={17} />
                Previsualizar mensaje
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className="vp-crm-filters">
        <label className="vp-field vp-inline-field">
          Buscar
          <input
            type="search"
            aria-label="Buscar personas"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre o correo"
          />
        </label>
        <label className="vp-field vp-inline-field">
          Estado
          <select
            aria-label="Estado de la membresía"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {["Todas", "Activas", "No activas", "Al día", "No al día", "Canceladas"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </label>
        <label className="vp-field vp-inline-field">
          Origen
          <select
            aria-label="Origen de la membresía"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          >
            <option>Todos</option>
            <option value="Individual">Individuales (B2C)</option>
            <option value="Empresa">Por empresa (B2B)</option>
          </select>
        </label>
        <span className="vp-muted">
          {shown.length === 1 ? "1 persona" : `${shown.length} personas`}
        </span>
      </div>
      <div
        className="vp-panel vp-table-wrap vp-b2b-table vp-crm-table"
        role="region"
        aria-label="Personas de la Escuela"
        tabIndex={0}
      >
        <table className="vp-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Membresía</th>
              <th>Cursos y avance</th>
              <th>Última actividad</th>
              <th>Motivo de cancelación</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <small>{p.origin}</small>
                </td>
                <td>
                  <Badge tone={statusTone[p.membership]}>
                    {statusLabel[p.membership]}
                  </Badge>
                  <small>{isUpToDate(p.membership) ? "Al día" : "No al día"}</small>
                </td>
                <td>
                  {p.courses.length ? (
                    <ul className="vp-crm-courses">
                      {p.courses.map((c) => (
                        <li key={c.courseId}>
                          {title(c.courseId)} · {c.passed} de {c.lessons}
                          {c.passed >= c.lessons ? " · Insignia" : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Sin cursos"
                  )}
                </td>
                <td>{lastActiveLabel(p.lastActive)}</td>
                <td>{p.cancelReason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && (
          <Empty
            title="Nadie coincide con estos filtros."
            text="Cambia el estado, el origen o la búsqueda."
          />
        )}
      </div>
      <p className="vp-community-note">
        <ShieldCheck size={20} weight="light" />
        Uso interno. Las metas personales, las notas y las conversaciones del
        foro no forman parte del CRM. La separación de roles de esta demo no
        equivale a la seguridad del servidor.
      </p>
      <SegmentPreview
        segment={segment}
        people={people}
        onClose={() => setSegment(null)}
      />
    </>
  );
}

const usedSeats = (collaborators: Collaborator[], companyId: string) =>
  collaborators.filter(
    (c) => c.companyId === companyId && c.status !== "Revocada",
  ).length;

const emptyCompany = {
  name: "",
  sector: "",
  funding: 100,
  plan: "anual" as PlanId,
  seats: 10,
  initialCourses: [] as string[],
};

export function AdminCompanies() {
  const store = useDemo();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyCompany);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function open(company: Company) {
    store.setSelectedCompany(company.id);
    navigate("/admin/empresa");
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = draft.name.trim().length < 2
      ? "Escribe el nombre de la empresa."
      : !Number.isInteger(draft.funding) || draft.funding < 0 || draft.funding > 100
        ? "La financiación debe ser un número entero entre 0 y 100."
        : !Number.isInteger(draft.seats) || draft.seats < 1
          ? "La empresa necesita al menos 1 cupo."
          : "";
    if (problem) {
      setError(problem);
      return;
    }
    const company: Company = {
      id: `emp-${Date.now()}`,
      name: draft.name.trim(),
      sector: draft.sector.trim() || "Sin sector",
      funding: draft.funding,
      plan: draft.plan,
      seats: draft.seats,
      initialCourses: draft.initialCourses,
    };
    store.setCompanies((old) => [...old, company]);
    setCreating(false);
    setDraft(emptyCompany);
    setError("");
    store.setNotice("Empresa de muestra creada.");
    open(company);
  }
  return (
    <>
      <PageHeading
        eyebrow="Membresías financiadas"
        title="Empresas."
        description="Organizaciones que financian o subsidian la membresía de sus colaboradores. Ejemplos ficticios."
        actions={
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => {
              setError("");
              setCreating(true);
            }}
          >
            <Plus size={18} />
            Registrar empresa
          </button>
        }
      />
      <div
        className="vp-panel vp-table-wrap vp-b2b-table"
        role="region"
        aria-label="Empresas y sus membresías"
        tabIndex={0}
      >
        <table className="vp-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Financiación</th>
              <th>Cupos</th>
              <th>Activos</th>
              <th>Avance</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {store.companies.map((company) => {
              const people = store.collaborators.filter(
                (c) => c.companyId === company.id,
              );
              const active = people.filter((c) => c.status === "Activa");
              const pending = people.filter(
                (c) => c.status === "Invitación pendiente",
              ).length;
              return (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    <small>
                      {company.sector} · {planById(company.plan)?.name}
                    </small>
                  </td>
                  <td>{company.funding} %</td>
                  <td>
                    {usedSeats(store.collaborators, company.id)} de {company.seats}
                    {pending > 0 && (
                      <small>
                        {pending === 1
                          ? "1 invitación pendiente"
                          : `${pending} invitaciones pendientes`}
                      </small>
                    )}
                  </td>
                  <td>{active.length}</td>
                  <td>{progressPercent(active.flatMap((c) => c.courses))}%</td>
                  <td>
                    <button
                      className="vp-table-action"
                      aria-label={`Ver empresa: ${company.name}`}
                      onClick={() => open(company)}
                    >
                      Ver empresa
                      <ArrowRight size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="vp-community-note">
        <ShieldCheck size={20} weight="light" />
        Empresas y personas ficticias. No representan contratos ni clientes
        reales.
      </p>
      <Modal
        open={creating}
        title="Registrar empresa"
        onClose={() => setCreating(false)}
        wide
      >
        <form className="vp-form vp-panel-body vp-community-form" onSubmit={save} noValidate>
          {error && (
            <div className="vp-form-error" role="alert" ref={errorRef} tabIndex={-1}>
              <WarningCircle size={20} />
              {error}
            </div>
          )}
          <div className="vp-form-grid">
            <label className="vp-field">
              Nombre de la empresa
              <input
                value={draft.name}
                maxLength={120}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="vp-field">
              Sector
              <input
                value={draft.sector}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, sector: e.target.value })}
              />
            </label>
            <label className="vp-field">
              Financiación de la empresa (%)
              <input
                type="number"
                min={0}
                max={100}
                value={draft.funding}
                onChange={(e) => setDraft({ ...draft, funding: Number(e.target.value) })}
              />
            </label>
            <label className="vp-field">
              Cupos
              <input
                type="number"
                min={1}
                max={5000}
                value={draft.seats}
                onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })}
              />
            </label>
            <label className="vp-field">
              Plan
              <select
                aria-label="Plan"
                value={draft.plan}
                onChange={(e) => setDraft({ ...draft, plan: e.target.value as PlanId })}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="vp-choice-group">
            <legend>Cursos iniciales</legend>
            {store.courses
              .filter((course) => course.status === "Publicado")
              .map((course) => (
                <label className="vp-choice" key={course.id}>
                  <input
                    type="checkbox"
                    checked={draft.initialCourses.includes(course.id)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        initialCourses: e.target.checked
                          ? [...draft.initialCourses, course.id]
                          : draft.initialCourses.filter((id) => id !== course.id),
                      })
                    }
                  />
                  <span>
                    <strong>{course.title}</strong>
                  </span>
                </label>
              ))}
          </fieldset>
          <button className="vp-btn vp-btn-primary" type="submit">
            Registrar empresa de muestra
          </button>
        </form>
      </Modal>
    </>
  );
}

type Candidate = { name: string; email: string; problem: string };

function checkCandidates(
  rows: { name: string; email: string }[],
  existing: Collaborator[],
  seatsLeft: number,
): Candidate[] {
  const seen = new Set<string>();
  let accepted = 0;
  return rows.map(({ name, email }) => {
    const key = email.toLowerCase();
    let problem = "";
    if (name.trim().length < 2) problem = "Falta el nombre";
    else if (!validEmail(key)) problem = "Correo no válido";
    else if (existing.some((c) => c.email === key && c.status !== "Revocada"))
      problem = "Ya está en esta empresa";
    else if (seen.has(key)) problem = "Repetido en la lista";
    else if (accepted >= seatsLeft) problem = "Sin cupo disponible";
    seen.add(key);
    if (!problem) accepted++;
    return { name: name.trim(), email: key, problem };
  });
}

function companyReport(
  company: Company,
  people: Collaborator[],
  title: (id: string) => string,
) {
  const active = people.filter((c) => c.status === "Activa");
  const courseIds = [...new Set(active.flatMap((c) => c.courses.map((p) => p.courseId)))];
  const month = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const courses = courseIds.map((id) => {
    const rows = active.flatMap((c) => c.courses.filter((p) => p.courseId === id));
    return {
      title: title(id),
      people: rows.length,
      progress: progressPercent(rows),
      badges: rows.filter((p) => p.passed >= p.lessons).length,
    };
  });
  const opinions = active
    .filter((c) => c.opinion)
    .map((c) => ({ name: forumName(c.name), text: c.opinion as string }));
  return { month, active: active.length, courses, opinions };
}

export function CompanyDetail() {
  const store = useDemo();
  const title = useCourseTitle();
  const company = store.companies.find((c) => c.id === store.selectedCompany);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Candidate[] | null>(null);
  const [report, setReport] = useState(false);
  if (!company)
    return (
      <Empty
        title="Elige una empresa."
        text="Vuelve al listado para abrir su detalle."
        action={
          <SiteLink className="vp-btn vp-btn-primary" href="/admin/empresas">
            Ver empresas
          </SiteLink>
        }
      />
    );
  const people = store.collaborators.filter((c) => c.companyId === company.id);
  const seatsLeft = company.seats - usedSeats(store.collaborators, company.id);
  const plan = planById(company.plan);
  const data = companyReport(company, people, title);

  function invite(rows: Candidate[]) {
    if (!company) return;
    store.setCollaborators((old) => [
      ...old,
      ...rows.map((row, index) => ({
        id: `${company.id}-n${Date.now()}-${index}`,
        companyId: company.id,
        name: row.name,
        email: row.email,
        status: "Invitación pendiente" as const,
        courses: [],
        lastActive: null,
      })),
    ]);
  }
  function single(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [row] = checkCandidates([{ name, email: email.trim() }], people, seatsLeft);
    if (row.problem) {
      setInviteError(`${row.problem}.`);
      return;
    }
    invite([row]);
    setName("");
    setEmail("");
    setInviteError("");
    store.setNotice(`Invitación de muestra creada para ${row.email}. No se envió ningún correo.`);
  }
  async function readFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // The file is read in the browser only; nothing is uploaded.
    setCsv(await file.text());
    setPreview(null);
  }
  function download() {
    if (!company) return;
    const lines = [
      `Informe mensual de muestra · ${company.name} · ${data.month}`,
      "",
      `${data.active} colaboradores activos de ${company.seats} cupos.`,
      "",
      "Cursos y avance:",
      ...data.courses.map(
        (c) => `- ${c.title}: ${c.people} personas, ${c.progress}% de avance, ${c.badges} insignias.`,
      ),
      "",
      "Opiniones autorizadas:",
      ...(data.opinions.length
        ? data.opinions.map((o) => `- ${o.name}: «${o.text}»`)
        : ["- Sin opiniones autorizadas este mes."]),
      "",
      "Este informe no incluye metas personales, notas, conversaciones del foro, motivos de cancelación ni sugerencias privadas.",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `informe-${company.id}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const valid = preview?.filter((row) => !row.problem) ?? [];
  return (
    <>
      <SiteLink className="vp-back-link" href="/admin/empresas">
        <ArrowLeft size={17} />
        Empresas
      </SiteLink>
      <PageHeading
        eyebrow={`${company.sector} · Ejemplo ficticio`}
        title={company.name}
        description={`Financia el ${company.funding} % del ${plan?.name.toLowerCase()} de sus colaboradores.`}
        actions={
          <button className="vp-btn vp-btn-primary" onClick={() => setReport(true)}>
            <FileText size={18} />
            Ver informe mensual
          </button>
        }
      />
      <div className="vp-stat-grid">
        <div>
          <span>Colaboradores activos</span>
          <strong>{people.filter((c) => c.status === "Activa").length}</strong>
          <small>Con membresía financiada</small>
        </div>
        <div>
          <span>Cupos usados</span>
          <strong>
            {company.seats - seatsLeft} / {company.seats}
          </strong>
          <small>Incluye invitaciones pendientes</small>
        </div>
        <div>
          <span>Avance promedio</span>
          <strong>
            {progressPercent(
              people.filter((c) => c.status === "Activa").flatMap((c) => c.courses),
            )}
            %
          </strong>
          <small>Tests aprobados</small>
        </div>
        <div>
          <span>Cada persona paga</span>
          <strong>
            {company.funding >= 100
              ? "$ 0"
              : money(Math.round(((plan?.price ?? 0) * (100 - company.funding)) / 100))}
          </strong>
          <small>{plan?.cadence} · valor de muestra</small>
        </div>
      </div>
      <div className="vp-company-tools">
        <form className="vp-panel vp-panel-body vp-form" onSubmit={single} noValidate>
          <h2>
            <UserPlus size={22} weight="light" />
            Invitar a una persona
          </h2>
          <label className="vp-field">
            Nombre
            <input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="vp-field">
            Correo
            <input
              type="email"
              value={email}
              maxLength={180}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {inviteError && (
            <div className="vp-form-error" role="alert">
              <WarningCircle size={20} />
              {inviteError}
            </div>
          )}
          <button className="vp-btn vp-btn-primary" type="submit" disabled={seatsLeft <= 0}>
            {seatsLeft > 0 ? "Crear invitación" : "Sin cupos disponibles"}
          </button>
        </form>
        <section className="vp-panel vp-panel-body vp-form" aria-labelledby="vp-csv-title">
          <h2 id="vp-csv-title">
            <UploadSimple size={22} weight="light" />
            Importar desde CSV
          </h2>
          <p className="vp-small-note">
            Una persona por línea: nombre, correo. Revisamos datos, duplicados y
            cupos antes de incorporar a nadie.
          </p>
          <label className="vp-field">
            Pega la lista
            <textarea
              rows={5}
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setPreview(null);
              }}
              placeholder={"nombre,correo\nAna Restrepo,ana@empresa.com"}
            />
          </label>
          <label className="vp-field">
            O elige un archivo .csv
            <input type="file" accept=".csv,text/csv" onChange={readFile} />
          </label>
          <button
            className="vp-btn vp-btn-secondary"
            type="button"
            disabled={!csv.trim()}
            onClick={() => setPreview(checkCandidates(parseCsv(csv), people, seatsLeft))}
          >
            Revisar la lista
          </button>
          {preview && (
            <div className="vp-csv-preview">
              <p role="status">
                {valid.length === 1
                  ? "1 persona lista para invitar"
                  : `${valid.length} personas listas para invitar`}
                {preview.length - valid.length > 0 &&
                  ` · ${preview.length - valid.length} con observaciones`}
                .
              </p>
              <ul>
                {preview.map((row, index) => (
                  <li key={`${row.email}-${index}`} className={row.problem ? "problem" : ""}>
                    <span>
                      <strong>{row.name || "Sin nombre"}</strong>
                      <small>{row.email || "Sin correo"}</small>
                    </span>
                    <Badge tone={row.problem ? "danger" : "success"}>
                      {row.problem || "Lista"}
                    </Badge>
                  </li>
                ))}
              </ul>
              <button
                className="vp-btn vp-btn-primary"
                type="button"
                disabled={!valid.length}
                onClick={() => {
                  invite(valid);
                  store.setNotice(
                    `${valid.length === 1 ? "1 invitación creada" : `${valid.length} invitaciones creadas`}. No se envió ningún correo.`,
                  );
                  setPreview(null);
                  setCsv("");
                }}
              >
                Invitar {valid.length === 1 ? "a 1 persona" : `a ${valid.length} personas`}
              </button>
            </div>
          )}
        </section>
      </div>
      <h2 className="vp-company-subtitle">Colaboradores</h2>
      <div
        className="vp-panel vp-table-wrap vp-b2b-table"
        role="region"
        aria-label={`Colaboradores de ${company.name}`}
        tabIndex={0}
      >
        <table className="vp-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Estado</th>
              <th>Cursos y avance</th>
              <th>Última actividad</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <small>{c.email}</small>
                </td>
                <td>
                  <Badge
                    tone={
                      c.status === "Activa"
                        ? "success"
                        : c.status === "Revocada"
                          ? "danger"
                          : "pending"
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td>
                  {c.courses.length ? (
                    <ul className="vp-crm-courses">
                      {c.courses.map((p) => (
                        <li key={p.courseId}>
                          {title(p.courseId)} · {p.passed} de {p.lessons}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{lastActiveLabel(c.lastActive)}</td>
                <td>
                  {c.status === "Invitación pendiente" && (
                    <div className="vp-invite-actions">
                      <button
                        className="vp-table-action"
                        aria-label={`Abrir la invitación de ${c.name}`}
                        onClick={() => {
                          store.setSelectedInvite(c.id);
                          navigate("/escuela/invitacion");
                        }}
                      >
                        Abrir invitación
                      </button>
                      <button
                        className="vp-table-action"
                        aria-label={`Revocar la invitación de ${c.name}`}
                        onClick={() => {
                          store.setCollaborators((old) =>
                            old.map((item) =>
                              item.id === c.id ? { ...item, status: "Revocada" } : item,
                            ),
                          );
                          store.setNotice(`Invitación de ${c.name} revocada.`);
                        }}
                      >
                        Revocar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={report}
        title={`Informe mensual · ${data.month}`}
        onClose={() => setReport(false)}
        wide
      >
        <div className="vp-panel-body vp-company-report">
          <Badge tone="pending">Informe de muestra</Badge>
          <h3>{company.name}</h3>
          <p className="vp-report-lead">
            {data.active} colaboradores activos de {company.seats} cupos.
          </p>
          <h4>Cursos y avance</h4>
          <ul>
            {data.courses.map((c) => (
              <li key={c.title}>
                <strong>{c.title}</strong>: {c.people}{" "}
                {c.people === 1 ? "persona" : "personas"}, {c.progress}% de avance,{" "}
                {c.badges === 1 ? "1 insignia" : `${c.badges} insignias`}.
              </li>
            ))}
          </ul>
          <h4>Opiniones autorizadas</h4>
          {data.opinions.length ? (
            <ul>
              {data.opinions.map((o) => (
                <li key={o.name}>
                  <strong>{o.name}</strong> dice: «{o.text}»
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin opiniones autorizadas este mes.</p>
          )}
          <p className="vp-report-excluded">
            <ShieldCheck size={20} weight="light" />
            Este informe no incluye metas personales, notas, conversaciones del
            foro, motivos de cancelación ni sugerencias privadas.
          </p>
          <div className="vp-form-actions">
            <button className="vp-btn vp-btn-primary" onClick={download}>
              <DownloadSimple size={18} />
              Descargar informe (.txt)
            </button>
          </div>
          <p className="vp-small-note">
            El envío automático mensual a la empresa se conectará en la fase
            técnica.
          </p>
        </div>
      </Modal>
    </>
  );
}

/** Accepting a company invitation never switches identity or role silently. */
export function InvitationPage() {
  const store = useDemo();
  const title = useCourseTitle();
  const invite = store.collaborators.find((c) => c.id === store.selectedInvite);
  const company = store.companies.find((c) => c.id === invite?.companyId);
  if (!invite || !company || invite.status === "Revocada")
    return (
      <Empty
        title="Esta invitación ya no es válida."
        text="Puede que la empresa la haya revocado. Si crees que es un error, escribe a tu empresa."
        action={
          <SiteLink className="vp-btn vp-btn-primary" href="/escuela/inicio">
            Ir a Mi Escuela
          </SiteLink>
        }
      />
    );
  const session = store.session;
  const sameAccount =
    session?.role === "student" && session.email.toLowerCase() === invite.email;
  const plan = planById(company.plan);
  const pays = Math.round(((plan?.price ?? 0) * (100 - company.funding)) / 100);
  function accept() {
    if (!company || !invite) return;
    store.setCollaborators((old) =>
      old.map((c) =>
        c.id === invite.id
          ? {
              ...c,
              status: "Activa",
              lastActive: 0,
              courses: company.initialCourses.map((courseId) => ({
                courseId,
                passed: 0,
                lessons: 3,
              })),
            }
          : c,
      ),
    );
    store.setMembership({
      ...newPeriod(company.plan),
      sponsor: { company: company.name, funding: company.funding },
    });
    store.setEnrolled((old) => [...new Set([...old, ...company.initialCourses])]);
    store.setNotice(`Te uniste a la Escuela con ${company.name}.`);
    navigate("/escuela/inicio");
  }
  return (
    <>
      <PageHeading
        eyebrow="Invitación de empresa · Muestra"
        title={`${company.name} te invita a la Escuela.`}
        description={`Invitación para ${invite.name} (${invite.email}).`}
      />
      <section className="vp-membership-card vp-invite-card">
        <div className="vp-membership-head">
          <Buildings size={30} weight="light" />
          <div>
            <h2>{plan?.name} financiado</h2>
            <p>
              {company.funding >= 100
                ? "La empresa cubre el 100 %: no pagas nada."
                : `La empresa cubre el ${company.funding} %. Tú pagas ${money(pays)} ${plan?.cadence} (valor de muestra).`}
            </p>
          </div>
        </div>
        {company.initialCourses.length > 0 && (
          <div>
            <h3 className="vp-invite-subtitle">Cursos para empezar</h3>
            <ul className="vp-crm-courses">
              {company.initialCourses.map((id) => (
                <li key={id}>{title(id)}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="vp-report-excluded">
          <ShieldCheck size={20} weight="light" />
          Tu empresa verá tu actividad, tus cursos, tu avance y las opiniones
          que autorices. No verá tu meta personal, tus notas, tus conversaciones
          del foro ni tus motivos de cancelación.
        </p>
        {sameAccount ? (
          <div className="vp-form-actions">
            <button className="vp-btn vp-btn-primary" onClick={accept}>
              Aceptar invitación
              <ArrowRight size={18} />
            </button>
            <SiteLink className="vp-btn vp-btn-ghost" href="/escuela/inicio">
              Ahora no
            </SiteLink>
          </div>
        ) : (
          <div className="vp-membership-alert danger" role="alert">
            <WarningCircle size={22} />
            <div>
              <p>
                Esta invitación es para <strong>{invite.email}</strong>.{" "}
                {session?.role === "admin"
                  ? "Estás en la vista de administración."
                  : `Tienes abierta la sesión de ${session?.email}.`}{" "}
                No cambiaremos tu cuenta ni tu rol sin que lo decidas.
              </p>
              <button
                className="vp-btn vp-btn-secondary"
                onClick={() => {
                  store.setSession(null);
                  store.setAuthEmail(invite.email);
                  store.setAuthName(invite.name);
                  store.setAuthIntent("login");
                  store.setAuthDestination("/escuela/invitacion");
                  navigate("/escuela/ingresar");
                }}
              >
                Cerrar esta sesión e ingresar como {invite.email}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
