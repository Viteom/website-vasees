import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeSlash,
  EnvelopeSimple,
  ArrowRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import { SiteLink, navigate } from "../../navigation";
import { portalPaths, useDemo } from "../../portal/demo-store";

const accessRoutes = [
  "/escuela/ingresar",
  "/escuela/registro",
  "/escuela/verificar",
  "/escuela/recuperar",
  "/escuela/nueva-contrasena",
];

export function LoginPage({ path }: { path: string }) {
  const store = useDemo();
  const admin = path.startsWith("/admin");
  const register = path === "/escuela/registro";
  const verify = path === "/escuela/verificar";
  const recover = path === "/escuela/recuperar";
  const reset = path === "/escuela/nueva-contrasena";
  // When the access screen replaces a private view, remember that view so the
  // visitor lands where they were heading instead of always on the home screen.
  const requested =
    portalPaths.includes(path) && !accessRoutes.includes(path) ? path : null;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Laura Gómez");
  const [email, setEmail] = useState(
    admin ? "admin@example.com" : "laura@ejemplo.com",
  );

  function demo(role: "student" | "admin") {
    store.setSession(
      role === "admin"
        ? { role, name: "Equipo Vasees", email: "admin@example.com" }
        : {
            role,
            name: store.authName || "Laura Gómez",
            email: store.authEmail || "laura@ejemplo.com",
          },
    );
    const destination =
      role === "admin"
        ? requested?.startsWith("/admin")
          ? requested
          : "/admin"
        : requested && !requested.startsWith("/admin")
          ? requested
          : store.authDestination;
    const course = store.courses.find(item => item.id === store.selectedCourse);
    if (role === "student" && destination === "/escuela/aula" && course?.price === 0) {
      store.setEnrolled(old => [...new Set([...old, course.id])]);
    }
    store.setAuthDestination("/escuela/inicio");
    navigate(destination);
  }
  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (verify) {
      if (code !== "123456") {
        setError("En esta demo, utiliza el código 123456.");
        return;
      }
      if (store.authIntent === "reset") {
        navigate("/escuela/nueva-contrasena");
        return;
      }
      demo("student");
      return;
    }
    if (reset) {
      setPassword("");
      store.setNotice(
        "Cambio de contraseña simulado. No se guardó ninguna contraseña.",
      );
      navigate("/escuela/ingresar");
      return;
    }
    if (admin) {
      setPassword("");
      demo("admin");
      return;
    }
    if (requested) store.setAuthDestination(requested);
    store.setAuthEmail(email);
    store.setAuthName(name || "Laura Gómez");
    store.setAuthIntent(recover ? "reset" : register ? "register" : "login");
    setPassword("");
    setCode("");
    navigate("/escuela/verificar");
  }

  const title = admin
    ? "Un espacio para hacer crecer Vasees."
    : verify
      ? "Confirma tu correo."
      : recover
        ? "Volvamos a encontrarnos."
        : reset
          ? "Una nueva contraseña."
          : register
            ? "Hay mucho por aprender."
            : "Qué bueno volver a encontrarnos.";
  return (
    <main className="vp-auth" id="contenido">
      <section className="vp-auth-art">
        <div className="vp-auth-art-top">
          <SiteLink
            href="/escuela"
            className="vp-auth-back"
            aria-label="Volver a la Escuela"
          >
            <ArrowLeft size={21} />
          </SiteLink>
          <img
            src="/images/vasees-logo.png"
            alt="Vasees"
            width="130"
            height="44"
          />
        </div>
        <div className="vp-auth-story">
          <p className="eyebrow">
            {admin ? "Vasees · Administración" : "Escuela de Hijos y Nietos"}
          </p>
          <h2>
            {admin ? (
              <>
                Las buenas ideas
                <br />
                también necesitan
                <br />
                <em>un lugar para crecer.</em>
              </>
            ) : (
              <>
                Tu próxima etapa
                <br />
                empieza con
                <br />
                <em>una buena pregunta.</em>
              </>
            )}
          </h2>
          <p>
            Más años. Más futuro.
            <br />
            Más posibilidades para aprender juntos.
          </p>
        </div>
        <img
          className="vp-auth-presenters"
          src="/images/school-mateo-melissa.webp"
          alt="Mateo y Melissa"
        />
        <span className="vp-auth-art-caption">
          Una invitación de Mateo y Melissa.
        </span>
      </section>
      <section className="vp-auth-form-panel">
        <div className="vp-auth-demo">
          <span />
          Prototipo interactivo · Sin acceso real
        </div>
        <div className="vp-auth-form-wrap">
          <p className="eyebrow">
            {admin ? "Backoffice Vasees" : "Tu Escuela, a tu ritmo"}
          </p>
          <h1 tabIndex={-1}>{title}</h1>
          <p className="vp-auth-subtitle">
            {admin ? (
              "Organiza cursos, páginas y las conversaciones que hacen parte de nuestro ecosistema."
            ) : verify ? (
              <>
                Código de demostración para <strong>{store.authEmail}</strong>.
                No se ha enviado un correo.
              </>
            ) : recover ? (
              "Explora cómo se verá la recuperación de acceso por correo."
            ) : reset ? (
              "Esta vista muestra el paso final de la recuperación. Los datos no se guardan."
            ) : register ? (
              "Crea tu perfil de muestra y explora una nueva manera de aprender."
            ) : (
              <>
                ¿Primera vez por aquí?{" "}
                <SiteLink href="/escuela/registro">Crea tu cuenta</SiteLink>
              </>
            )}
          </p>
          {store.notice && (
            <p className="vp-feedback" role="status">
              {store.notice}
            </p>
          )}
          <form className="vp-auth-form" onSubmit={submit} key={path}>
            {register && (
              <label>
                Tu nombre
                <input
                  autoComplete="off"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="¿Cómo te llamas?"
                  maxLength={100}
                />
              </label>
            )}
            {!verify && !reset && (
              <label>
                Correo electrónico
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={180}
                  placeholder="nombre@ejemplo.com"
                />
              </label>
            )}
            {!verify && !recover && (
              <label>
                {reset
                  ? "Nueva contraseña de muestra"
                  : "Contraseña de muestra"}
                <span className="vp-password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Usa una contraseña ficticia"
                    required
                    minLength={4}
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </span>
              </label>
            )}
            {verify && (
              <label>
                Código de 6 dígitos
                <input
                  className="vp-code-input"
                  aria-label="Código de 6 dígitos"
                  aria-describedby="vp-code-help"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="off"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, ""))
                  }
                  required
                  placeholder="000000"
                />
                <span id="vp-code-help" className="vp-field-help">
                  Para recorrer la demo usa <strong>123456</strong>.
                </span>
              </label>
            )}
            {!admin && !register && !verify && !recover && !reset && (
              <div className="vp-auth-form-options">
                <span>Acceso de demostración</span>
                <SiteLink href="/escuela/recuperar">
                  Olvidé mi contraseña
                </SiteLink>
              </div>
            )}
            {register && (
              <label className="vp-checkbox">
                <input type="checkbox" required />
                Entiendo que estoy explorando una cuenta de muestra.
              </label>
            )}
            {error && (
              <p className="vp-form-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="vp-feedback" role="status">
                {message}
              </p>
            )}
            <button className="vp-btn vp-btn-primary" type="submit">
              {admin
                ? "Entrar a la demo admin"
                : verify
                  ? "Confirmar y continuar"
                  : recover
                    ? "Ver paso de recuperación"
                    : reset
                      ? "Simular nueva contraseña"
                      : register
                        ? "Crear perfil de muestra"
                        : "Entrar a mi Escuela"}
              <ArrowUpRight size={19} />
            </button>
            {verify && (
              <button
                className="vp-text-button"
                type="button"
                onClick={() =>
                  setMessage(
                    "Solicitud simulada. No enviamos correos; el código de prueba sigue siendo 123456.",
                  )
                }
              >
                <EnvelopeSimple size={17} />
                Solicitar otro código
              </button>
            )}
          </form>
          <div className="vp-auth-divider">
            <span>o recorre la experiencia directamente</span>
          </div>
          <div className="vp-demo-entry">
            <button onClick={() => demo("student")}>
              Vista estudiante
              <ArrowRight size={17} />
            </button>
            <button onClick={() => demo("admin")}>
              Vista administrador
              <ArrowRight size={17} />
            </button>
          </div>
          <p className="vp-auth-note">
            <ShieldCheck size={16} />
            Esta fase es visual: no valida identidades ni contraseñas. El correo
            transaccional se preparará con Resend en la fase técnica.
          </p>
          {(register || recover || verify || reset) && (
            <SiteLink className="vp-auth-return" href="/escuela/ingresar">
              <ArrowLeft size={16} />
              Volver al acceso
            </SiteLink>
          )}
        </div>
        <div className="vp-auth-footer">
          <SiteLink href="/escuela">Volver a la Escuela</SiteLink>
          <span>Más años. Más futuro.</span>
        </div>
      </section>
    </main>
  );
}
