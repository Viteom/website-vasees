export type Lesson = { title: string; text: string; reflection: string };
export type SchoolCourse = { id: string; category: string; title: string; description: string; image: string; imageAlt: string; lessons: Lesson[] };

export const schoolCourses: SchoolCourse[] = [
  {
    id: 'cuidar-sin-dejar-de-vivir', category: 'Cuidado', title: 'Cuidar sin dejar de vivir',
    description: 'Acompañar a otra persona también implica hacer espacio para tu propia vida.',
    image: '/images/school-care.webp', imageAlt: 'Escena conceptual de dos generaciones compartiendo un momento alrededor de la mesa',
    lessons: [
      { title: 'Empezar por escuchar', text: 'Antes de ofrecer ayuda, podemos preguntar qué necesita la otra persona, qué quiere seguir haciendo por su cuenta y en qué momentos le serviría un apoyo. Escuchar también permite reconocer nuestras propias posibilidades y límites.', reflection: 'Piensa en una ayuda que sueles ofrecer. ¿La has conversado con la persona que la recibe?' },
      { title: 'Hacer visible el cuidado', text: 'El cuidado reúne tareas que a veces pasan desapercibidas: organizar citas, acompañar decisiones, conversar o coordinar apoyos. Nombrarlas permite distribuir responsabilidades y pedir ayuda de una manera más concreta.', reflection: 'Anota tres tareas de cuidado que ocurren en una semana. ¿Quién suele asumir cada una?' },
      { title: 'Reservar espacio para ti', text: 'Descansar, mantener vínculos y seguir con tus proyectos forma parte de una vida de cuidado compartida. Una conversación sobre apoyos puede comenzar con una necesidad pequeña y una petición específica.', reflection: '¿Qué actividad te gustaría recuperar y qué apoyo concreto te ayudaría a hacerlo?' },
    ],
  },
  {
    id: 'generaciones-que-se-encuentran', category: 'Generaciones', title: 'Generaciones que se encuentran',
    description: 'Escuchar otras experiencias y descubrir lo que podemos aprender juntos.',
    image: '/images/school-generations.webp', imageAlt: 'Fotografía conceptual de una conversación entre dos adultos de distintas edades',
    lessons: [
      { title: 'Mirar más allá de la edad', text: 'La edad es una parte de nuestra historia, pero no explica por sí sola lo que sabemos, necesitamos o disfrutamos. Cada persona reúne experiencias, contextos y decisiones diferentes.', reflection: 'Recuerda una suposición que hayas hecho sobre alguien por su edad. ¿Qué podrías preguntarle en su lugar?' },
      { title: 'Conversar sin tener que coincidir', text: 'Podemos escuchar una experiencia sin compartir todas sus conclusiones. Preguntar por el contexto y reconocer lo que la otra persona intenta expresar ayuda a abrir una conversación más amplia.', reflection: 'Prueba una pregunta que empiece con «¿Cómo fue para ti…?» en una conversación pendiente.' },
      { title: 'Un aprendizaje compartido', text: 'Intercambiar conocimientos no es un proceso de una sola dirección. Una actividad cotidiana puede crear un espacio para enseñar algo, aprender otra cosa y reconocer la experiencia de cada persona.', reflection: '¿Qué te gustaría aprender de alguien de otra generación y qué podrías compartir tú?' },
    ],
  },
  {
    id: 'proposito-que-sigue-creciendo', category: 'Proyecto de vida', title: 'Un propósito que sigue creciendo',
    description: 'Volver a preguntarnos qué queremos aprender, hacer y compartir en cada etapa.',
    image: '/images/studio.webp', imageAlt: 'Composición editorial conceptual de un libro abierto y materiales creativos',
    lessons: [
      { title: 'Reconocer lo que te mueve', text: 'Los intereses pueden cambiar con el tiempo. Hacer una pausa para observar qué actividades despiertan curiosidad o dan sentido a nuestros días permite reconocer nuevas posibilidades.', reflection: '¿Qué conversación, actividad o tema ha despertado tu curiosidad recientemente?' },
      { title: 'Dar lugar a una nueva etapa', text: 'Una transición puede modificar rutinas, responsabilidades y vínculos. No hace falta tener un plan completo para comenzar a explorar lo que quieres mantener y lo que te gustaría cambiar.', reflection: 'Escribe algo que quisieras conservar de tu etapa actual y algo que te gustaría explorar.' },
      { title: 'Un primer paso posible', text: 'Una idea pequeña puede convertirse en una forma de probar un interés: hablar con alguien, asistir a un encuentro o reservar un momento de la semana. Empezar también es una manera de aprender.', reflection: 'Elige una acción concreta, pequeña y realista para acercarte a algo que te interesa.' },
    ],
  },
  {
    id: 'tecnologia-que-nos-acerca', category: 'Tecnología', title: 'Tecnología que nos acerca',
    description: 'Herramientas y conversaciones para una vida digital con más autonomía.',
    image: '/images/hero-flower.png', imageAlt: 'Flor translúcida como imagen conceptual de la relación entre tecnología y vida',
    lessons: [
      { title: 'Partir de una necesidad', text: 'Aprender una herramienta resulta más significativo cuando responde a algo que queremos hacer: conversar, buscar información o compartir un recuerdo. La necesidad es un mejor punto de partida que una lista de funciones.', reflection: '¿Qué te gustaría poder hacer con una herramienta digital que hoy te cuesta?' },
      { title: 'Acompañar sin reemplazar', text: 'Al ayudar a alguien con una herramienta, podemos explicar un paso y dejar que la otra persona lo pruebe a su ritmo. Hacer todo por ella puede resolver una tarea, pero no siempre le permite ganar confianza.', reflection: 'La próxima vez que acompañes un aprendizaje, pregunta si la persona prefiere observar, intentar o tomar notas.' },
      { title: 'Hacer preguntas también es aprender', text: 'Nadie necesita conocer todas las funciones de una aplicación. Reconocer una duda, consultar una fuente de confianza y practicar con una tarea pequeña permite construir aprendizajes propios.', reflection: 'Elige una duda concreta y piensa a quién o a qué fuente confiable podrías acudir.' },
    ],
  },
  {
    id: 'acuerdos-para-cuidarnos', category: 'Cuidado', title: 'Pequeños acuerdos para cuidarnos',
    description: 'Hablar de responsabilidades, apoyos y decisiones antes de que todo sea urgente.',
    image: '/images/school-care.webp', imageAlt: 'Imagen conceptual de un encuentro cotidiano entre generaciones',
    lessons: [
      { title: 'Abrir la conversación', text: 'Hablar de cuidado puede comenzar con una pregunta sobre la vida cotidiana. Escoger un momento tranquilo y expresar una necesidad concreta permite conversar antes de que una situación sea urgente.', reflection: '¿Qué pregunta pequeña podría abrir una conversación sobre cuidado en tu familia?' },
      { title: 'Acordar responsabilidades', text: 'Un acuerdo es más claro cuando nombra qué tarea se realizará, quién puede asumirla y cuándo conviene revisarla. Las posibilidades cambian, por eso también necesitamos permiso para volver a conversar.', reflection: 'Elige una tarea compartida y ensaya una propuesta que incluya quién, qué y cuándo.' },
      { title: 'Revisar lo que funciona', text: 'Los acuerdos pueden necesitar ajustes. Preguntar qué ha servido, qué sigue siendo difícil y qué apoyo falta permite reconocer el esfuerzo y cambiar lo que ya no responde a la situación.', reflection: '¿Qué acuerdo de tu vida cotidiana merecería una nueva conversación?' },
    ],
  },
  {
    id: 'historias-que-nos-conectan', category: 'Generaciones', title: 'Historias que nos conectan',
    description: 'La memoria y las experiencias como un puente entre distintas formas de vivir.',
    image: '/images/school-generations.webp', imageAlt: 'Imagen conceptual de un intercambio de experiencias entre generaciones',
    lessons: [
      { title: 'Una historia, muchas preguntas', text: 'Una anécdota permite conocer algo del contexto, las decisiones y los vínculos de una persona. Escuchar con curiosidad puede abrir preguntas distintas a las que hacemos habitualmente.', reflection: 'Piensa en alguien a quien te gustaría preguntarle por una experiencia que no conoces.' },
      { title: 'Escuchar sin apurar el relato', text: 'Dar tiempo, aceptar las pausas y no completar la historia por la otra persona son maneras de acompañar una conversación. Cada quien decide qué quiere contar y qué prefiere guardar.', reflection: '¿Qué cambia si escuchas una historia sin intentar llegar rápidamente a una conclusión?' },
      { title: 'Compartir algo propio', text: 'Los relatos también pueden ir y volver. Contar una experiencia propia y preguntar qué encuentra en ella la otra persona permite reconocer diferencias y puntos de encuentro.', reflection: 'Elige un recuerdo que te gustaría compartir y una pregunta para continuar la conversación.' },
    ],
  },
];

export const schoolCategories = ['Todos', 'Cuidado', 'Generaciones', 'Proyecto de vida', 'Tecnología'];
