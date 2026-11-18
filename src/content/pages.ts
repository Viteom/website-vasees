export const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'Vasees — El futuro cambia. Lo humano permanece.', description: 'Diseñamos marcas, culturas organizacionales y tecnología para una sociedad que vive más.' },
  '/soluciones': { title: 'Soluciones: marca, cultura organizacional y software | Vasees', description: 'Vasees Studio, Consulting y Tech: marcas y campañas, cultura organizacional y desarrollo de software para los retos de una sociedad más longeva.' },
  '/studio': { title: 'Vasees Studio ahora está en Soluciones | Vasees', description: 'Marca, campañas, lanzamientos y comunicación. Esta página se trasladó a /soluciones#marca.' },
  '/consulting': { title: 'Vasees Consulting ahora está en Soluciones | Vasees', description: 'Cultura organizacional, talleres y transferencia de conocimiento. Esta página se trasladó a /soluciones#cultura.' },
  '/tech': { title: 'Vasees Tech ahora está en Soluciones | Vasees', description: 'Diseño y desarrollo de software a la medida. Esta página se trasladó a /soluciones#tech.' },
  '/ecosistema': { title: 'Ecosistema Vasees: cómo se conecta y cómo participar | Vasees', description: 'Soluciones, Observatorio, Escuela y La Chispa: cómo se relacionan las partes de Vasees y cómo puedes participar.' },
  '/observatorio': { title: 'Observatorio de Envejecimiento, Vejez y Longevidad | Vasees', description: 'Preguntas, fuentes y lecturas sobre longevidad, trabajo, cuidado y diseño de servicios. Investigación en preparación.' },
  '/observatorio/vivir-mas': { title: 'Vivir más. ¿Estamos listos? | Observatorio Vasees', description: 'Una exploración editorial de muestra sobre trabajo, redes de cuidado y diseño para una sociedad más longeva.' },
  '/escuela': { title: 'Escuela de Familia y Longevidad | Vasees', description: 'Aprender para vivir más y mejor, en cualquier etapa. Rutas de aprendizaje para personas, familias, personas cuidadoras y organizaciones.' },
  '/ecosistema/kanna': { title: 'Kánna — Experiencia que abre posibilidades | Vasees', description: 'Conoce la iniciativa de Vasees en desarrollo para reconocer el talento senior y conectar trayectorias con oportunidades.' },
  '/la-chispa': { title: 'La Chispa — Podcast, revista y Cartografía de Pieles | Vasees', description: 'La Chispa es el medio editorial de Vasees: podcast y revista sobre vida, vejez, cultura y arte. Conoce nuestra última campaña, Cartografía de Pieles.' },
  '/privacidad': { title: 'Política de tratamiento de datos personales | Vasees', description: 'Documento pendiente de revisión jurídica.' },
  '/terminos': { title: 'Términos de uso del sitio | Vasees', description: 'Documento pendiente de revisión jurídica.' },
  '/cookies': { title: 'Política de cookies | Vasees', description: 'Documento pendiente de revisión jurídica.' },
  '/terminos-escuela': { title: 'Términos del servicio educativo | Vasees', description: 'Documento pendiente de revisión jurídica.' },
};

const portalTitles: Record<string, string> = {
  '/escuela/inicio': 'Mi Escuela', '/escuela/bienvenida': 'Bienvenida y meta personal', '/escuela/ingresar': 'Acceso a la Escuela', '/escuela/registro': 'Crea tu perfil de muestra', '/escuela/verificar': 'Código de acceso de muestra', '/escuela/recuperar': 'Recuperar acceso', '/escuela/nueva-contrasena': 'Nueva contraseña de muestra', '/escuela/explorar': 'Explorar cursos', '/escuela/mis-cursos': 'Mis cursos', '/escuela/aula': 'Mi aula de muestra', '/escuela/perfil': 'Mi perfil', '/escuela/pagos': 'Mis pagos de muestra', '/escuela/pago': 'Pago de prueba', '/admin': 'Backoffice Vasees', '/admin/cursos': 'Administrar cursos', '/admin/curso': 'Editor de cursos', '/admin/contenido': 'Páginas y contenido', '/admin/pagina': 'Editor de página', '/admin/medios': 'Biblioteca de medios', '/admin/usuarios': 'Personas y acceso', '/admin/pagos': 'Administrar pagos de muestra', '/admin/mensajes': 'Correos y códigos', '/admin/ajustes': 'Configuración del ecosistema',
};
for (const [path, title] of Object.entries(portalTitles)) pageMeta[path] = { title: `${title} | Vasees`, description: 'Prototipo interactivo de la Escuela y el CMS Vasees. Acceso, cursos, perfiles, pagos y correos de demostración.' };

export const collaborationTopics = [
  ['Colaborar entre generaciones', 'Explorar qué supuestos sobre la edad aparecen en el trabajo y qué acuerdos ayudarían a colaborar.'],
  ['Compartir lo que sabemos', 'Hacer visible el conocimiento que se aprende con la experiencia y buscar formas de compartirlo dentro del equipo.'],
  ['Dar espacio al propósito', 'Abrir conversaciones sobre intereses, capacidades y proyectos. Integrar herramientas de Ikigai cuando sean pertinentes.'],
  ['Preparar una nueva etapa laboral', 'Conversar sobre rutinas, vínculos y proyectos que pueden cambiar con la transición hacia la jubilación.'],
  ['Hacer del cuidado una conversación compartida', 'Reconocer las responsabilidades de cuidado que atraviesan la vida laboral y explorar cómo pedir, ofrecer y coordinar apoyos.'],
];

export const connections = [
  { name: 'Fundación Provida Colombia', category: 'Comunidad', description: 'Su Centro Día y sus programas de educación, bienestar y participación crean espacios para que las personas mayores sigan aprendiendo y compartiendo en comunidad.' },
  { name: 'Rödea Care', category: 'Cuidado', description: 'Plataforma de cuidado que busca facilitar la coordinación cotidiana entre las personas cuidadoras y sus redes de apoyo.' },
  { name: 'Juanitas', category: 'Cuidado', description: 'Programa vinculado con la formación de personas cuidadoras. Acerca el aprendizaje a quienes acompañan a otras personas en la vida diaria.' },
  { name: 'Precisión Logística', category: 'Organizaciones', description: 'Un contexto para conversar sobre el trabajo operativo, el valor de la experiencia y el talento en logística.' },
  { name: 'Comfama', category: 'Comunidad', description: 'Caja de compensación familiar de Antioquia que trabaja en ámbitos como educación, cultura y bienestar.' },
  { name: 'Asociación de Exalumnas La Enseñanza', category: 'Comunidad', description: 'Una organización que reúne a exalumnas de La Enseñanza y amplía las conversaciones sobre vínculos y trayectorias compartidas.' },
];

export const learningTopics = [
  { id: 'cuidar', category: 'Cuidado', title: 'Cuidar sin dejar de vivir.', text: 'Cómo conversar sobre responsabilidades, pedir apoyo y reservar tiempo para tu propia vida mientras cuidas.', image: '/images/editorial.webp' },
  { id: 'generaciones', category: 'Convivencia', title: 'Generaciones que se encuentran.', text: 'Maneras de escuchar y conversar sobre desacuerdos, decisiones y experiencias entre personas de distintas edades.', image: '/images/consulting.webp' },
  { id: 'explorar', category: 'Proyecto de vida', title: 'Un propósito que sigue creciendo.', text: 'Preguntas sobre lo que quieres seguir aprendiendo, haciendo y compartiendo a medida que pasan los años.', image: '/images/hero.webp' },
];
