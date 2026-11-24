import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Certificate,
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
import { Badge, Empty, PageHeading } from "./shared";
import {
  availabilityOptions,
  badgeRules,
  goalOptions,
  quizFor,
  suggestRoute,
  type AvailabilityId,
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
  const percent = total ? Math.round((passed / total) * 100) : 0;
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
        <div className="vp-goal-progress">
          <span>Avance hacia tu meta</span>
          <strong>{percent}%</strong>
          <small>
            {passed} de {total} tests aprobados en tu ruta
          </small>
          <div className="vp-goal-ring" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
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
