import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { schoolCourses, type SchoolCourse } from "../content/school";
import { pageMeta } from "../content/pages";
import type { LearnerPlan } from "../content/school-learning";

export type CourseReview = {
  courseId: string;
  name: string;
  stars: number;
  comment: string;
  suggestion: string;
  shareable: boolean;
};

export type DemoRole = "student" | "admin";
export type DemoSession = { role: DemoRole; name: string; email: string };
export type CourseStatus = "Publicado" | "Borrador" | "Archivado";
export type ManagedCourse = SchoolCourse & {
  status: CourseStatus;
  price: number;
  level: string;
  resourceName?: string;
};
export type ContentPage = {
  id: string;
  path: string;
  title: string;
  heading: string;
  description: string;
  status: "Publicado" | "Borrador";
  sections: { id: string; title: string; text: string; enabled: boolean }[];
};
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  courses: number;
};
export type DemoOrder = {
  id: string;
  userId: string;
  name: string;
  courseId: string;
  amount: number;
  status: "Simulado" | "Rechazado";
  date: string;
};
export type MediaItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  label: string;
  local?: boolean;
};
export type MailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};
export const money = (value: number) =>
  value === 0
    ? "Gratis"
    : new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(value);
export const portalPaths = [
  "/escuela/inicio",
  "/escuela/bienvenida",
  "/escuela/ingresar",
  "/escuela/registro",
  "/escuela/verificar",
  "/escuela/recuperar",
  "/escuela/nueva-contrasena",
  "/escuela/explorar",
  "/escuela/mis-cursos",
  "/escuela/aula",
  "/escuela/perfil",
  "/escuela/pagos",
  "/escuela/pago",
  "/admin",
  "/admin/cursos",
  "/admin/curso",
  "/admin/contenido",
  "/admin/pagina",
  "/admin/medios",
  "/admin/usuarios",
  "/admin/pagos",
  "/admin/mensajes",
  "/admin/ajustes",
];
export const isPortalPath = (path: string) =>
  path.startsWith("/escuela/") || path === "/admin" || path.startsWith("/admin/");

const initialCourses: ManagedCourse[] = schoolCourses.map((course, index) => ({
  ...course,
  status: index < 4 ? "Publicado" : "Borrador",
  price: [89000, 119000, 0, 99000, 79000, 69000][index],
  level: "Introductorio",
}));
const initialPages: ContentPage[] = Object.entries(pageMeta)
  .filter(
    ([path]) =>
      !path.startsWith("/admin") &&
      !["/studio", "/consulting", "/tech"].includes(path) &&
      (!path.startsWith("/escuela") || path === "/escuela"),
  )
  .map(([path, meta], index) => ({
    id: `page-${index}`,
    path,
    title: meta.title,
    heading:
      path === "/"
        ? "El futuro cambia.\nLo humano permanece."
        : path === "/escuela"
          ? "Aprender para vivir más y mejor, en cualquier etapa."
          : meta.title.split("|")[0].trim(),
    description: meta.description,
    status: "Publicado",
    sections: [
      {
        id: "hero",
        title: "Portada y mensaje principal",
        text: meta.description,
        enabled: true,
      },
      {
        id: "content",
        title: "Contenido de la página",
        text: "Un espacio para comprender, conectar y abrir nuevas posibilidades en una sociedad más longeva.",
        enabled: true,
      },
      {
        id: "contact",
        title: "Cierre y contacto",
        text: "¿Qué te gustaría construir con Vasees? Empecemos por una conversación.",
        enabled: true,
      },
    ],
  }));

type DemoStore = {
  session: DemoSession | null;
  setSession: (value: DemoSession | null) => void;
  courses: ManagedCourse[];
  setCourses: React.Dispatch<React.SetStateAction<ManagedCourse[]>>;
  pages: ContentPage[];
  setPages: React.Dispatch<React.SetStateAction<ContentPage[]>>;
  selectedCourse: string;
  setSelectedCourse: (value: string) => void;
  selectedPage: string;
  setSelectedPage: (value: string) => void;
  enrolled: string[];
  setEnrolled: React.Dispatch<React.SetStateAction<string[]>>;
  progress: Record<string, number[]>;
  setProgress: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
  users: DemoUser[];
  setUsers: React.Dispatch<React.SetStateAction<DemoUser[]>>;
  orders: DemoOrder[];
  setOrders: React.Dispatch<React.SetStateAction<DemoOrder[]>>;
  media: MediaItem[];
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  templates: MailTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MailTemplate[]>>;
  settings: {
    name: string;
    email: string;
    menu: { label: string; path: string; visible: boolean }[];
  };
  setSettings: React.Dispatch<React.SetStateAction<DemoStore["settings"]>>;
  notice: string;
  setNotice: (value: string) => void;
  authDestination: string;
  setAuthDestination: (value: string) => void;
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authName: string;
  setAuthName: (value: string) => void;
  authIntent: "login" | "register" | "reset";
  setAuthIntent: (value: "login" | "register" | "reset") => void;
  profile: { city: string; notifications: boolean; newsletter: boolean };
  setProfile: React.Dispatch<React.SetStateAction<DemoStore["profile"]>>;
  /** Personal goal from the welcome flow. Private: never shown in admin reports. */
  plan: LearnerPlan | null;
  setPlan: React.Dispatch<React.SetStateAction<LearnerPlan | null>>;
  /** Lesson tests passed per course, by lesson index. Sequential: a badge needs all of them. */
  tests: Record<string, number[]>;
  setTests: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
  reviews: CourseReview[];
  setReviews: React.Dispatch<React.SetStateAction<CourseReview[]>>;
};
const Context = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [courses, setCourses] = useState(initialCourses);
  const [pages, setPages] = useState(initialPages);
  const [selectedCourse, setSelectedCourse] = useState(schoolCourses[0].id);
  const [selectedPage, setSelectedPage] = useState("page-0");
  const [enrolled, setEnrolled] = useState(
    schoolCourses.slice(0, 2).map((course) => course.id),
  );
  const [progress, setProgress] = useState<Record<string, number[]>>({
    [schoolCourses[0].id]: [0],
  });
  const [users, setUsers] = useState<DemoUser[]>([
    {
      id: "u1",
      name: "Laura Gómez",
      email: "laura@ejemplo.com",
      role: "Estudiante",
      status: "Activo",
      courses: 2,
    },
    {
      id: "u2",
      name: "Andrés Pérez",
      email: "andres@example.com",
      role: "Estudiante",
      status: "Activo",
      courses: 1,
    },
    {
      id: "u3",
      name: "Daniela Ruiz",
      email: "daniela@example.com",
      role: "Estudiante",
      status: "Pendiente",
      courses: 0,
    },
    {
      id: "u4",
      name: "Equipo Vasees",
      email: "admin@example.com",
      role: "Administrador",
      status: "Activo",
      courses: 0,
    },
  ]);
  const [orders, setOrders] = useState<DemoOrder[]>([
    {
      id: "DEMO-1001",
      userId: "student-demo",
      name: "Laura Gómez",
      courseId: schoolCourses[0].id,
      amount: 89000,
      status: "Simulado",
      date: "Ejemplo inicial",
    },
    {
      id: "DEMO-1002",
      userId: "other-2",
      name: "Andrés Pérez",
      courseId: schoolCourses[1].id,
      amount: 119000,
      status: "Simulado",
      date: "Ejemplo inicial",
    },
    {
      id: "DEMO-1003",
      userId: "other-3",
      name: "Daniela Ruiz",
      courseId: schoolCourses[3].id,
      amount: 99000,
      status: "Rechazado",
      date: "Ejemplo inicial",
    },
  ]);
  const [media, setMedia] = useState<MediaItem[]>([
    {
      id: "m1",
      name: "Mateo y Melissa",
      type: "image",
      url: "/images/school-mateo-melissa.webp",
      label: "Hero Escuela · WebP",
    },
    {
      id: "m2",
      name: "Cuidado compartido",
      type: "image",
      url: "/images/school-care.webp",
      label: "Portada de curso · WebP",
    },
    {
      id: "m3",
      name: "Generaciones",
      type: "image",
      url: "/images/school-generations.webp",
      label: "Portada de curso · WebP",
    },
    {
      id: "m4",
      name: "Hero floral",
      type: "image",
      url: "/images/hero-flower.png",
      label: "Home · PNG",
    },
    {
      id: "m5",
      name: "Diseño editorial",
      type: "image",
      url: "/images/studio.webp",
      label: "Studio · WebP",
    },
  ]);
  const [templates, setTemplates] = useState<MailTemplate[]>([
    {
      id: "code",
      name: "Código de acceso",
      subject: "Tu código para entrar a la Escuela",
      body: "Hola, {nombre}.\n\nTu código es {codigo}. Úsalo para continuar en la Escuela de Familia y Longevidad.\n\nSi no solicitaste este acceso, puedes ignorar este mensaje.\n\nEquipo Vasees",
    },
    {
      id: "welcome",
      name: "Bienvenida",
      subject: "Hay mucho por aprender, {nombre}",
      body: "Hola, {nombre}.\n\nQué bueno encontrarnos. Ya puedes explorar la Escuela y abrir una nueva conversación.\n\nMás años. Más futuro.\nEquipo Vasees",
    },
    {
      id: "reset",
      name: "Recuperar acceso",
      subject: "Recupera tu acceso a Vasees",
      body: "Hola, {nombre}.\n\nUsa el código {codigo} para continuar con la recuperación de tu acceso.\n\nSi no lo solicitaste, ignora este mensaje.\nEquipo Vasees",
    },
    {
      id: "receipt",
      name: "Resumen de compra",
      subject: "Tu curso: {curso}",
      body: "Hola, {nombre}.\n\nAquí está el resumen de tu inscripción a {curso}. Puedes continuar desde Mis cursos.\n\nEquipo Vasees",
    },
  ]);
  const [settings, setSettings] = useState({
    name: "Vasees",
    email: "info@vasees.co",
    menu: [
      { label: "Soluciones", path: "/#soluciones", visible: true },
      { label: "Observatorio", path: "/observatorio", visible: true },
      { label: "Ecosistema", path: "/ecosistema", visible: true },
      { label: "Escuela", path: "/escuela", visible: true },
    ],
  });
  const [notice, setNotice] = useState("");
  const [authDestination, setAuthDestination] = useState("/escuela/inicio");
  const [authEmail, setAuthEmail] = useState("laura@ejemplo.com");
  const [authName, setAuthName] = useState("Laura Gómez");
  const [authIntent, setAuthIntent] = useState<"login" | "register" | "reset">(
    "login",
  );
  const [profile, setProfile] = useState({
    city: "Medellín",
    notifications: true,
    newsletter: false,
  });
  const [plan, setPlan] = useState<LearnerPlan | null>(null);
  const [tests, setTests] = useState<Record<string, number[]>>({});
  const [reviews, setReviews] = useState<CourseReview[]>([
    {
      courseId: schoolCourses[1].id,
      name: "Andrés Pérez",
      stars: 5,
      comment: "Ejemplo de opinión autorizada para mostrar cómo se verá el reporte.",
      suggestion: "",
      shareable: true,
    },
    {
      courseId: schoolCourses[0].id,
      name: "Daniela Ruiz",
      stars: 4,
      comment: "Ejemplo de opinión no autorizada: no debe aparecer en reportes.",
      suggestion: "Más ejemplos cotidianos.",
      shareable: false,
    },
  ]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 8000);
    return () => clearTimeout(timer);
  }, [notice]);
  return (
    <Context.Provider
      value={{
        session,
        setSession,
        courses,
        setCourses,
        pages,
        setPages,
        selectedCourse,
        setSelectedCourse,
        selectedPage,
        setSelectedPage,
        enrolled,
        setEnrolled,
        progress,
        setProgress,
        users,
        setUsers,
        orders,
        setOrders,
        media,
        setMedia,
        templates,
        setTemplates,
        settings,
        setSettings,
        notice,
        setNotice,
        authDestination,
        setAuthDestination,
        authEmail,
        setAuthEmail,
        authName,
        setAuthName,
        authIntent,
        setAuthIntent,
        profile,
        setProfile,
        plan,
        setPlan,
        tests,
        setTests,
        reviews,
        setReviews,
      }}
    >
      {children}
    </Context.Provider>
  );
}

/** A badge is earned when every lesson test of the course has been passed. */
export const hasBadge = (
  tests: Record<string, number[]>,
  course: { id: string; lessons: unknown[] },
) =>
  course.lessons.length > 0 &&
  (tests[course.id] ?? []).length >= course.lessons.length;

export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider is required");
  return value;
}
