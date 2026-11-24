// Part 2 of the School rebuild: onboarding choices, lesson tests and badge rules.
// Every question comes from its lesson's own text. All of it is sample content for the demo.
import { schoolRoutes, type Lesson } from './school';

export type QuizQuestion = { question: string; options: string[]; answer: number; why: string };

export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  'cuidar-sin-dejar-de-vivir': [
    { question: 'Según la lección, ¿qué conviene hacer antes de ofrecer ayuda?', options: ['Resolver la tarea para ahorrar tiempo', 'Preguntar qué necesita la otra persona y qué quiere seguir haciendo', 'Esperar a que la situación sea urgente'], answer: 1, why: 'Escuchar permite reconocer lo que la otra persona necesita y también tus propios límites.' },
    { question: '¿Para qué sirve nombrar las tareas de cuidado?', options: ['Para distribuir responsabilidades y pedir ayuda de forma concreta', 'Para demostrar quién hace más', 'Para dejar de conversar sobre ellas'], answer: 0, why: 'Hacer visible el cuidado ayuda a repartirlo y a pedir apoyos específicos.' },
    { question: '¿Cómo propone la lección empezar una conversación sobre apoyos?', options: ['Con un plan completo para toda la familia', 'Con una necesidad pequeña y una petición específica', 'Cuando ya no haya otra opción'], answer: 1, why: 'Una petición concreta y pequeña es un punto de partida posible.' },
  ],
  'generaciones-que-se-encuentran': [
    { question: '¿Qué dice la lección sobre la edad?', options: ['Explica por sí sola lo que una persona sabe', 'Es una parte de nuestra historia, pero no lo explica todo', 'Define lo que alguien disfruta'], answer: 1, why: 'Cada persona reúne experiencias, contextos y decisiones diferentes.' },
    { question: 'Para conversar con alguien de otra generación, ¿hace falta coincidir en todo?', options: ['Sí, si no la conversación no sirve', 'No: podemos escuchar una experiencia sin compartir todas sus conclusiones', 'Solo si la otra persona es mayor'], answer: 1, why: 'Preguntar por el contexto abre una conversación más amplia.' },
    { question: '¿En qué dirección va el intercambio de conocimientos?', options: ['Siempre de la persona mayor a la menor', 'Siempre de la persona menor a la mayor', 'En las dos direcciones'], answer: 2, why: 'Una actividad cotidiana puede servir para enseñar algo y aprender otra cosa.' },
  ],
  'proposito-que-sigue-creciendo': [
    { question: '¿Qué ayuda a reconocer nuevas posibilidades según la lección?', options: ['Observar qué actividades despiertan curiosidad o dan sentido', 'Mantener los mismos intereses siempre', 'Esperar a jubilarse'], answer: 0, why: 'Los intereses cambian con el tiempo y vale la pena volver a mirarlos.' },
    { question: '¿Hace falta un plan completo para explorar una nueva etapa?', options: ['Sí, antes de dar cualquier paso', 'No: se puede empezar explorando qué mantener y qué cambiar', 'Solo si alguien más lo aprueba'], answer: 1, why: 'Una transición se puede explorar sin tenerlo todo resuelto.' },
    { question: '¿Cuál es un primer paso posible según la lección?', options: ['Cambiar toda la rutina de una vez', 'Una acción pequeña, como hablar con alguien o asistir a un encuentro', 'Esperar el momento perfecto'], answer: 1, why: 'Empezar con algo pequeño también es una manera de aprender.' },
  ],
  'tecnologia-que-nos-acerca': [
    { question: '¿Cuál es un buen punto de partida para aprender una herramienta digital?', options: ['Una lista de todas sus funciones', 'Algo que queremos hacer con ella', 'El manual completo'], answer: 1, why: 'La necesidad le da sentido al aprendizaje.' },
    { question: 'Al acompañar a alguien con una herramienta, ¿qué propone la lección?', options: ['Hacer todo por la otra persona', 'Explicar un paso y dejar que lo pruebe a su ritmo', 'Dejarla sola para que aprenda'], answer: 1, why: 'Acompañar sin reemplazar ayuda a ganar confianza.' },
    { question: '¿Qué dice la lección sobre las dudas?', options: ['Hay que conocer todas las funciones antes de preguntar', 'Reconocer una duda y consultar una fuente de confianza también es aprender', 'Las dudas significan que la herramienta no es para ti'], answer: 1, why: 'Practicar con una tarea pequeña construye aprendizajes propios.' },
  ],
  'acuerdos-para-cuidarnos': [
    { question: '¿Cuándo propone la lección hablar de cuidado?', options: ['Antes de que una situación sea urgente, en un momento tranquilo', 'Solo cuando ya hay una emergencia', 'Nunca, es mejor improvisar'], answer: 0, why: 'Conversar con calma permite expresar necesidades concretas.' },
    { question: '¿Qué hace más claro un acuerdo?', options: ['Que sea definitivo y no se revise', 'Nombrar qué tarea, quién puede asumirla y cuándo revisarla', 'Que una sola persona lo decida'], answer: 1, why: 'Quién, qué y cuándo, con permiso para volver a conversar.' },
    { question: '¿Qué hacer cuando un acuerdo ya no funciona?', options: ['Mantenerlo igual', 'Preguntar qué ha servido, qué sigue siendo difícil y ajustarlo', 'Abandonar la conversación'], answer: 1, why: 'Los acuerdos se revisan y se ajustan.' },
  ],
  'historias-que-nos-conectan': [
    { question: '¿Qué permite conocer una anécdota?', options: ['Algo del contexto, las decisiones y los vínculos de una persona', 'Solo datos históricos', 'Nada útil'], answer: 0, why: 'Escuchar con curiosidad abre preguntas nuevas.' },
    { question: '¿Cómo acompañar una historia?', options: ['Completarla por la otra persona', 'Dar tiempo, aceptar pausas y no apurar el relato', 'Llegar rápido a una conclusión'], answer: 1, why: 'Cada quien decide qué quiere contar y qué prefiere guardar.' },
    { question: '¿Qué propone la lección para que los relatos vayan y vuelvan?', options: ['Contar una experiencia propia y preguntar qué encuentra en ella la otra persona', 'Escuchar sin hablar nunca', 'Corregir la historia del otro'], answer: 0, why: 'Compartir algo propio permite reconocer diferencias y puntos de encuentro.' },
  ],
};

/** A course created in the demo CMS has no authored test yet; it gets a simple recognition question. */
export function quizFor(courseId: string, lessons: Lesson[], index: number): QuizQuestion {
  const authored = lessonQuizzes[courseId]?.[index];
  if (authored) return authored;
  const titles = lessons.map((lesson) => lesson.title || 'Lección sin título');
  const others = titles.filter((_, i) => i !== index).slice(0, 2);
  const options = [titles[index], ...others];
  return {
    question: '¿Cuál es el tema de esta lección?',
    options,
    answer: 0,
    why: 'Pregunta provisional: el test definitivo se redacta junto con el contenido del curso.',
  };
}

export const availabilityOptions = [
  { id: '30', label: '30 minutos a la semana', action: 'Ver una lección y responder su test.', lessons: 1 },
  { id: '60', label: 'Una hora a la semana', action: 'Ver dos lecciones, responder sus tests y llevar una reflexión a una conversación.', lessons: 2 },
  { id: '120', label: 'Dos horas o más a la semana', action: 'Completar un curso corto y compartir lo aprendido con alguien cercano.', lessons: 3 },
] as const;
export type AvailabilityId = typeof availabilityOptions[number]['id'];

// Goals reuse the public interest routes; "Mi propia longevidad" maps to life-project courses.
export const goalOptions = schoolRoutes.map((route) => ({
  id: route.id,
  label: route.title,
  text: route.text,
  categories: route.categories.length ? route.categories : ['Proyecto de vida'],
}));

export type LearnerPlan = {
  goal: string;
  interests: string[];
  availability: AvailabilityId;
  weeksDone: number;
  /** How the learner measures the goal. No percentage is shown until it exists. */
  measure?: GoalMeasure;
};

export type GoalLog = { date: string; value: number; action: string };
export type GoalMeasure = {
  /** The goal in the learner's own words. */
  statement: string;
  /** What is counted, e.g. "conversaciones con mi familia por semana". */
  unit: string;
  start: number;
  target: number;
  /** Deadline as YYYY-MM-DD. */
  deadline: string;
  logs: GoalLog[];
};

/** Share of the way from the starting point to the target, 0–100. Works for goals that go down too. */
export function goalProgress(measure: GoalMeasure) {
  const latest = measure.logs.at(-1)?.value ?? measure.start;
  const span = measure.target - measure.start;
  if (!span) return 0;
  return Math.max(0, Math.min(100, Math.round(((latest - measure.start) / span) * 100)));
}

/** Suggested route: courses from the goal's categories first, then the interests', at most three. */
export function suggestRoute<T extends { id: string; category: string; status: string }>(plan: Pick<LearnerPlan, 'goal' | 'interests'>, courses: T[]) {
  const published = courses.filter((course) => course.status === 'Publicado');
  const order = [plan.goal, ...plan.interests.filter((id) => id !== plan.goal)];
  const categories = order.flatMap((id) => goalOptions.find((goal) => goal.id === id)?.categories ?? []);
  const picked: T[] = [];
  for (const category of categories)
    for (const course of published)
      if (course.category === category && !picked.includes(course)) picked.push(course);
  return (picked.length ? picked : published).slice(0, 3);
}

export const badgeRules = [
  'Las lecciones están abiertas: puedes verlas en el orden que quieras.',
  'Para la insignia, responde los tests en orden: cada uno se abre al aprobar el anterior.',
  'Puedes repetir un test las veces que necesites.',
];
