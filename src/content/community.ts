// Part 3: encuentros (live sessions) and course forums. All entries are sample content for the demo.
import { bogotaToUtc } from './calendar';

export type EncuentroStatus = 'Publicado' | 'Borrador' | 'Cancelado';
export type Encuentro = {
  id: string;
  title: string;
  description: string;
  format: 'En línea' | 'Presencial';
  location: string;
  start: string;
  end: string;
  capacity: number;
  /** Sample registrations from other people; the student's own one is tracked apart. */
  others: number;
  courseId: string;
  status: EncuentroStatus;
};

export const initialEncuentros: Encuentro[] = [
  {
    id: 'enc-cuidar-conversacion',
    title: 'Conversación abierta: cuidar sin dejar de vivir',
    description: 'Un espacio para compartir preguntas sobre el cuidado y escuchar otras experiencias. Encuentro de muestra de la Escuela de Familia y Longevidad.',
    format: 'En línea',
    location: 'En línea · el enlace se envía a las personas inscritas',
    start: bogotaToUtc('2026-12-03', '18:00'),
    end: bogotaToUtc('2026-12-03', '19:30'),
    capacity: 40,
    others: 12,
    courseId: 'cuidar-sin-dejar-de-vivir',
    status: 'Publicado',
  },
  {
    id: 'enc-generaciones-medellin',
    title: 'Historias entre generaciones',
    description: 'Encuentro presencial para conversar con personas de distintas edades a partir de una historia compartida. Encuentro de muestra.',
    format: 'Presencial',
    location: 'Medellín · lugar por confirmar',
    start: bogotaToUtc('2026-12-12', '10:00'),
    end: bogotaToUtc('2026-12-12', '12:00'),
    capacity: 20,
    others: 20,
    courseId: 'generaciones-que-se-encuentran',
    status: 'Publicado',
  },
  {
    id: 'enc-tecnologia-dudas',
    title: 'Tecnología que nos acerca: traemos nuestras dudas',
    description: 'Una sesión para resolver dudas concretas sobre herramientas digitales, a tu ritmo. Encuentro de muestra.',
    format: 'En línea',
    location: 'En línea · el enlace se envía a las personas inscritas',
    start: bogotaToUtc('2027-01-21', '17:00'),
    end: bogotaToUtc('2027-01-21', '18:00'),
    capacity: 30,
    others: 27,
    courseId: 'tecnologia-que-nos-acerca',
    status: 'Publicado',
  },
  {
    id: 'enc-proposito-borrador',
    title: 'Un propósito que sigue creciendo: primer paso',
    description: 'Borrador de encuentro para conversar sobre nuevas etapas.',
    format: 'En línea',
    location: 'En línea · el enlace se envía a las personas inscritas',
    start: bogotaToUtc('2027-02-11', '18:00'),
    end: bogotaToUtc('2027-02-11', '19:00'),
    capacity: 30,
    others: 0,
    courseId: 'proposito-que-sigue-creciendo',
    status: 'Borrador',
  },
];

export type ForumStatus = 'Visible' | 'Oculto';
export type ForumReply = { id: string; author: string; body: string; status: ForumStatus; mine?: boolean };
export type ForumThread = {
  id: string;
  /** '' is the general School forum. */
  courseId: string;
  title: string;
  author: string;
  body: string;
  status: ForumStatus;
  replies: ForumReply[];
  mine?: boolean;
};
export type ForumReport = {
  id: string;
  threadId: string;
  replyId?: string;
  reason: string;
  status: 'Pendiente' | 'Oculto' | 'Mantenido';
  /** Reported by the student in this session (other people's reports stay anonymous). */
  mine?: boolean;
};

export const reportReasons = [
  'Es irrespetuoso o agresivo',
  'Comparte datos personales de alguien',
  'Da información falsa o que puede hacer daño',
  'Es publicidad o spam',
  'Otro motivo',
];

export const forumGuidelines = [
  'Habla desde tu experiencia y escucha la de otras personas.',
  'No compartas datos personales tuyos ni de terceros.',
  'La Escuela no reemplaza una consulta médica, legal o psicológica.',
  'Si algo no te parece adecuado, repórtalo: el equipo lo revisa.',
];

/** Forums show first name and initial only. */
export const forumName = (name: string) => {
  const [first = 'Estudiante', last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
};

export const initialThreads: ForumThread[] = [
  {
    id: 'th-pedir-ayuda',
    courseId: 'cuidar-sin-dejar-de-vivir',
    title: '¿Cómo pedir ayuda sin sentir que fallo?',
    author: 'Andrés P.',
    body: 'Conversación de muestra. Después de la lección 2 hice la lista de tareas de cuidado y me di cuenta de que casi todo lo asumo yo. ¿Cómo empezaron ustedes a pedir apoyo?',
    status: 'Visible',
    replies: [
      { id: 'rp-1', author: 'Daniela R.', body: 'Respuesta de muestra. A mí me sirvió empezar por una tarea pequeña y ponerle día: "¿puedes acompañar la cita del jueves?".', status: 'Visible' },
      { id: 'rp-2', author: 'Usuario de muestra', body: 'Respuesta de muestra reportada para ver la moderación: escríbeme a mi número personal y te vendo un curso mejor.', status: 'Visible' },
    ],
  },
  {
    id: 'th-pregunta-generaciones',
    courseId: 'generaciones-que-se-encuentran',
    title: 'Una pregunta que me abrió una conversación',
    author: 'Daniela R.',
    body: 'Conversación de muestra. Probé "¿Cómo fue para ti…?" con mi abuela y terminamos hablando una hora. ¿Qué otras preguntas les han funcionado?',
    status: 'Visible',
    replies: [],
  },
  {
    id: 'th-bienvenida',
    courseId: '',
    title: 'Preséntate: ¿qué te trajo a la Escuela?',
    author: 'Equipo Vasees',
    body: 'Conversación de muestra. Cuéntanos qué te gustaría aprender y qué te gustaría compartir con la comunidad.',
    status: 'Visible',
    replies: [],
  },
];

export const initialReports: ForumReport[] = [
  { id: 'rep-1', threadId: 'th-pedir-ayuda', replyId: 'rp-2', reason: 'Es publicidad o spam', status: 'Pendiente' },
];
