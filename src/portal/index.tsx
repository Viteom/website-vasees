import { LoginPage } from "../components/ui/sign-in-page";
import { useDemo } from "./demo-store";
import { AccessPreview, Empty, PortalShell } from "./shared";
import {
  StudentDashboard,
  StudentCatalog,
  Classroom,
  StudentProfile,
  Checkout,
  StudentPayments,
} from "./student";
import {
  AdminDashboard,
  AdminCourses,
  CourseEditor,
  ContentPages,
  PageEditor,
  MediaLibrary,
  AdminUsers,
  AdminPayments,
  AdminMessages,
  AdminSettings,
} from "./admin";
import { SiteLink } from "../navigation";

const accessPaths = [
  "/escuela/ingresar",
  "/escuela/registro",
  "/escuela/verificar",
  "/escuela/recuperar",
  "/escuela/nueva-contrasena",
];

// A visual role switch for the prototype. Server-side authorization is not implemented.
export function Portal({ path }: { path: string }) {
  const store = useDemo();
  const admin = path.startsWith("/admin");
  if (accessPaths.includes(path) || !store.session)
    return <LoginPage key={path} path={path} />;
  if (admin && store.session.role !== "admin") return <AccessPreview />;
  const routes: Record<string, React.ReactNode> = {
    "/escuela/inicio": <StudentDashboard />,
    "/escuela/explorar": <StudentCatalog key={path} />,
    "/escuela/mis-cursos": <StudentCatalog key={path} mine />,
    "/escuela/aula": <Classroom key={store.selectedCourse} />,
    "/escuela/perfil": <StudentProfile />,
    "/escuela/pagos": <StudentPayments />,
    "/escuela/pago": <Checkout key={store.selectedCourse} />,
    "/admin": <AdminDashboard />,
    "/admin/cursos": <AdminCourses />,
    "/admin/curso": <CourseEditor key={store.selectedCourse} />,
    "/admin/contenido": <ContentPages />,
    "/admin/pagina": <PageEditor key={store.selectedPage} />,
    "/admin/medios": <MediaLibrary />,
    "/admin/usuarios": <AdminUsers />,
    "/admin/pagos": <AdminPayments />,
    "/admin/mensajes": <AdminMessages />,
    "/admin/ajustes": <AdminSettings />,
  };
  return (
    <PortalShell path={path} admin={admin}>
      {routes[path] ?? (
        <Empty
          title="Encontremos tu próximo paso."
          text="Esta vista aún no hace parte del recorrido de muestra."
          action={
            <SiteLink
              className="vp-btn vp-btn-primary"
              href={admin ? "/admin" : "/escuela/inicio"}
            >
              Volver al inicio
            </SiteLink>
          }
        />
      )}
    </PortalShell>
  );
}
