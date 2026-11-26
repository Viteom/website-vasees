// Part 4: B2C memberships. Prices are internal examples, not an approved commercial offer.
export type PlanId = 'mensual' | 'anual';
export type MembershipStatus = 'activa' | 'cancelada' | 'pago-pendiente' | 'vencida' | 'ninguna';

export type Membership = {
  plan: PlanId | null;
  status: MembershipStatus;
  /** End of the paid period (ISO). Access lasts until then while active, cancelled or awaiting payment. */
  periodEnd: string;
  /** Plan chosen for the next period, if it changes. */
  nextPlan: PlanId | null;
  cancelReason: string;
  /** Company that funds part or all of the membership (B2B). */
  sponsor?: { company: string; funding: number };
};

export const plans = [
  { id: 'mensual' as const, name: 'Plan mensual', price: 49000, months: 1, cadence: 'cada mes', note: 'Puedes cancelar la renovación cuando quieras.' },
  { id: 'anual' as const, name: 'Plan anual', price: 490000, months: 12, cadence: 'cada año', note: 'Equivale a pagar 10 meses del plan mensual.' },
];
export const planById = (id: PlanId | null) => plans.find((plan) => plan.id === id);

/** Only what the demo already implements. */
export const membershipIncludes = [
  'Todos los cursos publicados de la Escuela, a tu ritmo.',
  'Tests e insignias de cada curso.',
  'Encuentros en vivo y presenciales, según cupos.',
  'Foros de la comunidad por curso.',
];

export const cancelReasons = [
  'El precio no me funciona ahora',
  'No tengo tiempo para aprovecharla',
  'Ya terminé lo que quería aprender',
  'No encontré los temas que buscaba',
  'Prefiero no decirlo',
];

export const statusLabel: Record<MembershipStatus, string> = {
  activa: 'Activa',
  cancelada: 'Renovación cancelada',
  'pago-pendiente': 'Pago pendiente',
  vencida: 'Vencida',
  ninguna: 'Sin membresía',
};
export const statusTone: Record<MembershipStatus, string> = {
  activa: 'success',
  cancelada: 'pending',
  'pago-pendiente': 'danger',
  vencida: 'danger',
  ninguna: '',
};

/** Courses, forums and encuentros need an active, cancelled-but-paid or payment-pending membership. */
export const hasAccess = (membership: Membership) =>
  membership.status === 'activa' || membership.status === 'cancelada' || membership.status === 'pago-pendiente';

export function addMonths(iso: string, months: number) {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' }).format(new Date(iso));

/** Starts a fresh paid period from now. */
export const newPeriod = (plan: PlanId, from = new Date().toISOString()): Membership => ({
  plan,
  status: 'activa',
  periodEnd: addMonths(from, planById(plan)?.months ?? 1),
  nextPlan: null,
  cancelReason: '',
});

export const noMembership: Membership = { plan: null, status: 'ninguna', periodEnd: new Date().toISOString(), nextPlan: null, cancelReason: '' };
