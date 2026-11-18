// Single source for the three commercial solutions: home cards and /soluciones share it (brief v3, sections 5 and 6).
export type SolutionId = 'studio' | 'consulting' | 'tech';

export type Solution = {
  id: SolutionId;
  anchor: 'marca' | 'cultura' | 'tech';
  name: string;
  area: string;
  card: { title: string; text: string; services: string[]; cta: string };
  image: string;
  alt: string;
  question: string;
  heading: string;
  body: string;
  groups: [string, string][];
  receives: string;
  challenge: string;
  experience: string;
  cta: string;
};

export const solutions: Solution[] = [
  {
    id: 'studio', anchor: 'marca', name: 'Vasees Studio', area: 'Marca y lenguaje',
    card: {
      title: 'Que tu marca se entienda. Y se recuerde.',
      text: 'Creamos marcas, narrativas y campañas para lanzar, relanzar o posicionar productos, servicios y organizaciones.',
      services: ['Estrategia e identidad de marca', 'Campañas y lanzamientos', 'Comunicación y contenidos'],
      cta: 'Conocer Studio',
    },
    image: '/images/studio.webp', alt: 'Composición de libros y materiales de diseño en tonos cálidos',
    question: '¿Tu marca está conectando con quienes necesitan conocerla?',
    heading: 'Haz que tu marca tenga algo claro que decir. Y una forma propia de decirlo.',
    body: 'No basta con verse bien. Una marca necesita un posicionamiento, una identidad y mensajes capaces de acompañar los cambios de su negocio y sus públicos. En Vasees Studio escuchamos, definimos y creamos una comunicación que funciona desde el concepto hasta la campaña.',
    groups: [
      ['Estrategia de marca', 'Diagnóstico, posicionamiento, propuesta de valor, propósito, arquitectura de marca, públicos y lenguaje.'],
      ['Identidad visual y verbal', 'Naming cuando aplique, concepto, rebranding, brandbook, tono y mensajes clave.'],
      ['Campañas y lanzamientos', 'Lanzamiento de producto o servicio, relanzamiento, campañas de temporada, activaciones, narrativa comercial y piezas para los canales acordados.'],
      ['Comunicación y contenidos', 'Comunicación corporativa, digital y editorial; producción de piezas y estrategias de contenido según el alcance.'],
    ],
    receives: 'Según el proyecto, una estrategia de marca, un sistema de identidad y lenguaje, un concepto de campaña, un plan de comunicación o piezas listas para activar.',
    challenge: 'Estoy por lanzar un servicio y necesito encontrar cómo nombrarlo, presentarlo y comunicarlo.',
    experience: 'Proyectos de marca, brandbook, comunicación y campañas, entre ellos para Fundación Provida Colombia.',
    cta: 'Quiero lanzar o fortalecer mi marca',
  },
  {
    id: 'consulting', anchor: 'cultura', name: 'Vasees Consulting', area: 'Cultura organizacional',
    card: {
      title: 'Que el conocimiento de tu equipo siga creciendo.',
      text: 'Diseñamos cultura, talleres y experiencias para compartir saberes, fortalecer relaciones entre generaciones y acompañar cambios laborales.',
      services: ['Cultura y comunicación interna', 'Talleres de cuidado y propósito', 'Transferencia de conocimiento y prejubilación'],
      cta: 'Conocer Consulting',
    },
    image: '/images/consulting.webp', alt: 'Dos generaciones compartiendo ideas en un taller',
    question: '¿Qué conocimientos se pierden cuando cambian las personas de tu equipo?',
    heading: 'Construye una cultura donde la experiencia se comparte.',
    body: 'Una organización con varias generaciones no aprovecha automáticamente la experiencia de todas. La cultura se diseña con conversaciones, procesos y aprendizajes. En Vasees Consulting combinamos comunicación y gerontología para fortalecer vínculos, transferencia de conocimiento y transiciones de la vida laboral.',
    groups: [
      ['Cultura y comunicación interna', 'Escucha organizacional, mapa de tensiones y necesidades, narrativas internas y experiencias para colaboradores.'],
      ['Talleres y experiencias', 'Cuidado, comunicación intergeneracional, sensibilidad ante el edadismo, propósito, Ikigai y colaboración.'],
      ['Gestión del conocimiento', 'Identificación de saberes críticos, intercambio entre generaciones y mecanismos de transferencia.'],
      ['Transiciones y prejubilación', 'Talleres de preparación y acompañamiento organizacional no clínico; programas a medida según la población y el alcance.'],
    ],
    receives: 'Un diagnóstico o plan de intervención, talleres diseñados para su contexto, materiales de trabajo y recomendaciones para sostener los aprendizajes, según lo contratado.',
    challenge: 'Nuestros colaboradores próximos al retiro tienen conocimientos valiosos, pero no contamos con un proceso para compartirlos.',
    experience: 'Actividades de cuidado y ceremonias del cuidado en el sector hospitalario, trabajo con personas en prejubilación, talleres de Ikigai con personas mayores y procesos de cultura y comunicación para Fundación Provida Colombia.',
    cta: 'Quiero fortalecer la cultura de mi equipo',
  },
  {
    id: 'tech', anchor: 'tech', name: 'Vasees Tech', area: 'Desarrollo tecnológico',
    card: {
      title: 'Software para necesidades que ya están cambiando.',
      text: 'Diseñamos y desarrollamos plataformas y herramientas digitales a la medida para proyectos que responden a retos de la longevidad.',
      services: ['Diseño de producto y UX/UI', 'Desarrollo web a medida', 'Validación y evolución'],
      cta: 'Conocer Tech',
    },
    image: '/images/hero.webp', alt: 'Personas de distintas edades trabajando juntas frente a una pantalla',
    question: '¿Tu organización necesita una herramienta digital que todavía no existe?',
    heading: 'Del reto real al software que lo resuelve.',
    body: 'Los desafíos de una sociedad más longeva requieren también productos digitales: sistemas para conectar, aprender, coordinar, participar o acceder a servicios. En Vasees Tech diseñamos y desarrollamos software a la medida, partiendo de las personas y validando qué solución tiene sentido construir.',
    groups: [
      ['Descubrimiento', 'Necesidades, usuarios, procesos, requisitos, alcance, arquitectura funcional y primera versión.'],
      ['UX/UI y accesibilidad', 'Estructura, flujos, interfaz, prototipos y pruebas con usuarios.'],
      ['Desarrollo de software a medida', 'Plataformas y aplicaciones web para proyectos vinculados a la longevidad, según evaluación técnica y contractual.'],
      ['Pruebas y evolución', 'Control de calidad, validación de funcionalidades, documentación y hoja de ruta de mejoras.'],
    ],
    receives: 'Según la contratación, un mapa funcional, un prototipo validable o un producto desarrollado y documentado. Alcance, soporte e integraciones se definen en la propuesta.',
    challenge: 'Necesitamos una plataforma para conectar experiencia y oportunidades laborales entre generaciones.',
    experience: 'Vasees ya desarrolla soluciones digitales propias relacionadas con la longevidad.',
    cta: 'Quiero desarrollar una plataforma',
  },
];

export const contactInterests = [
  { value: 'studio', label: 'Quiero crear o transformar una marca, campaña o lanzamiento', subject: 'Studio · Marca, campaña o lanzamiento' },
  { value: 'consulting', label: 'Quiero fortalecer la cultura y el conocimiento de mi equipo', subject: 'Consulting · Cultura y conocimiento' },
  { value: 'tech', label: 'Quiero diseñar y desarrollar una solución digital', subject: 'Tech · Solución digital' },
  { value: 'explorar', label: 'Aún no lo tengo claro; quiero contarles mi reto', subject: 'Quiero contarles mi reto' },
] as const;

export type ContactInterest = typeof contactInterests[number]['value'];
export const contactHref = (interest: ContactInterest) => `/?interes=${interest}#contacto`;
