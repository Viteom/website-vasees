// Part 5: companies that fund memberships (B2B) and the School CRM (B2C).
// Every company and person here is fictitious sample data; no real contracts are implied.
import type { MembershipStatus, PlanId } from './membership';

export type Company = {
  id: string;
  name: string;
  sector: string;
  /** Share of the membership the company pays, 0–100. */
  funding: number;
  plan: PlanId;
  seats: number;
  initialCourses: string[];
};

export type CourseProgress = { courseId: string; passed: number; lessons: number };

export type InviteStatus = 'Invitación pendiente' | 'Activa' | 'Revocada';
export type Collaborator = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  status: InviteStatus;
  courses: CourseProgress[];
  /** Days since the last activity; null before the first one. */
  lastActive: number | null;
  /** Authorized opinion, if any. Only these can reach company reports. */
  opinion?: string;
};

export type CrmPerson = {
  id: string;
  name: string;
  email: string;
  membership: MembershipStatus;
  courses: CourseProgress[];
  lastActive: number | null;
  registeredUpcoming: boolean;
  cancelReason: string;
  companyId?: string;
};

export const initialCompanies: Company[] = [
  { id: 'emp-alimentos', name: 'Alimentos del Valle (ejemplo)', sector: 'Alimentos', funding: 100, plan: 'anual', seats: 12, initialCourses: ['cuidar-sin-dejar-de-vivir', 'generaciones-que-se-encuentran'] },
  { id: 'emp-caja', name: 'Caja de Bienestar Andina (ejemplo)', sector: 'Bienestar y servicios sociales', funding: 60, plan: 'mensual', seats: 8, initialCourses: ['proposito-que-sigue-creciendo'] },
  { id: 'emp-confecciones', name: 'Confecciones Horizonte (ejemplo)', sector: 'Moda y manufactura', funding: 50, plan: 'mensual', seats: 6, initialCourses: ['tecnologia-que-nos-acerca'] },
];

const first = ['Ana', 'Jaime', 'Juan', 'Lucía', 'Marta', 'Óscar', 'Paula', 'Carlos', 'Sofía', 'Diego', 'Elena', 'Felipe', 'Gloria', 'Héctor', 'Isabel', 'Tomás', 'Valeria', 'Ramiro'];
const last = ['Restrepo', 'Gómez', 'Vélez', 'Moreno', 'Cárdenas', 'Ospina', 'Mejía', 'Rojas', 'Arango', 'Zapata', 'Salazar', 'Henao'];
const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const opinions = [
  'Ejemplo de opinión autorizada: me ayudó a organizar el cuidado en casa.',
  'Ejemplo de opinión autorizada: las preguntas de cada lección me sirven para conversar con mi familia.',
];

function collaboratorsFor(company: Company, count: number, pending: number, offset: number): Collaborator[] {
  return Array.from({ length: count + pending }, (_, i) => {
    const n = offset + i;
    const name = `${first[n % first.length]} ${last[(n * 5) % last.length]}`;
    const active = i < count;
    const passed = active ? (n * 7) % 4 : 0;
    return {
      id: `${company.id}-c${i}`,
      companyId: company.id,
      name,
      email: `${plain(name).replace(' ', '.')}@ejemplo.com`,
      status: active ? 'Activa' : 'Invitación pendiente',
      courses: active ? company.initialCourses.map((courseId, k) => ({ courseId, passed: Math.min(3, (passed + k) % 4), lessons: 3 })) : [],
      lastActive: active ? (n * 3) % 21 : null,
      opinion: active && i < 2 ? opinions[i] : undefined,
    };
  });
}

export const initialCollaborators: Collaborator[] = [
  ...collaboratorsFor(initialCompanies[0], 9, 2, 0),
  ...collaboratorsFor(initialCompanies[1], 5, 1, 11),
  ...collaboratorsFor(initialCompanies[2], 3, 1, 17),
];

/** Individual (B2C) members besides the live demo student. */
export const initialCrmPeople: CrmPerson[] = [
  { id: 'p-andres', name: 'Andrés Pérez', email: 'andres@example.com', membership: 'activa', courses: [{ courseId: 'generaciones-que-se-encuentran', passed: 3, lessons: 3 }, { courseId: 'tecnologia-que-nos-acerca', passed: 2, lessons: 3 }], lastActive: 2, registeredUpcoming: true, cancelReason: '' },
  { id: 'p-daniela', name: 'Daniela Ruiz', email: 'daniela@example.com', membership: 'vencida', courses: [{ courseId: 'cuidar-sin-dejar-de-vivir', passed: 1, lessons: 3 }], lastActive: 40, registeredUpcoming: false, cancelReason: 'El precio no me funciona ahora' },
  { id: 'p-mariana', name: 'Mariana Toro', email: 'mariana@example.com', membership: 'pago-pendiente', courses: [{ courseId: 'proposito-que-sigue-creciendo', passed: 2, lessons: 3 }], lastActive: 6, registeredUpcoming: false, cancelReason: '' },
  { id: 'p-gustavo', name: 'Gustavo Lema', email: 'gustavo@example.com', membership: 'activa', courses: [{ courseId: 'cuidar-sin-dejar-de-vivir', passed: 0, lessons: 3 }], lastActive: 19, registeredUpcoming: false, cancelReason: '' },
  { id: 'p-beatriz', name: 'Beatriz Ochoa', email: 'beatriz@example.com', membership: 'cancelada', courses: [{ courseId: 'tecnologia-que-nos-acerca', passed: 3, lessons: 3 }], lastActive: 9, registeredUpcoming: true, cancelReason: 'Ya terminé lo que quería aprender' },
];

export const isUpToDate = (status: MembershipStatus) => status === 'activa' || status === 'cancelada';
export const isActiveMember = (status: MembershipStatus) => status === 'activa' || status === 'cancelada' || status === 'pago-pendiente';

export const lastActiveLabel = (days: number | null) =>
  days === null ? 'Sin actividad' : days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`;

export const progressPercent = (courses: CourseProgress[]) => {
  const total = courses.reduce((sum, c) => sum + c.lessons, 0);
  return total ? Math.round((courses.reduce((sum, c) => sum + c.passed, 0) / total) * 100) : 0;
};

export type Segment = {
  id: 'continuidad' | 'finalizacion' | 'encuentros' | 'recuperacion' | 'pagos';
  title: string;
  rule: string;
  subject: string;
  body: string;
  match: (person: CrmPerson) => boolean;
};

export const segments: Segment[] = [
  {
    id: 'continuidad', title: 'Continuidad', rule: 'Membresía vigente y más de 14 días sin actividad.',
    subject: '{nombre}, tu curso te espera', body: 'Hola, {nombre}.\n\nHace unos días no pasas por la Escuela. Tu próxima lección de {curso} dura pocos minutos y puedes retomarla donde la dejaste.\n\nEquipo Vasees',
    match: (p) => isActiveMember(p.membership) && (p.lastActive ?? 99) > 14,
  },
  {
    id: 'finalizacion', title: 'Finalización', rule: 'Le falta un solo test para obtener la insignia de un curso.',
    subject: 'Estás a un paso de tu insignia', body: 'Hola, {nombre}.\n\nTe falta un solo test para obtener la insignia de {curso}. ¿Lo terminamos esta semana?\n\nEquipo Vasees',
    match: (p) => isActiveMember(p.membership) && p.courses.some((c) => c.lessons - c.passed === 1),
  },
  {
    id: 'encuentros', title: 'Encuentros', rule: 'Membresía vigente y sin inscripción en el próximo encuentro.',
    subject: 'Te invitamos al próximo encuentro', body: 'Hola, {nombre}.\n\nEl próximo encuentro de la Escuela es una buena oportunidad para conversar sobre {curso}. Puedes inscribirte y agregarlo a tu calendario.\n\nEquipo Vasees',
    match: (p) => isActiveMember(p.membership) && !p.registeredUpcoming,
  },
  {
    id: 'recuperacion', title: 'Recuperación', rule: 'Canceló la renovación o su membresía venció.',
    subject: 'Aquí sigue tu recorrido, {nombre}', body: 'Hola, {nombre}.\n\nTu perfil y tus insignias siguen en la Escuela. Si quieres volver, puedes reactivar tu membresía cuando lo decidas.\n\nEquipo Vasees',
    match: (p) => p.membership === 'cancelada' || p.membership === 'vencida',
  },
  {
    id: 'pagos', title: 'Pagos rechazados', rule: 'La renovación no se pudo cobrar.',
    subject: 'No pudimos renovar tu membresía', body: 'Hola, {nombre}.\n\nNo pudimos cobrar la renovación de tu membresía. Para seguir con {curso}, revisa tu método de pago en Mi membresía.\n\nEquipo Vasees',
    match: (p) => p.membership === 'pago-pendiente',
  },
];

/** "nombre,correo" per line; a header row is skipped. */
export function parseCsv(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,;]/).map((cell) => cell.trim().replace(/^"|"$/g, '')))
    .filter((cells, index) => !(index === 0 && /correo|email/i.test(cells.join(' '))))
    .map(([name = '', email = '']) => ({ name, email: email.toLowerCase() }));
}

export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
