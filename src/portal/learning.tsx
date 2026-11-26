import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Certificate,
  ChartLineUp,
  CheckCircle,
  LockSimple,
  PencilSimple,
  ShieldCheck,
  Star,
  Target,
  WarningCircle,
} from "@phosphor-icons/react";
import { useDemo, hasBadge, type ManagedCourse } from "./demo-store";
import { hasAccess } from "../content/membership";
import { SiteLink, navigate } from "../navigation";
import { Badge, Empty, Modal, PageHeading } from "./shared";
import {
  availabilityOptions,
  badgeRules,
  goalOptions,
  goalProgress,
  quizFor,
  suggestRoute,
  type AvailabilityId,
  type GoalMeasure,
} from "../content/school-learning";

const steps = ["Tu objetivo", "Tus intereses", "Tu tiempo"] as const;

/** First entry: goal, interests and availability, ending with a suggested route. */
export function Welcome() {
  const store = useDemo();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(store.plan?.goal ?? "");
  const [interests, setInterests] = useState<string[]>(
    store.plan?.interests ?? [],
  );
  const [availability, setAvailability] = useState<AvailabilityId | "">(
    store.plan?.availability ?? "",
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  const first = store.session?.name.split(" ")[0] ?? "Laura";

  function next(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing =
      step === 0 && !goal
        ? "Elige el objetivo que más se parece a lo que buscas."
        : step === 2 && !availability
          ? "Elige cuánto tiempo quieres dedicar cada semana."
          : "";
    if (missing) {
      setError(missing);
      errorRef.current?.focus();
      return;
    }
    setError("");
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    store.setPlan((old) => ({
      goal,
      interests,
      availability: availability as AvailabilityId,
      weeksDone: old?.weeksDone ?? 0,
      measure: old?.measure,
    }));
    setDone(true);
  }

  if (done && store.plan) {
    const route = suggestRoute(store.plan, store.courses);
    const time = availabilityOptions.find(
      (item) => item.id === store.plan?.availability,
    );
    return (
      <>
        <PageHeading
          eyebrow="Tu ruta sugerida"
          title={`Listo, ${first}. Este puede ser tu camino.`}
          description="La armamos con lo que nos contaste. Puedes cambiarla cuando quieras."
        />
        <section className="vp-panel vp-panel-body vp-route-result">
          <div className="vp-route-summary">
            <span>
              <Target size={22} weight="light" />
              Tu objetivo
            </span>
            <strong>
              {goalOptions.find((item) => item.id === store.plan?.goal)?.label}
            </strong>
            <span>Tu acción de la semana</span>
            <strong>{time?.action}</strong>
          </div>
          <h2>Cursos sugeridos para empezar</h2>
          <ol className="vp-route-list">
            {route.map((course) => (
              <li key={course.id}>
                <img src={course.image} alt="" />
                <span>
                  <strong>{course.title}</strong>
                  <small>
                    {course.category} · {course.lessons.length} lecciones
                  </small>
                </span>
              </li>
            ))}
          </ol>
          <PrivacyNote />
          <div className="vp-form-actions">
            <button
              className="vp-btn vp-btn-primary"
              onClick={() => navigate("/escuela/inicio")}
            >
              Ir a mi inicio
              <ArrowRight size={18} />
            </button>
            <SiteLink className="vp-btn vp-btn-secondary" href="/escuela/explorar">
              Explorar todo el catálogo
            </SiteLink>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={store.plan ? "Ajusta tu meta" : "Bienvenida a la Escuela"}
        title={`Qué bueno tenerte aquí, ${first}.`}
        description="Tres preguntas cortas para sugerirte por dónde empezar. Puedes saltarte este paso y volver después."
      />
      <form className="vp-panel vp-panel-body vp-form vp-welcome" onSubmit={next} noValidate>
        <ol className="vp-stepper" aria-label="Pasos de la bienvenida">
          {steps.map((item, index) => (
            <li
              key={item}
              aria-current={index === step ? "step" : undefined}
              className={index < step ? "done" : ""}
            >
              <span aria-hidden="true">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
        {error && (
          <div
            className="vp-form-error"
            role="alert"
            ref={errorRef}
            tabIndex={-1}
          >
            <WarningCircle size={20} />
            {error}
          </div>
        )}
        {step === 0 ? (
          <fieldset className="vp-choice-group">
            <legend>
              <span className="vp-step-count">Paso 1 de 3</span>
              ¿Qué te gustaría lograr en la Escuela?
            </legend>
            {goalOptions.map((item) => (
              <label className="vp-choice" key={item.id}>
                <input
                  type="radio"
                  name="goal"
                  value={item.id}
                  checked={goal === item.id}
                  onChange={() => setGoal(item.id)}
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.text}</small>
                </span>
              </label>
            ))}
          </fieldset>
        ) : step === 1 ? (
          <fieldset className="vp-choice-group">
            <legend>
              <span className="vp-step-count">Paso 2 de 3</span>
              ¿Qué otros temas te interesan?
            </legend>
            <p className="vp-small-note">
              Opcional. Elige los que quieras.
            </p>
            {goalOptions
              .filter((item) => item.id !== goal)
              .map((item) => (
                <label className="vp-choice" key={item.id}>
                  <input
                    type="checkbox"
                    checked={interests.includes(item.id)}
                    onChange={(event) =>
                      setInterests((old) =>
                        event.target.checked
                          ? [...old, item.id]
                          : old.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.text}</small>
                  </span>
                </label>
              ))}
          </fieldset>
        ) : (
          <fieldset className="vp-choice-group">
            <legend>
              <span className="vp-step-count">Paso 3 de 3</span>
              ¿Cuánto tiempo quieres dedicar cada semana?
            </legend>
            {availabilityOptions.map((item) => (
              <label className="vp-choice" key={item.id}>
                <input
                  type="radio"
                  name="availability"
                  value={item.id}
                  checked={availability === item.id}
                  onChange={() => setAvailability(item.id)}
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.action}</small>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <PrivacyNote />
        <div className="vp-welcome-actions">
          {step > 0 ? (
            <button
              type="button"
              className="vp-btn vp-btn-ghost"
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              <ArrowLeft size={18} />
              Atrás
            </button>
          ) : (
            <SiteLink className="vp-btn vp-btn-ghost" href="/escuela/inicio">
              Ahora no
            </SiteLink>
          )}
          <button className="vp-btn vp-btn-primary" type="submit">
            {step < steps.length - 1 ? "Continuar" : "Ver mi ruta sugerida"}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </>
  );
}

function PrivacyNote() {
  return (
    <p className="vp-privacy-note">
      <ShieldCheck size={20} weight="light" />
      Tu meta, tus intereses y tus notas son privados. No aparecen en los
      reportes de la Escuela.
    </p>
  );
}

/** Dashboard block: personal goal, weekly action and progress toward the goal. */
export function GoalPanel() {
  const store = useDemo();
  if (!store.plan)
    return (
      <section className="vp-goal-invite">
        <Target size={34} weight="light" />
        <div>
          <h2>¿Qué te gustaría lograr?</h2>
          <p>
            Cuéntanos tu objetivo, tus intereses y tu tiempo. Te sugerimos una
            ruta y una acción para cada semana.
          </p>
        </div>
        <SiteLink className="vp-btn vp-btn-primary" href="/escuela/bienvenida">
          Definir mi meta
          <ArrowRight size={18} />
        </SiteLink>
      </section>
    );
  const plan = store.plan;
  const route = suggestRoute(plan, store.courses);
  const goal = goalOptions.find((item) => item.id === plan.goal);
  const time = availabilityOptions.find((item) => item.id === plan.availability);
  const total = route.reduce((sum, course) => sum + course.lessons.length, 0);
  const passed = route.reduce(
    (sum, course) =>
      sum + Math.min((store.tests[course.id] ?? []).length, course.lessons.length),
    0,
  );
  return (
    <section className="vp-goal" aria-labelledby="vp-goal-title">
      <div className="vp-goal-head">
        <div>
          <p className="eyebrow">Mi meta personal · Privada</p>
          <h2 id="vp-goal-title">{goal?.label}</h2>
        </div>
        <SiteLink className="vp-goal-edit" href="/escuela/bienvenida">
          <PencilSimple size={18} />
          Ajustar mi meta
        </SiteLink>
      </div>
      <div className="vp-goal-grid">
        <GoalMeasurePanel />
        <div className="vp-goal-week">
          <span>Tu acción de la semana · {time?.label}</span>
          <p>{time?.action}</p>
          <button
            className="vp-btn vp-btn-secondary"
            onClick={() => {
              store.setPlan((old) =>
                old ? { ...old, weeksDone: old.weeksDone + 1 } : old,
              );
              store.setNotice("Semana registrada en tu meta de muestra.");
            }}
          >
            <CheckCircle size={18} />
            La cumplí esta semana
          </button>
          <small>
            {plan.weeksDone === 1
              ? "1 semana cumplida"
              : `${plan.weeksDone} semanas cumplidas`}
          </small>
        </div>
      </div>
      <h3 className="vp-goal-chart-title">Tu ruta sugerida</h3>
      <p className="vp-goal-route-note">
        {passed} de {total} tests aprobados en tu ruta. Este avance mide tus
        cursos; tu meta se mide con tus propios registros.
      </p>
      <ol className="vp-goal-chart">
        {route.map((course) => {
          const done = Math.min(
            (store.tests[course.id] ?? []).length,
            course.lessons.length,
          );
          const owned = store.enrolled.includes(course.id);
          const access = hasAccess(store.membership);
          const label = owned ? "Ir al curso" : access ? "Empezar" : "Ver membresía";
          return (
            <li key={course.id}>
              <span className="vp-goal-chart-label">
                <strong>{course.title}</strong>
                <small>
                  {hasBadge(store.tests, course)
                    ? "Insignia obtenida"
                    : `${done} de ${course.lessons.length} tests`}
                </small>
              </span>
              <span className="vp-goal-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${(done / course.lessons.length) * 100}%`,
                  }}
                />
              </span>
              <button
                className="vp-table-action"
                aria-label={`${label}: ${course.title}`}
                onClick={() => {
                  store.setSelectedCourse(course.id);
                  if (!owned && !access) {
                    navigate("/escuela/membresia");
                    return;
                  }
                  if (!owned)
                    store.setEnrolled((old) => [...new Set([...old, course.id])]);
                  navigate("/escuela/aula");
                }}
              >
                {label}
                <ArrowUpRight size={17} />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
const plainNumber = (value: number) => new Intl.NumberFormat("es-CO").format(value);

/** The learner's own measure: statement, unit, starting point, target, deadline and weekly logs. */
function GoalMeasurePanel() {
  const store = useDemo();
  const measure = store.plan?.measure;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  function log(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = Number(value.replace(",", "."));
    if (value.trim() === "" || !Number.isFinite(number) || number < 0) {
      setError("Escribe un número igual o mayor que 0.");
      return;
    }
    store.setPlan((old) =>
      old?.measure
        ? {
            ...old,
            measure: {
              ...old.measure,
              logs: [...old.measure.logs, { date: todayIso(), value: number, action: action.trim() }],
            },
          }
        : old,
    );
    setValue("");
    setAction("");
    setError("");
    store.setNotice("Avance registrado en tu meta de muestra.");
  }
  if (!measure)
    return (
      <div className="vp-goal-progress vp-goal-empty">
        <span>Avance hacia tu meta</span>
        <p>
          Todavía no mostramos un porcentaje. Primero define cómo vas a medir
          lo que quieres lograr.
        </p>
        <button className="vp-btn vp-btn-primary" onClick={() => setEditing(true)}>
          <ChartLineUp size={18} />
          Definir cómo mediré mi meta
        </button>
        <GoalMeasureForm open={editing} onClose={() => setEditing(false)} />
      </div>
    );
  const percent = goalProgress(measure);
  const latest = measure.logs.at(-1)?.value ?? measure.start;
  const max = Math.max(measure.start, measure.target, ...measure.logs.map((item) => item.value), 1);
  return (
    <div className="vp-goal-progress">
      <span>Avance hacia tu meta</span>
      <p className="vp-goal-statement">«{measure.statement}»</p>
      <strong>{percent}%</strong>
      <small>
        Hoy: {plainNumber(latest)} {measure.unit}. Empezaste en{" "}
        {plainNumber(measure.start)} y tu meta es {plainNumber(measure.target)} antes del{" "}
        {formatDate(measure.deadline)}.
      </small>
      <div className="vp-goal-ring" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <h3 className="vp-goal-log-title">Tus registros</h3>
      <ol className="vp-goal-log">
        <li>
          <span>Punto de partida</span>
          <span className="vp-goal-bar" aria-hidden="true">
            <span style={{ width: `${(measure.start / max) * 100}%` }} />
          </span>
          <strong>{plainNumber(measure.start)}</strong>
        </li>
        {measure.logs.map((item, index) => (
          <li key={index}>
            <span>
              {formatDate(item.date)}
              {item.action && <small>{item.action}</small>}
            </span>
            <span className="vp-goal-bar" aria-hidden="true">
              <span style={{ width: `${(item.value / max) * 100}%` }} />
            </span>
            <strong>{plainNumber(item.value)}</strong>
          </li>
        ))}
        <li className="vp-goal-target">
          <span>Meta</span>
          <span className="vp-goal-bar" aria-hidden="true">
            <span style={{ width: `${(measure.target / max) * 100}%` }} />
          </span>
          <strong>{plainNumber(measure.target)}</strong>
        </li>
      </ol>
      <form className="vp-form vp-goal-log-form" onSubmit={log} noValidate>
        <label className="vp-field">
          Valor de esta semana ({measure.unit})
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="vp-field">
          Qué hiciste (opcional)
          <input value={action} maxLength={140} onChange={(e) => setAction(e.target.value)} />
        </label>
        {error && (
          <div className="vp-form-error" role="alert">
            <WarningCircle size={20} />
            {error}
          </div>
        )}
        <div className="vp-form-actions">
          <button className="vp-btn vp-btn-primary" type="submit">
            Registrar mi avance
          </button>
          <button className="vp-text-button" type="button" onClick={() => setEditing(true)}>
            Cambiar mi medida
          </button>
        </div>
      </form>
      <GoalMeasureForm open={editing} onClose={() => setEditing(false)} current={measure} />
    </div>
  );
}

function GoalMeasureForm({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current?: GoalMeasure;
}) {
  const store = useDemo();
  const [statement, setStatement] = useState(current?.statement ?? "");
  const [unit, setUnit] = useState(current?.unit ?? "");
  const [start, setStart] = useState(current ? String(current.start) : "");
  const [target, setTarget] = useState(current ? String(current.target) : "");
  const [deadline, setDeadline] = useState(current?.deadline ?? "");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const from = Number(start.replace(",", "."));
    const to = Number(target.replace(",", "."));
    const problem =
      statement.trim().length < 5
        ? "Cuéntanos en una frase qué quieres lograr."
        : unit.trim().length < 3
          ? "Escribe qué vas a contar o medir."
          : start.trim() === "" || !Number.isFinite(from) || from < 0
            ? "El punto de partida debe ser un número igual o mayor que 0."
            : target.trim() === "" || !Number.isFinite(to) || to < 0
              ? "La meta debe ser un número igual o mayor que 0."
              : from === to
                ? "La meta debe ser distinta de tu punto de partida."
                : !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || deadline <= todayIso()
                  ? "Elige un plazo posterior a hoy."
                  : "";
    if (problem) {
      setError(problem);
      return;
    }
    store.setPlan((old) =>
      old
        ? {
            ...old,
            measure: {
              statement: statement.trim(),
              unit: unit.trim(),
              start: from,
              target: to,
              deadline,
              logs: current && current.start === from ? current.logs : [],
            },
          }
        : old,
    );
    setError("");
    onClose();
    store.setNotice("Tu medida quedó guardada en esta demo.");
  }
  return (
    <Modal open={open} title="Cómo mediré mi meta" onClose={onClose} wide>
      <form className="vp-form vp-panel-body" onSubmit={save} noValidate>
        {error && (
          <div className="vp-form-error" role="alert" ref={errorRef} tabIndex={-1}>
            <WarningCircle size={20} />
            {error}
          </div>
        )}
        <label className="vp-field">
          ¿Qué quieres lograr, en tus palabras?
          <textarea
            rows={2}
            maxLength={200}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Por ejemplo: hablar más seguido con mis nietos por videollamada"
          />
        </label>
        <label className="vp-field">
          ¿Qué vas a contar o medir?
          <input
            maxLength={80}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="videollamadas por semana"
          />
        </label>
        <div className="vp-form-grid">
          <label className="vp-field">
            Punto de partida
            <input inputMode="decimal" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="vp-field">
            Meta
            <input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
          <label className="vp-field">
            Plazo
            <input type="date" value={deadline} min={todayIso()} onChange={(e) => setDeadline(e.target.value)} />
          </label>
        </div>
        <p className="vp-small-note">
          Tu meta es privada: no aparece en el CRM ni en los informes para
          empresas.
        </p>
        <button className="vp-btn vp-btn-primary" type="submit">
          Guardar mi medida
        </button>
      </form>
    </Modal>
  );
}

/** Requirements shown on the course sheet and in the classroom. */
export function BadgeRules({ lessons }: { lessons: number }) {
  return (
    <div className="vp-badge-rules">
      <h4>
        <Certificate size={20} weight="light" />
        Requisitos para la insignia
      </h4>
      <ul>
        {badgeRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
        <li>Este curso tiene {lessons} tests, uno por lección.</li>
      </ul>
    </div>
  );
}

/** One test per lesson. Lessons stay open; tests unlock in order. */
export function LessonTest({
  course,
  lesson,
  onGo,
}: {
  course: ManagedCourse;
  lesson: number;
  onGo: (lesson: number) => void;
}) {
  const store = useDemo();
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<"" | "right" | "wrong">("");
  const passedList = store.tests[course.id] ?? [];
  const passed = passedList.includes(lesson);
  const locked = lesson > 0 && !passedList.includes(lesson - 1);
  const quiz = quizFor(course.id, course.lessons, lesson);
  const last = lesson >= course.lessons.length - 1;

  if (locked)
    return (
      <div className="vp-test-locked">
        <LockSimple size={28} weight="light" />
        <h2>Este test se abre después del anterior.</h2>
        <p>
          Puedes ver esta lección cuando quieras. Para avanzar hacia la
          insignia, primero aprueba el test de la lección{" "}
          {passedList.length + 1}.
        </p>
        <button
          className="vp-btn vp-btn-secondary"
          onClick={() => onGo(Math.min(passedList.length, course.lessons.length - 1))}
        >
          Ir al test de la lección {passedList.length + 1}
          <ArrowRight size={18} />
        </button>
      </div>
    );

  function check(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (choice === null) return;
    if (choice !== quiz.answer) {
      setResult("wrong");
      return;
    }
    setResult("right");
    store.setTests((old) => ({
      ...old,
      [course.id]: [...new Set([...(old[course.id] ?? []), lesson])],
    }));
  }

  return (
    <form className="vp-test" onSubmit={check}>
      <p className="eyebrow">
        Test de la lección {lesson + 1} de {course.lessons.length}
      </p>
      {passed && result !== "right" ? (
        <div className="vp-feedback">
          <CheckCircle size={20} />
          Ya aprobaste este test. Puedes responderlo otra vez para repasar.
        </div>
      ) : null}
      <fieldset className="vp-choice-group">
        <legend>{quiz.question}</legend>
        {quiz.options.map((option, index) => (
          <label className="vp-choice" key={option}>
            <input
              type="radio"
              name={`${id}-answer`}
              checked={choice === index}
              onChange={() => {
                setChoice(index);
                setResult("");
              }}
            />
            <span>
              <strong>{option}</strong>
            </span>
          </label>
        ))}
      </fieldset>
      <div role="status" aria-live="polite">
        {result === "right" ? (
          <div className="vp-feedback">
            <CheckCircle size={20} />
            <span>
              <strong>Respuesta correcta.</strong> {quiz.why}
            </span>
          </div>
        ) : result === "wrong" ? (
          <div className="vp-form-error">
            <WarningCircle size={20} />
            <span>
              Esa no es la respuesta. Vuelve a la lección y prueba otra vez,
              puedes intentarlo las veces que necesites.
            </span>
          </div>
        ) : null}
      </div>
      <div className="vp-form-actions">
        <button
          className="vp-btn vp-btn-primary"
          type="submit"
          disabled={choice === null}
        >
          Comprobar respuesta
        </button>
        {result === "right" && !last && (
          <button
            type="button"
            className="vp-btn vp-btn-secondary"
            onClick={() => onGo(lesson + 1)}
          >
            Siguiente test
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </form>
  );
}

export function BadgeEarned({ course }: { course: ManagedCourse }) {
  return (
    <div className="vp-badge-earned" role="status">
      <Certificate size={44} weight="light" />
      <div>
        <strong>Obtuviste la insignia de este curso.</strong>
        <p>
          Aprobaste los {course.lessons.length} tests. El curso queda marcado
          como terminado. Insignia de muestra: aún no se emite un certificado.
        </p>
      </div>
    </div>
  );
}

/** Rating and suggestions. Only reviews the student authorizes reach reports. */
export function CourseReviewForm({ course }: { course: ManagedCourse }) {
  const store = useDemo();
  const existing = store.reviews.find(
    (review) => review.courseId === course.id && review.name === store.session?.name,
  );
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [suggestion, setSuggestion] = useState(existing?.suggestion ?? "");
  const [shareable, setShareable] = useState(existing?.shareable ?? false);
  const [error, setError] = useState("");
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stars) {
      setError("Elige una valoración de 1 a 5 estrellas.");
      return;
    }
    setError("");
    const name = store.session?.name ?? "Laura Gómez";
    store.setReviews((old) => [
      ...old.filter((review) => !(review.courseId === course.id && review.name === name)),
      { courseId: course.id, name, stars, comment, suggestion, shareable },
    ]);
    store.setNotice(
      shareable
        ? "Gracias. Tu opinión de muestra quedó guardada y autorizada para reportes."
        : "Gracias. Tu opinión de muestra quedó guardada solo para el equipo del curso.",
    );
  }
  return (
    <form className="vp-form vp-review" onSubmit={save}>
      <h2>¿Cómo te pareció este curso?</h2>
      <fieldset className="vp-stars">
        <legend>Valoración</legend>
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="stars"
              value={value}
              checked={stars === value}
              onChange={() => setStars(value)}
            />
            <Star size={26} weight={value <= stars ? "fill" : "regular"} aria-hidden="true" />
            <span className="sr-only">
              {value === 1 ? "1 estrella" : `${value} estrellas`}
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
      <label className="vp-field">
        Tu opinión (opcional)
        <textarea
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      <label className="vp-field">
        Una sugerencia para mejorarlo (opcional)
        <textarea
          rows={3}
          maxLength={1000}
          value={suggestion}
          onChange={(event) => setSuggestion(event.target.value)}
        />
      </label>
      <label className="vp-checkbox">
        <input
          type="checkbox"
          checked={shareable}
          onChange={(event) => setShareable(event.target.checked)}
        />
        Autorizo que Vasees use mi valoración y mi opinión en reportes de la
        Escuela. Sin esta autorización, solo la ve el equipo del curso.
      </label>
      <button className="vp-btn vp-btn-primary" type="submit">
        {existing ? "Actualizar mi valoración" : "Enviar valoración de muestra"}
      </button>
    </form>
  );
}

export function MyBadges() {
  const store = useDemo();
  const earned = store.courses.filter((course) => hasBadge(store.tests, course));
  if (!earned.length)
    return (
      <Empty
        title="Tu primera insignia está cerca."
        text="Aprueba en orden los tests de un curso para obtenerla."
        action={
          <SiteLink className="vp-btn vp-btn-primary" href="/escuela/mis-cursos">
            Ir a mis cursos
          </SiteLink>
        }
      />
    );
  return (
    <ul className="vp-badge-list">
      {earned.map((course) => (
        <li key={course.id}>
          <Certificate size={34} weight="light" />
          <span>
            <strong>{course.title}</strong>
            <small>
              {course.category} · {course.lessons.length} tests aprobados
            </small>
          </span>
          <Badge tone="success">Insignia de muestra</Badge>
        </li>
      ))}
    </ul>
  );
}

/** Admin report: authorized reviews only. Goals and notes are never included. */
export function AuthorizedReviews() {
  const store = useDemo();
  const shown = store.reviews.filter((review) => review.shareable);
  const hidden = store.reviews.length - shown.length;
  return (
    <section className="vp-panel vp-reviews-report">
      <div className="vp-panel-heading">
        <h2>Opiniones autorizadas</h2>
        <Badge tone="ivory">Reporte de muestra</Badge>
      </div>
      <div className="vp-panel-body">
        {shown.length ? (
          <ul>
            {shown.map((review) => (
              <li key={`${review.courseId}-${review.name}`}>
                <strong>
                  {store.courses.find((course) => course.id === review.courseId)?.title}
                </strong>
                <span>
                  {review.stars} de 5 · {review.name}
                </span>
                {review.comment && <p>{review.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aún no hay opiniones autorizadas.</p>
        )}
        <p className="vp-small-note">
          {hidden === 1
            ? "1 opinión no autorizada queda fuera del reporte."
            : `${hidden} opiniones no autorizadas quedan fuera del reporte.`}{" "}
          Las metas personales y las notas de estudiantes nunca se incluyen.
        </p>
      </div>
    </section>
  );
}
