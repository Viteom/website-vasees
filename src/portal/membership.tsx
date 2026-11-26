import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  IdentificationCard,
  LockSimple,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { useDemo, money, type DemoOrder } from "./demo-store";
import { SiteLink, navigate } from "../navigation";
import { Badge, Modal, PageHeading } from "./shared";
import {
  addMonths,
  cancelReasons,
  formatDay,
  hasAccess,
  membershipIncludes,
  newPeriod,
  planById,
  plans,
  statusLabel,
  statusTone,
  type PlanId,
} from "../content/membership";

const demoCard = "Tarjeta de prueba terminada en 4242";

function useCharge() {
  const store = useDemo();
  return (plan: PlanId, status: DemoOrder["status"]) => {
    const info = planById(plan);
    store.setOrders((old) => [
      {
        id: `DEMO-${Date.now().toString().slice(-6)}`,
        userId: "student-demo",
        name: store.session?.name ?? "Laura Gómez",
        concept: info?.name ?? "Membresía",
        amount: info?.price ?? 0,
        status,
        date: "Esta sesión",
      },
      ...old,
    ]);
  };
}

function PlanCards({ action }: { action: (plan: PlanId) => void }) {
  return (
    <div className="vp-plan-grid">
      {plans.map((plan) => (
        <article className="vp-plan" key={plan.id}>
          <h3>{plan.name}</h3>
          <p className="vp-plan-price">
            <strong>{money(plan.price)}</strong> {plan.cadence}
          </p>
          <p>{plan.note}</p>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => action(plan.id)}
          >
            Elegir {plan.name.toLowerCase()}
            <ArrowRight size={18} />
          </button>
        </article>
      ))}
    </div>
  );
}

function Includes() {
  return (
    <section className="vp-membership-includes" aria-labelledby="vp-includes-title">
      <h2 id="vp-includes-title">Qué incluye</h2>
      <ul>
        {membershipIncludes.map((item) => (
          <li key={item}>
            <CheckCircle size={20} weight="light" />
            {item}
          </li>
        ))}
      </ul>
      <p className="vp-small-note">
        Valores de muestra en pesos colombianos. No son una oferta comercial
        aprobada: precio, renovación, cancelación y devoluciones se publicarán
        en los términos del servicio educativo, con revisión jurídica.
      </p>
    </section>
  );
}

export function MembershipPage() {
  const store = useDemo();
  const charge = useCharge();
  const m = store.membership;
  const plan = planById(m.plan);
  const next = planById(m.nextPlan ?? m.plan);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [scenario, setScenario] = useState("Aprobado");
  const [retryError, setRetryError] = useState(false);

  function choose(planId: PlanId) {
    store.setCheckoutPlan(planId);
    navigate("/escuela/pago");
  }
  function renew() {
    // The next charge uses the plan chosen for the next period.
    const planId = m.nextPlan ?? m.plan ?? "mensual";
    if (scenario === "Rechazado") {
      charge(planId, "Rechazado");
      store.setMembership((old) => ({ ...old, status: "pago-pendiente" }));
      return false;
    }
    charge(planId, "Simulado");
    store.setMembership((old) => ({
      plan: planId,
      status: "activa",
      periodEnd: addMonths(old.periodEnd, planById(planId)?.months ?? 1),
      nextPlan: null,
      cancelReason: "",
    }));
    return true;
  }
  function endPeriod() {
    setRetryError(false);
    if (m.status === "activa") {
      const ok = renew();
      store.setNotice(
        ok
          ? "Renovación simulada: comenzó un nuevo periodo."
          : "El cobro de renovación de prueba fue rechazado.",
      );
      return;
    }
    store.setMembership((old) => ({ ...old, status: "vencida" }));
    store.setNotice("La membresía de muestra venció.");
  }
  function confirmCancel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text =
      reason === "Otro motivo" ? otherReason.trim() || "Otro motivo" : reason;
    store.setMembership((old) => ({
      ...old,
      status: "cancelada",
      nextPlan: null,
      cancelReason: text,
    }));
    setCancelling(false);
    store.setNotice(
      `Cancelaste la renovación. Mantienes el acceso hasta el ${formatDay(m.periodEnd)}.`,
    );
  }

  if (m.status === "ninguna" || m.status === "vencida")
    return (
      <>
        <PageHeading
          eyebrow="Escuela de Familia y Longevidad"
          title={m.status === "vencida" ? "Vuelve cuando quieras." : "Tu membresía."}
          description="Con una membresía accedes a todos los cursos, los encuentros y la comunidad de la Escuela."
        />
        {m.status === "vencida" && (
          <div className="vp-membership-alert" role="status">
            <WarningCircle size={22} />
            <p>
              Tu membresía venció el {formatDay(m.periodEnd)}. Tu perfil, tu
              meta y tus insignias siguen aquí. Para volver al aula, los foros y
              los encuentros, elige un plan.
            </p>
          </div>
        )}
        <PlanCards action={choose} />
        <Includes />
      </>
    );

  return (
    <>
      <PageHeading
        eyebrow="Escuela de Familia y Longevidad"
        title="Tu membresía."
        description="Consulta tu plan, cambia la renovación o cancélala cuando quieras."
      />
      <section className="vp-membership-card" aria-labelledby="vp-plan-title">
        <div className="vp-membership-head">
          <IdentificationCard size={30} weight="light" />
          <div>
            <h2 id="vp-plan-title">{plan?.name}</h2>
            <p>
              {m.sponsor
                ? `Financiado por ${m.sponsor.company} (${m.sponsor.funding} %)`
                : `${money(plan?.price ?? 0)} ${plan?.cadence} · valor de muestra`}
            </p>
          </div>
          <Badge tone={statusTone[m.status]}>{statusLabel[m.status]}</Badge>
        </div>
        {m.status === "activa" && (
          <p className="vp-membership-line">
            Se renueva el <strong>{formatDay(m.periodEnd)}</strong> por{" "}
            {money(next?.price ?? 0)} ({next?.name.toLowerCase()}).
          </p>
        )}
        {m.status === "cancelada" && (
          <div className="vp-membership-alert" role="status">
            <CheckCircle size={22} />
            <p>
              Cancelaste la renovación. Mantienes el acceso hasta el{" "}
              <strong>{formatDay(m.periodEnd)}</strong> y no se hará un nuevo
              cobro.
            </p>
          </div>
        )}
        {m.status === "pago-pendiente" && (
          <div className="vp-membership-alert danger" role="alert">
            <WarningCircle size={22} />
            <p>
              No pudimos cobrar la renovación con tu {demoCard.toLowerCase()}.
              Mantienes el acceso mientras lo resuelves. Puedes reintentar el
              pago.
            </p>
          </div>
        )}
        <dl className="vp-membership-facts">
          <div>
            <dt>Método de pago</dt>
            <dd>{demoCard} · ficticia, sin datos bancarios reales</dd>
          </div>
          <div>
            <dt>{m.status === "activa" ? "Periodo actual hasta" : "Acceso hasta"}</dt>
            <dd>{formatDay(m.periodEnd)}</dd>
          </div>
        </dl>
        <div className="vp-form-actions">
          {m.status === "activa" &&
            plans
              .filter((item) => item.id !== (m.nextPlan ?? m.plan))
              .map((item) => (
                <button
                  key={item.id}
                  className="vp-btn vp-btn-secondary"
                  onClick={() => {
                    store.setMembership((old) => ({
                      ...old,
                      nextPlan: item.id === old.plan ? null : item.id,
                    }));
                    store.setNotice(
                      item.id === m.plan
                        ? `Mantienes el ${item.name.toLowerCase()}.`
                        : `Desde el ${formatDay(m.periodEnd)} pasarás al ${item.name.toLowerCase()}.`,
                    );
                  }}
                >
                  {item.id === m.plan
                    ? `Mantener el ${item.name.toLowerCase()}`
                    : `Cambiar al ${item.name.toLowerCase()} desde el próximo periodo`}
                </button>
              ))}
          {m.status === "activa" && (
            <button
              className="vp-btn vp-btn-ghost"
              onClick={() => {
                setReason("");
                setOtherReason("");
                setCancelling(true);
              }}
            >
              Cancelar la renovación
            </button>
          )}
          {m.status === "cancelada" && (
            <button
              className="vp-btn vp-btn-primary"
              onClick={() => {
                store.setMembership((old) => ({
                  ...old,
                  status: "activa",
                  cancelReason: "",
                }));
                store.setNotice("Reactivaste la renovación de tu membresía.");
              }}
            >
              Reactivar la renovación
            </button>
          )}
          {m.status === "pago-pendiente" && (
            <button
              className="vp-btn vp-btn-primary"
              onClick={() => {
                const ok = renew();
                setRetryError(!ok);
                if (ok) store.setNotice("Pago de prueba aprobado. Tu membresía sigue activa.");
              }}
            >
              <CreditCard size={18} />
              Reintentar el pago
            </button>
          )}
        </div>
        {retryError && (
          <div className="vp-form-error" role="alert">
            <WarningCircle size={20} />
            El pago de prueba fue rechazado otra vez. Cambia el resultado de
            prueba y vuelve a intentarlo.
          </div>
        )}
      </section>
      <section className="vp-demo-time" aria-labelledby="vp-demo-time-title">
        <h2 id="vp-demo-time-title">Simular en la demo</h2>
        <p>
          Prueba qué pasa al terminar el periodo: una renovación aprobada, un
          cobro rechazado o el vencimiento después de cancelar.
        </p>
        <div className="vp-form-actions">
          <label className="vp-field vp-inline-field">
            Resultado del próximo cobro
            <select
              aria-label="Resultado del próximo cobro"
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              <option>Aprobado</option>
              <option>Rechazado</option>
            </select>
          </label>
          <button className="vp-btn vp-btn-secondary" onClick={endPeriod}>
            Simular fin del periodo
          </button>
        </div>
      </section>
      <Includes />
      <Modal
        open={cancelling}
        title="Cancelar la renovación"
        onClose={() => setCancelling(false)}
      >
        <form className="vp-form vp-panel-body vp-community-form" onSubmit={confirmCancel}>
          <p>
            Mantienes el acceso hasta el <strong>{formatDay(m.periodEnd)}</strong>.
            Después, tu perfil y tus insignias se conservan.
          </p>
          <fieldset className="vp-choice-group">
            <legend>¿Nos cuentas por qué? (opcional)</legend>
            {[...cancelReasons, "Otro motivo"].map((item) => (
              <label className="vp-choice" key={item}>
                <input
                  type="radio"
                  name="cancel-reason"
                  checked={reason === item}
                  onChange={() => setReason(item)}
                />
                <span>
                  <strong>{item}</strong>
                </span>
              </label>
            ))}
          </fieldset>
          {reason === "Otro motivo" && (
            <label className="vp-field">
              Cuéntanos un poco más (opcional)
              <textarea
                rows={3}
                maxLength={500}
                value={otherReason}
                onChange={(event) => setOtherReason(event.target.value)}
              />
            </label>
          )}
          <p className="vp-small-note">
            Tu respuesta solo la ve el equipo de la Escuela para mejorar.
          </p>
          <div className="vp-form-actions">
            <button className="vp-btn vp-btn-primary" type="submit">
              Confirmar cancelación
            </button>
            <button
              type="button"
              className="vp-btn vp-btn-ghost"
              onClick={() => setCancelling(false)}
            >
              Mantener mi membresía
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/** Plan checkout. No real card or charge. */
export function MembershipCheckout() {
  const store = useDemo();
  const charge = useCharge();
  const plan = planById(store.checkoutPlan) ?? plans[0];
  const [method, setMethod] = useState("Tarjeta");
  const [scenario, setScenario] = useState("Aprobado");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consent, setConsent] = useState(false);
  // Evaluated on entry: coming back here must not offer a second charge.
  const [activeOnEntry] = useState(() => hasAccess(store.membership));
  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || state === "loading") return;
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (scenario === "Rechazado") {
      charge(plan.id, "Rechazado");
      setState("error");
      return;
    }
    charge(plan.id, "Simulado");
    store.setMembership(newPeriod(plan.id));
    setState("success");
  }
  return (
    <>
      <SiteLink className="vp-back-link" href="/escuela/membresia">
        <ArrowLeft size={17} />
        Mi membresía
      </SiteLink>
      <PageHeading
        eyebrow="Un siguiente paso para aprender"
        title="Activa tu membresía."
        description="Recorre una pasarela de pago de muestra. No se solicita una tarjeta real ni se realiza ningún cargo."
      />
      {activeOnEntry ? (
        <div className="vp-payment-success">
          <CheckCircle size={58} weight="light" />
          <Badge>Ya tienes acceso</Badge>
          <h2>Tu membresía ya está vigente.</h2>
          <p>No hace falta repetir el pago de prueba.</p>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate("/escuela/membresia")}
          >
            Ver mi membresía
            <ArrowRight size={18} />
          </button>
        </div>
      ) : state === "success" ? (
        <div className="vp-payment-success">
          <CheckCircle size={58} weight="light" />
          <Badge>Operación simulada</Badge>
          <h2>Tu membresía de muestra está activa.</h2>
          <p>
            No se ha realizado ningún cobro. Ya puedes entrar a los cursos, los
            encuentros y la comunidad.
          </p>
          <div className="vp-payment-summary">
            <span>{plan.name}</span>
            <strong>{money(plan.price)}</strong>
          </div>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate("/escuela/explorar")}
          >
            Explorar cursos
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
            <div className="vp-tab-bar" role="group" aria-label="Método de pago de prueba">
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
                  <input value="4242 4242 4242 4242" readOnly aria-describedby="vp-card-help" />
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
          </form>
          <aside className="vp-order-summary vp-plan-summary">
            <div>
              <Badge>Membresía · Muestra</Badge>
              <h2>{plan.name}</h2>
              <p>{plan.note}</p>
              <div className="vp-tab-bar" role="group" aria-label="Plan elegido">
                {plans.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={item.id === plan.id}
                    onClick={() => {
                      store.setCheckoutPlan(item.id);
                      setState("idle");
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="vp-order-total">
                <span>Total de prueba</span>
                <strong>{money(plan.price)}</strong>
              </div>
              <span className="vp-small-note">
                Se renueva {plan.cadence}. Valores ilustrativos en pesos
                colombianos. Sin cobro real.
              </span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Shown instead of the classroom, forums and encuentros when there is no access. */
export function MembershipGate({ area }: { area: string }) {
  const store = useDemo();
  const expired = store.membership.status === "vencida";
  return (
    <div className="vp-membership-gate">
      <LockSimple size={36} weight="light" />
      <h1 tabIndex={-1}>
        {expired ? "Tu membresía venció." : "Necesitas una membresía."}
      </h1>
      <p>
        {area} {expired ? "vuelven" : "se abren"} con una membresía activa. Tu
        perfil, tu meta y tus insignias siguen disponibles.
      </p>
      <SiteLink className="vp-btn vp-btn-primary" href="/escuela/membresia">
        {expired ? "Reactivar mi membresía" : "Ver planes de membresía"}
        <ArrowRight size={18} />
      </SiteLink>
    </div>
  );
}

/** Dashboard reminder when the membership needs attention. */
export function MembershipNotice() {
  const store = useDemo();
  const m = store.membership;
  if (m.status === "activa") return null;
  const text =
    m.status === "cancelada"
      ? `Cancelaste la renovación. Tienes acceso hasta el ${formatDay(m.periodEnd)}.`
      : m.status === "pago-pendiente"
        ? "No pudimos cobrar la renovación. Revisa tu método de pago para no perder el acceso."
        : m.status === "vencida"
          ? "Tu membresía venció. Reactívala para volver a los cursos, los encuentros y la comunidad."
          : "Aún no tienes una membresía. Elige un plan para entrar a los cursos.";
  return (
    <div
      className={`vp-membership-alert ${m.status === "pago-pendiente" || m.status === "vencida" ? "danger" : ""}`}
    >
      <ShieldCheck size={22} />
      <p>{text}</p>
      <SiteLink href="/escuela/membresia">Mi membresía</SiteLink>
    </div>
  );
}

export function AdminMemberships() {
  const store = useDemo();
  const m = store.membership;
  const student = store.users.find((user) => user.id === "u1");
  const rows = [
    {
      name: store.session?.role === "student" ? store.session.name : student?.name ?? "Laura Gómez",
      plan: planById(m.plan)?.name ?? "—",
      status: m.status,
      until: m.status === "ninguna" ? "—" : formatDay(m.periodEnd),
      reason: m.cancelReason,
      live: true,
    },
    ...store.sampleMembers.map((row) => ({
      ...row,
      plan: planById(row.plan)?.name ?? "—",
      until: formatDay(row.periodEnd),
      reason: row.cancelReason,
      live: false,
    })),
  ];
  const count = (status: string) => rows.filter((row) => row.status === status).length;
  return (
    <>
      <PageHeading
        eyebrow="Escuela de Familia y Longevidad"
        title="Membresías."
        description="Estado de las membresías, renovaciones y motivos de cancelación. Datos de muestra."
      />
      <div className="vp-stat-grid">
        {(["activa", "cancelada", "pago-pendiente", "vencida"] as const).map((status) => (
          <div key={status}>
            <span>{statusLabel[status]}</span>
            <strong>{count(status)}</strong>
            <small>Personas de muestra</small>
          </div>
        ))}
      </div>
      <section className="vp-panel">
        <div className="vp-panel-heading">
          <h2>Planes</h2>
          <Badge tone="pending">Precios de muestra</Badge>
        </div>
        <div className="vp-panel-body vp-admin-plans">
          {plans.map((plan) => (
            <p key={plan.id}>
              <strong>{plan.name}</strong> · {money(plan.price)} {plan.cadence}
            </p>
          ))}
          <p className="vp-small-note">
            Ejemplos internos, no una oferta comercial aprobada. Requieren
            términos del servicio educativo con revisión jurídica antes de
            publicarse.
          </p>
        </div>
      </section>
      <div
        className="vp-panel vp-table-wrap vp-members-table"
        role="region"
        aria-label="Personas y estado de su membresía"
        tabIndex={0}
      >
        <table className="vp-table">
          <caption className="sr-only">Personas y estado de su membresía</caption>
          <thead>
            <tr>
              <th>Persona</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Acceso hasta</th>
              <th>Motivo de cancelación</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <strong>{row.name}</strong>
                  {row.live && <small>Sesión de esta demo</small>}
                </td>
                <td>{row.plan}</td>
                <td>
                  <Badge tone={statusTone[row.status]}>{statusLabel[row.status]}</Badge>
                </td>
                <td>{row.until}</td>
                <td>{row.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="vp-community-note">
        <ShieldCheck size={20} weight="light" />
        Los motivos de cancelación son de uso interno y opcionales para quien
        cancela.
      </p>
    </>
  );
}
