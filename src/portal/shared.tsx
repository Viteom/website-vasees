import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  House,
  BookOpen,
  SquaresFour,
  UserCircle,
  CreditCard,
  Files,
  Image,
  Users,
  EnvelopeSimple,
  GearSix,
  SignOut,
  ArrowsLeftRight,
  ArrowUpRight,
  List,
  X,
  ArrowLeft,
  CheckCircle,
  Info,
  Plus,
} from "@phosphor-icons/react";
import { SiteLink, navigate } from "../navigation";
import { useDemo } from "./demo-store";

export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`vp-badge ${tone}`}>{children}</span>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="vp-page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="vp-heading-actions">{actions}</div>}
    </div>
  );
}
export function Notice() {
  const { notice, setNotice } = useDemo();
  return notice ? (
    <div className="vp-toast" role="status">
      <CheckCircle size={20} />
      <span>{notice}</span>
      <button onClick={() => setNotice("")} aria-label="Cerrar aviso">
        <X size={17} />
      </button>
    </div>
  ) : null;
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="vp-empty">
      <BookOpen size={34} weight="light" />
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const focus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      focus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
      focus.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <dialog
      className={`vp-modal ${wide ? "wide" : ""}`}
      ref={dialog}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="vp-modal-header">
        <h2>{title}</h2>
        <button aria-label="Cerrar ventana" onClick={onClose}>
          <X size={23} />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}

const studentMenu = [
  { path: "/escuela/inicio", label: "Mi inicio", icon: House },
  { path: "/escuela/explorar", label: "Explorar cursos", icon: SquaresFour },
  { path: "/escuela/mis-cursos", label: "Mis cursos", icon: BookOpen },
  { path: "/escuela/perfil", label: "Mi perfil", icon: UserCircle },
  { path: "/escuela/pagos", label: "Mis pagos", icon: CreditCard },
];
const adminMenu = [
  { path: "/admin", label: "Resumen", icon: SquaresFour },
  { path: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { path: "/admin/contenido", label: "Páginas y contenido", icon: Files },
  { path: "/admin/medios", label: "Biblioteca de medios", icon: Image },
  { path: "/admin/usuarios", label: "Personas y acceso", icon: Users },
  { path: "/admin/pagos", label: "Pagos de muestra", icon: CreditCard },
  { path: "/admin/mensajes", label: "Correos y códigos", icon: EnvelopeSimple },
  { path: "/admin/ajustes", label: "Configuración", icon: GearSix },
];

export function PortalShell({
  path,
  admin,
  children,
}: {
  path: string;
  admin: boolean;
  children: ReactNode;
}) {
  const store = useDemo();
  const [drawer, setDrawer] = useState(false);
  const menuDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setDrawer(false);
  }, [path]);
  useEffect(() => {
    if (drawer) menuDialog.current?.showModal();
    else menuDialog.current?.close();
  }, [drawer]);
  const initials = (store.session?.name ?? "VA")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  const menu = admin ? adminMenu : studentMenu;
  const current =
    path === "/admin/curso"
      ? "Editor de curso"
      : path === "/admin/pagina"
        ? "Editor de página"
        : path === "/escuela/aula"
          ? "Aula de muestra"
          : path === "/escuela/pago"
            ? "Pago de prueba"
            : (menu.find((item) => item.path === path)?.label ?? "Escuela");
  function logout() {
    store.setSession(null);
    navigate("/escuela/ingresar");
  }
  function changeView() {
    store.setSession(
      admin
        ? { role: "student", name: "Laura Gómez", email: "laura@ejemplo.com" }
        : { role: "admin", name: "Equipo Vasees", email: "admin@example.com" },
    );
    navigate(admin ? "/escuela/inicio" : "/admin");
  }
  const sidebar = (
    <>
      <SiteLink className="vp-sidebar-brand" href="/">
        <img
          src="/images/vasees-logo.png"
          alt="Vasees"
          width="130"
          height="44"
        />
      </SiteLink>
      <p className="vp-sidebar-caption">
        {admin ? "Administración del ecosistema" : "Escuela de Hijos y Nietos"}
      </p>
      <nav aria-label={admin ? "Administración" : "Mi Escuela"}>
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            item.path === path ||
            (item.path === "/admin/cursos" && path === "/admin/curso") ||
            (item.path === "/admin/contenido" && path === "/admin/pagina");
          return (
            <SiteLink
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              onClick={() => setDrawer(false)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </SiteLink>
          );
        })}
      </nav>
      <div className="vp-sidebar-bottom">
        <div>
          <span className="vp-avatar">{initials}</span>
          <span>
            <strong>{store.session?.name}</strong>
            <small>
              {admin ? "Administrador · Demo" : "Estudiante · Demo"}
            </small>
          </span>
        </div>
        <button onClick={changeView}>
          <ArrowsLeftRight size={18} />
          {admin ? "Ver demo estudiante" : "Ver demo admin"}
        </button>
        <SiteLink href="/">
          <ArrowLeft size={18} />
          Volver a Vasees
        </SiteLink>
      </div>
    </>
  );
  return (
    <div className={`vp-app ${admin ? "vp-admin" : "vp-student"}`}>
      <a className="skip-link" href="#portal-content">
        Ir al contenido
      </a>
      <aside className="vp-sidebar">{sidebar}</aside>
      <dialog
        ref={menuDialog}
        className="vp-mobile-nav"
        aria-label="Menú de la plataforma"
        onCancel={() => setDrawer(false)}
      >
        <button
          className="vp-mobile-close"
          aria-label="Cerrar menú"
          onClick={() => setDrawer(false)}
        >
          <X size={24} />
        </button>
        {sidebar}
      </dialog>
      <div className="vp-workspace">
        <header className="vp-topbar">
          <div>
            <button
              className="vp-menu-button"
              onClick={() => setDrawer(true)}
              aria-label="Abrir menú de la plataforma"
            >
              <List size={24} />
            </button>
            <span>{admin ? "Backoffice Vasees" : "Mi Escuela"}</span>
            <span className="vp-topbar-separator">/</span>
            <strong>{current}</strong>
          </div>
          <div>
            <SiteLink
              href={admin ? "/admin/ajustes" : "/escuela/perfil"}
              className="vp-topbar-profile"
            >
              <span className="vp-avatar">{initials}</span>
              <span>{store.session?.name.split(" ")[0]}</span>
            </SiteLink>
            <button
              className="vp-logout"
              onClick={logout}
              aria-label="Cerrar sesión de demostración"
            >
              <SignOut size={21} />
            </button>
          </div>
        </header>
        <div className="vp-demo-banner">
          <Info size={16} />
          <span>
            <strong>Modo demo.</strong> No hay autenticación, cobros ni envíos
            reales. Los cambios se reinician al recargar.
          </span>
          <Badge>Vista {admin ? "admin" : "estudiante"}</Badge>
        </div>
        <main className="vp-main" id="portal-content">
          <Notice />
          {children}
        </main>
        <footer className="vp-app-footer">
          <span>Vasees · Más años. Más futuro.</span>
          <span>Prototipo de la Escuela y su CMS</span>
        </footer>
      </div>
    </div>
  );
}

export function AccessPreview() {
  const store = useDemo();
  return (
    <main className="vp-access-preview">
      <img src="/images/vasees-logo.png" alt="Vasees" width="130" />
      <Badge>Recorrido de demostración</Badge>
      <h1>Esta es la vista de administración.</h1>
      <p>
        Ahora estás recorriendo la Escuela como estudiante. Puedes volver a tus
        cursos o cambiar explícitamente al perfil de administración para revisar
        su diseño.
      </p>
      <div>
        <SiteLink className="vp-btn vp-btn-secondary" href="/escuela/inicio">
          Volver a mi Escuela
        </SiteLink>
        <button
          className="vp-btn vp-btn-primary"
          onClick={() => {
            store.setSession({
              role: "admin",
              name: "Equipo Vasees",
              email: "admin@example.com",
            });
            navigate("/admin");
          }}
        >
          Ver demo admin
          <ArrowUpRight size={18} />
        </button>
      </div>
    </main>
  );
}
