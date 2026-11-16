export const site = {
  email: 'info@vasees.co',
  newsletter: 'El Futuro tiene Canas',
  newsletterUrl: null as string | null,
  researchPdf: null as string | null,
  source: 'https://www.who.int/es/news-room/fact-sheets/detail/ageing-and-health',
};

export type Service = {
  id: string; name: string; label: string; title: string; description: string;
  image: string; alt: string; tags: string[]; details: string[];
  enabled: boolean; status: 'active' | 'in-development' | 'planned';
};

export const services: Service[] = [
  {
    id: 'studio', name: 'Vasees Studio', label: 'Comunicación & marca',
    title: 'Lo que eres.\nLo que proyectas.',
    description: 'Diseñamos marcas y comunicaciones que conectan con distintas formas de vivir y envejecer. De la esencia de tu organización a las historias que la hacen relevante.',
    image: '/images/studio.webp', alt: 'Composición conceptual de libros y materiales de diseño en tonos cálidos',
    tags: ['Estrategia de marca', 'Identidad visual y verbal', 'Comunicación y contenidos'],
    details: [
      'Estrategia de marca: definimos qué lugar quiere ocupar tu marca, a quién quiere llegar y qué promesa puede sostener.',
      'Identidad visual y verbal: traducimos esa dirección en un sistema de diseño, imágenes, mensajes y tono que tu equipo pueda aplicar.',
      'Comunicación y contenidos: diseñamos campañas para conversaciones concretas con tus públicos y equipos.',
    ], enabled: true, status: 'active',
  },
  {
    id: 'consulting', name: 'Vasees Consulting', label: 'Cultura & generaciones',
    title: 'Generaciones distintas.\nUn propósito común.',
    description: 'Acompañamos a equipos que quieren crecer juntos. Diseñamos experiencias sobre colaboración intergeneracional, cuidado, propósito y transiciones de la vida laboral.',
    image: '/images/consulting.webp', alt: 'Imagen conceptual de dos generaciones compartiendo ideas en un taller',
    tags: ['Cultura organizacional', 'Talleres intergeneracionales', 'Propósito e Ikigai'],
    details: [
      'Colaborar entre generaciones: reconocemos los supuestos sobre la edad y construimos acuerdos para trabajar mejor.',
      'Compartir lo que sabemos: hacemos visible el conocimiento de la experiencia y exploramos maneras de transferirlo.',
      'Cuidado, propósito y prejubilación: abrimos conversaciones sobre rutinas, vínculos y nuevas etapas. Cada experiencia parte de la realidad de tu equipo.',
    ], enabled: true, status: 'active',
  },
  {
    id: 'tech', name: 'Vasees Tech', label: 'Tecnología & longevidad',
    title: 'Antes del código,\nlas personas.',
    description: 'Exploramos soluciones digitales para necesidades de una sociedad más longeva. Comprendemos el problema, probamos posibilidades y evaluamos qué vale la pena desarrollar.',
    image: '/images/hero.webp', alt: 'Imagen conceptual de personas de distintas edades trabajando juntas',
    tags: ['Descubrimiento', 'UX/UI y prototipos', 'Validación con personas'],
    details: [
      'Comprender: escuchamos a las personas y estudiamos el contexto antes de proponer una herramienta.',
      'Probar: convertimos preguntas de uso en prototipos y experiencias que se pueden validar.',
      'Definir: evaluamos viabilidad y alcance. Esta línea está en desarrollo y se orienta exclusivamente a retos vinculados con longevidad.',
    ], enabled: true, status: 'in-development',
  },
];

export const clients = ['Fundación Provida Colombia', 'Rödea Care', 'Precisión Logística', 'Comfama'];

export const initiatives = [
  { name: 'Kánna', label: 'Talento con trayectoria', title: 'Experiencia que abre\nposibilidades.', text: 'Una plataforma en desarrollo para conectar trayectorias, conocimientos y habilidades con nuevos retos.', status: 'En desarrollo', className: 'kanna' },
  { name: 'La Chispa', label: 'Medio editorial de Vasees', title: 'Podcast. Revista.\nHistorias que conectan.', text: 'Vida, vejez, cultura y arte. Nuestra última campaña: Cartografía de Pieles.', status: 'Explorar La Chispa', className: 'chispa' },
  { name: 'Escuela de Hijos y Nietos', label: 'Aprender a vivir más', title: 'Más generaciones.\nMás aprendizajes.', text: 'Un espacio para explorar el envejecimiento, el cuidado, el propósito y las relaciones entre generaciones.', status: 'Explora la Escuela', className: 'escuela' },
];

export const research = [
  { number: '01', title: 'Una vida laboral con más de un comienzo.', short: 'Trabajo y trayectorias', text: 'Una trayectoria puede incluir cambios de oficio, pausas para cuidar y regresos al aprendizaje. ¿Qué tendría que cambiar en una organización para reconocer ese recorrido al contratar, formar o acompañar a alguien?' },
  { number: '02', title: 'Cuidar también necesita una red.', short: 'Cuidado y conexiones', text: 'El cuidado cotidiano reúne tareas, decisiones y conversaciones que pueden repartirse entre varias personas. ¿Qué responsabilidades están claras y cuáles siguen dependiendo de quien siempre toma la iniciativa?' },
  { number: '03', title: 'Diseñar para las vidas que vienen.', short: 'Comunicación y servicios', text: 'La edad por sí sola dice poco sobre cómo alguien usa un servicio. Observar dónde una persona necesita ayuda, en qué momento abandona y qué decisiones quiere seguir tomando orienta mejor el diseño.' },
];

export const faqGroups = {
  'Sobre Vasees': [
    ['¿Qué hace Vasees?', 'Conectamos comunicación estratégica, cultura intergeneracional y tecnología para ayudar a las organizaciones a comprender la longevidad y convertirla en decisiones, experiencias y soluciones relevantes.'],
    ['¿Trabajan solo con organizaciones para personas mayores?', 'Trabajamos con distintos sectores cuando el reto tiene una relación concreta con la longevidad: en sus públicos, sus equipos, sus productos o sus servicios. Vivir más nos involucra a todos.'],
    ['¿Por qué conectar futuro, longevidad y humanidad?', 'Porque vivir más cambia cómo trabajamos, cuidamos, aprendemos y nos relacionamos. Comprender a las personas es el punto de partida para diseñar organizaciones relevantes en esa realidad.'],
  ],
  'Cómo trabajamos': [
    ['¿Cómo empieza un proyecto?', 'Con una conversación. Cuéntanos qué está cambiando en tu organización y qué te gustaría resolver. Escuchamos el contexto y acordamos un alcance, participantes, tiempos y entregables.'],
    ['¿Puedo combinar varios servicios?', 'Sí. Una necesidad de marca puede conectarse con cultura, talleres o diseño de experiencias. El alcance se define a partir del reto, no de una solución prefabricada.'],
    ['¿Qué incluye el diagnóstico de futuro?', 'El ejercicio de esta página ofrece preguntas orientativas sobre públicos, equipos y servicios. No es una evaluación validada. Un diagnóstico con Vasees comienza con escucha y un alcance acordado para tu organización.'],
  ],
  'Conocimiento': [
    ['¿Dónde encuentro las investigaciones?', 'El Observatorio reúne fuentes y exploraciones sobre longevidad. La lectura destacada es una muestra editorial, no una investigación propia concluida. Los informes y sus descargas se incorporarán cuando estén publicados.'],
    ['¿Cómo puedo leer El Futuro tiene Canas?', 'Estamos preparando el acceso al newsletter. Mientras tanto puedes escribir a info@vasees.co para consultar su disponibilidad. Aquí no se registran suscripciones ni se almacenan tus datos.'],
    ['¿La Escuela ya tiene inscripciones abiertas?', 'La Escuela de Hijos y Nietos está en preparación. Por ahora presentamos su enfoque; los cursos y las inscripciones se anunciarán cuando estén disponibles.'],
  ],
};
