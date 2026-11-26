export const site = {
  email: 'info@vasees.co',
  newsletter: 'El Futuro tiene Canas',
  // No newsletter provider is connected yet; the subscribe CTA explains that honestly until this URL exists.
  newsletterUrl: null as string | null,
  researchPdf: null as string | null,
  source: 'https://www.who.int/es/news-room/fact-sheets/detail/ageing-and-health',
};

export const schoolName = 'Escuela de Familia y Longevidad';

// Brief v3 §4.1: the Colombia figure stays unpublished until it is checked against a primary DANE source.
export const statColombia = {
  value: null as string | null,
  year: null as number | null,
  ageBand: '60 años o más',
  source: null as string | null,
  projectionOrObservation: null as 'proyección' | 'observación' | null,
  verified: false,
};

export const context = {
  heading: 'Vivir más está cambiando cómo trabajamos, compramos y nos relacionamos.',
  text: 'El cambio demográfico no es solamente una estadística: obliga a repensar a quién escucha una marca, cómo se comparte el conocimiento en un equipo y qué productos necesitamos diseñar. Esa es la conversación que queremos abrir en Vasees.',
  stat: { value: '1 de cada 6', text: 'personas en el mundo tendrá 60 años o más en 2030.', source: 'OMS · Envejecimiento y salud, proyección mundial' },
};

export const vision = {
  heading: 'No queremos ser solo una agencia. Estamos construyendo un ecosistema para la nueva longevidad.',
  text: 'Comenzamos ayudando a las marcas a encontrar su voz y hacer visible su propósito. Hoy sumamos gerontología, cultura organizacional y desarrollo tecnológico para acompañar una transformación más grande: aprender a vivir, trabajar y crear en una sociedad que vive más años. Hacia 2031 queremos integrar investigación, consultoría, comunicación, tecnología y educación en un mismo ecosistema.',
};

export const observatory = {
  name: 'Observatorio de Envejecimiento, Vejez y Longevidad',
  heading: 'Investigar para diseñar mejor',
  text: 'El Observatorio de Envejecimiento, Vejez y Longevidad nace como la apuesta de Vasees por convertir preguntas y datos en conocimiento útil para empresas y comunidades. Es la fuente de conocimiento que queremos construir para alimentar Studio, Consulting, Tech y nuestros proyectos educativos.',
};

// Brief v3 §2: organizations shown as names until authorized logos arrive. `relation` must be confirmed before launch.
export const organizations = [
  { name: 'Fundación Provida Colombia', relation: 'cliente' },
  { name: 'Rödea Care', relation: 'por confirmar' },
  { name: 'Precisión Logística', relation: 'por confirmar' },
  { name: 'Comfama', relation: 'por confirmar' },
] as const;

/**
 * Case on the hero card. Only verified work: the text repeats what the site already states about Provida.
 * No metrics until there are approved results. The image is conceptual until a real piece is authorized.
 */
export const featuredCase = {
  tag: 'Caso · Vasees Studio y Consulting',
  client: 'Fundación Provida Colombia',
  text: 'Marca, brandbook, comunicación, campañas y procesos de cultura.',
  image: '/images/studio.webp',
  imageIsConceptual: true,
  href: '/soluciones#marca',
  cta: 'Ver cómo trabajamos',
};

export type InitiativeConfig = {
  slug: string; displayName: string; kind: 'servicio' | 'plataforma' | 'impacto';
  status: 'active' | 'pilot' | 'planned'; publicEnabled: boolean; route: string;
  description: string; cta: string;
};

export const initiativeConfig: InitiativeConfig[] = [
  { slug: 'studio', displayName: 'Vasees Studio', kind: 'servicio', status: 'active', publicEnabled: true, route: '/soluciones#marca', description: 'Marca, lenguaje, comunicación, campañas, lanzamientos y contenidos.', cta: 'Conocer Studio' },
  { slug: 'consulting', displayName: 'Vasees Consulting', kind: 'servicio', status: 'active', publicEnabled: true, route: '/soluciones#cultura', description: 'Cultura organizacional, comunicación interna, aprendizaje intergeneracional, cuidado, propósito y transiciones laborales.', cta: 'Conocer Consulting' },
  { slug: 'tech', displayName: 'Vasees Tech', kind: 'servicio', status: 'active', publicEnabled: true, route: '/soluciones#tech', description: 'Diseño y desarrollo de software a la medida para retos vinculados con la longevidad.', cta: 'Conocer Tech' },
  { slug: 'observatorio', displayName: 'Observatorio', kind: 'plataforma', status: 'planned', publicEnabled: true, route: '/observatorio', description: 'Preguntas, datos y fuentes convertidos en conocimiento útil para empresas y comunidades.', cta: 'Explora el Observatorio' },
  { slug: 'escuela', displayName: schoolName, kind: 'plataforma', status: 'planned', publicEnabled: true, route: '/escuela', description: 'Aprendizajes para personas de distintas edades, familias, personas cuidadoras y organizaciones.', cta: 'Conoce la Escuela' },
  { slug: 'la-chispa', displayName: 'La Chispa', kind: 'plataforma', status: 'active', publicEnabled: true, route: '/la-chispa', description: 'Medio editorial: historias, podcast y conversaciones públicas sobre vida, vejez, cultura y arte.', cta: 'Explora La Chispa' },
  // Brief v3 §5: Kánna is not advertised until its publication is explicitly authorized.
  { slug: 'kanna', displayName: 'Kánna', kind: 'plataforma', status: 'planned', publicEnabled: false, route: '/ecosistema/kanna', description: 'Plataforma propia en desarrollo para talento senior.', cta: 'Conocer Kánna' },
  { slug: 'impacto', displayName: 'Impacto', kind: 'impacto', status: 'planned', publicEnabled: true, route: '/ecosistema#transversal', description: 'Resultado transversal que medimos en todas las líneas. No es una entidad constituida.', cta: 'Ver el eje transversal' },
];

export const experience = [
  { area: 'Marca y comunicación', title: 'Marca, brandbook y campañas', text: 'Proyectos de marca, brandbook, comunicación y campañas, entre ellos para Fundación Provida Colombia.' },
  { area: 'Cultura y cuidado', title: 'Ceremonias del cuidado', text: 'Actividades de cuidado y ceremonias del cuidado en el sector hospitalario.' },
  { area: 'Transiciones laborales', title: 'Preparación para la prejubilación', text: 'Trabajo con personas próximas al retiro y con las organizaciones que las acompañan.' },
  { area: 'Propósito', title: 'Talleres de Ikigai', text: 'Talleres de Ikigai con personas mayores para conversar sobre intereses, capacidades y proyectos.' },
  { area: 'Desarrollo tecnológico', title: 'Software propio', text: 'Vasees ya desarrolla soluciones digitales propias relacionadas con la longevidad.' },
];

export const research = [
  { number: '01', title: 'Una vida laboral con más de un comienzo.', short: 'Trabajo y trayectorias', text: 'Una trayectoria puede incluir cambios de oficio, pausas para cuidar y regresos al aprendizaje. ¿Qué tendría que cambiar en una organización para reconocer ese recorrido al contratar, formar o acompañar a alguien?' },
  { number: '02', title: 'Cuidar también necesita una red.', short: 'Cuidado y conexiones', text: 'El cuidado cotidiano reúne tareas, decisiones y conversaciones que pueden repartirse entre varias personas. ¿Qué responsabilidades están claras y cuáles siguen dependiendo de quien siempre toma la iniciativa?' },
  { number: '03', title: 'Diseñar para las vidas que vienen.', short: 'Comunicación y servicios', text: 'La edad por sí sola dice poco sobre cómo alguien usa un servicio. Observar dónde una persona necesita ayuda, en qué momento abandona y qué decisiones quiere seguir tomando orienta mejor el diseño.' },
];
