// Brief v3 §11: legal pages exist with their structure, but no approved legal text has been provided.
// Every page is flagged LEGAL_REVIEW_REQUIRED and only states verifiable facts about this version of the site.
export const LEGAL_REVIEW_REQUIRED = true;

export type LegalPage = {
  path: string;
  title: string;
  short: string;
  intro: string;
  facts: string[];
  sections: string[];
};

export const legalPages: LegalPage[] = [
  {
    path: '/privacidad', title: 'Política de tratamiento de datos personales', short: 'Privacidad y datos',
    intro: 'Esta política se publicará con el texto aprobado por la revisión jurídica de Vasees, conforme a la Ley 1581 de 2012 y las normas colombianas aplicables.',
    facts: [
      'Este sitio no almacena ni envía formularios. El formulario de contacto abre tu aplicación de correo con un mensaje que puedes revisar antes de enviarlo.',
      'El sitio no registra suscripciones al newsletter.',
      'Los accesos a Mi Escuela y a la administración son de demostración: no usan cuentas reales ni procesan pagos.',
    ],
    sections: ['Responsable del tratamiento y datos de contacto', 'Datos que se recogen y finalidades', 'Derechos de las personas titulares', 'Canales para consultas y reclamos', 'Conservación y seguridad de la información', 'Procedimiento de consulta y reclamo', 'Vigencia y cambios de la política'],
  },
  {
    path: '/terminos', title: 'Términos de uso del sitio', short: 'Términos de uso',
    intro: 'Los términos de uso del sitio se publicarán cuando estén validados jurídicamente.',
    facts: [
      'Esta versión del sitio es una vista de revisión y no ofrece compras ni contrataciones en línea.',
      'Los contenidos del Observatorio marcados como muestra editorial no son investigaciones propias concluidas.',
    ],
    sections: ['Titular del sitio', 'Uso permitido de los contenidos', 'Propiedad intelectual', 'Enlaces a sitios de terceros', 'Responsabilidad', 'Ley aplicable y contacto'],
  },
  {
    path: '/cookies', title: 'Política de cookies y tecnologías de seguimiento', short: 'Cookies',
    intro: 'La política de cookies se publicará con el texto aprobado y, si se incorporan herramientas de medición, con un gestor de consentimiento.',
    facts: [
      'Esta versión del sitio no incorpora herramientas de analítica ni de publicidad.',
      'Al reproducir el podcast de La Chispa se carga el reproductor de YouTube, que aplica sus propias políticas y tecnologías.',
    ],
    sections: ['Qué son las cookies y tecnologías similares', 'Tecnologías que usa el sitio', 'Servicios de terceros', 'Cómo gestionar tus preferencias'],
  },
  {
    path: '/terminos-escuela', title: 'Términos del servicio educativo', short: 'Términos de la Escuela',
    intro: 'Los términos de la Escuela de Familia y Longevidad se publicarán antes de abrir inscripciones, membresías o pagos, con validación jurídica bajo la normativa colombiana de protección al consumidor.',
    facts: [
      'La Escuela no tiene inscripciones, membresías ni pagos habilitados. Los cursos y pagos que ves en Mi Escuela son de demostración.',
    ],
    sections: ['Características del acceso y de los cursos', 'Precios, medios de pago y facturación', 'Renovación y cancelación', 'Retracto, reversión y devoluciones cuando apliquen', 'Canal de atención'],
  },
];
