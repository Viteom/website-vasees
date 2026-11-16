# Vasees — revisión de la home

Fecha: 15 de noviembre de 2026.

## Referencia y alcance de comparación

- Fuente visual: capturas Kora adjuntas al mensaje del usuario (hero, texto con blur, tarjetas, investigación, preguntas e Insights), más el logo Vasees adjunto. Son referencias visibles en la conversación; no se proporcionaron sus archivos raster como descargas locales.
- Contexto editorial: los dos documentos suministrados. La petición directa del usuario prevalece: clientes a izquierda y lectura a derecha, CTA superior contrastado, logo sin slogan, manifiesto con scroll, investigación ampliada, soluciones, ecosistema, diagnóstico, FAQ y newsletter «El Futuro tiene Canas».
- Se compara una adaptación a Vasees, no una copia de Kora: fotografía humana conceptual en lugar de flor, paleta Vasees, Pathway Extreme y contenido español. Los nombres de clientes sustituyen sus logos únicamente mientras no se disponga de archivos oficiales.
- Referencia Kora original: capturas 1920 × 1080 que incluyen navegador y escritorio; área web aproximada 1920 × 880. Se excluyó ese chrome de la evaluación conceptual. No se declara equivalencia píxel a píxel entre formatos distintos.

## Evidencia de implementación

Capturas renderizadas con Chromium, densidad 1; dimensiones CSS y raster coinciden. Archivos locales ignorados en Git, regenerables mediante `npm run smoke`.

- `.qa/desktop-hero.png`: 1440 × 1000, portada inicial.
- `.qa/tablet-hero.png`: 768 × 1024, portada inicial.
- `.qa/mobile-hero.png`: 390 × 844, portada inicial.
- `.qa/desktop-full.png`, `.qa/tablet-full.png`, `.qa/mobile-full.png`: recorrido completo, imágenes cargadas tras recorrer las secciones.
- `.qa/manifesto-revealed.png`: 1440 × 1000, estado nítido después del scroll.
- `.qa/diagnostic.png`: 1440 × 1000, resultado orientativo del cuestionario.
- Capturas de detalle examinadas durante la revisión: `/tmp/vasees-observatory.png`, `/tmp/vasees-services.png`, `/tmp/vasees-mobile-hero.png`.

La captura de página completa muestra el manifiesto en su estado inicial de desenfoque y el espacio que recorre el elemento sticky; no representa toda su secuencia. La evidencia de su estado final es la captura `manifesto-revealed.png` y la comprobación de cambios de filtro con el scroll.

## Superficies revisadas

1. **Tipografía:** Pathway Extreme local, jerarquía amplia y compacta, logo raster sin slogan, botones legibles. En móvil se corrigieron los espacios perdidos al ocultar saltos de línea. El hero se adapta de dos líneas en escritorio a un bloque de varias líneas en móvil.
2. **Espaciado y composición:** navegación en cápsula, CTA separado arriba a derecha, portada fotográfica redondeada, franja de clientes abajo a izquierda y tarjeta editorial abajo a derecha. Servicios en paneles grandes superpuestos en escritorio y secuencia natural en móvil. Sin desbordamiento horizontal a 1440, 768 y 390 px.
3. **Color y contraste:** azul profundo, marfil, lila, coral y lima según la marca. Se oscurecieron textos secundarios, índices y notas que no alcanzaban contraste AA. La ejecución final de axe no detectó infracciones WCAG 2 A/AA y 2.1 AA en escritorio o móvil. Esto no equivale a una auditoría exhaustiva de accesibilidad.
4. **Imágenes y activos:** fotografías WebP locales, hero prioritario e imágenes posteriores diferidas; ningún recurso roto tras recorrer la página. Las imágenes son conceptuales, no documentación de casos reales. El wordmark se preparó a partir del adjunto y deberá reemplazarse por el vector oficial antes del lanzamiento. No se inventaron logos de clientes ni métricas propias.
5. **Copy:** español, propuestas Studio/Consulting/Tech diferenciadas, Tech en desarrollo, estados de las iniciativas visibles. La lectura destacada se identifica como muestra editorial. Las cifras mundiales 60+ tienen horizonte y enlace OMS. Newsletter y formularios tienen un respaldo de correo veraz.

## Hallazgos y correcciones

- **P2, primera revisión móvil:** al quitar un salto de línea se unían «cambia.Lo» y «tambiénse». Se añadieron espacios explícitos. Verificación posterior: capturas móviles y recorrido final.
- **P2, contraste:** índices y algunos textos secundarios tenían relaciones de contraste inferiores a 4,5:1. Se actualizaron colores. Verificación posterior: axe en 1440 y 390 px, cero infracciones detectadas.
- **P2, affordance de investigación:** las tres líneas temáticas tenían flecha pero no eran controles. Se convirtieron en botones con nombre accesible que abren la lectura.
- **P2, consola:** faltaba el favicon y producía un 404. Se enlazó el activo de marca y se volvió a ejecutar el recorrido: cero errores de consola o excepciones de página.
- Se ampliaron controles táctiles, se añadieron teclas de flecha/Home/End a las pestañas FAQ y se comprobó la restitución del foco al cerrar diálogos.

No quedan hallazgos accionables P0/P1/P2 en el alcance revisado.

## Comportamiento comprobado

`npm ci`, `npm run build` y `npm run smoke` completados. **29 comprobaciones de navegador aprobadas**, que cubren:

- carga y H1 único;
- pausa de la franja de clientes;
- lectura editorial con tres territorios;
- fichas de los tres servicios y cierre con Escape/restauración de foco;
- categorías y expansión de FAQ;
- diagnóstico con respuesta obligatoria, recomendación orientativa y resumen de correo;
- ficha de newsletter y alternativa de correo;
- contacto con datos introducidos en un `mailto:` sin simular envío;
- ausencia de persistencia de datos personales en almacenamiento del navegador;
- imágenes y overflow en tres anchos;
- menú móvil que navega y se cierra;
- cambio de blur con scroll y contenido nítido con movimiento reducido;
- ausencia de errores de consola o excepciones de página.

Revisión automática complementaria: axe, etiquetas WCAG 2 A/AA y 2.1 AA, **0 infracciones detectadas** a 1440 y 390 px.

## Pendientes editoriales, fuera del acabado de esta home

Logos autorizados de clientes, logo vectorial, investigación propia publicada, enlace/proveedor del newsletter y políticas/integraciones si se habilita captura real de datos. La Escuela con cuentas y aula no forma parte de esta petición. No se ha publicado ni desplegado la web o el entorno.

## Iteración: hero floral

A petición del usuario, el hero y su continuidad visual en el manifiesto usan ahora `public/images/hero-flower.png`: flor coral translúcida sobre azul petróleo, cercana al referente Kora. La fotografía de colaboración se conserva en Tech. Se actualizaron texto alternativo, precarga y exportación HTML autocontenida.

Evidencia: `.qa/hero-flower-desktop.png` (1440 × 1000) y `.qa/hero-flower-mobile.png` (390 × 844), abiertas y revisadas. Se conservan composición, tipografía y controles. Compilación aprobada; imagen nueva cargada, lectura del Observatorio funcional, sin overflow móvil ni excepciones JavaScript. Exportación actualizada en `.qa/Vasees-vista-previa-flor.html`.

## Iteración: internas públicas

Fuente visual: la home floral aprobada (`.qa/hero-flower-desktop.png`), el diseño de tarjetas Kora aportado por el usuario y el contenido del documento maestro. La home mantiene su composición. Las internas desarrollan esa identidad con recorridos propios: Studio editorial marfil/coral; Consulting lila y conversaciones expandibles; Tech azul/lima; Ecosistema con filtros; Observatorio y lectura con composición de revista. Escuela, Kánna y La Chispa son presentaciones honestas de iniciativas en preparación.

Rutas añadidas: `/studio`, `/consulting`, `/tech`, `/ecosistema`, `/observatorio`, `/observatorio/vivir-mas`, `/escuela`, `/ecosistema/kanna`, `/la-chispa`. Cada documento contiene H1 y metadatos únicos prerenderizados. Se añadió un 404. La navegación del archivo descargable utiliza hash sin perder la página al abrir el índice de una lectura.

Evidencias finales: `.qa/final-{ruta}-1440.png` y `.qa/final-{ruta}-390.png` (en rutas anidadas, `/` se sustituye por `-`). El recorrido previo y las capturas completas están en `.qa/inner-{ruta}-{1440,768,390}.png` y `-full.png`. Se abrieron y revisaron especialmente Studio, Observatorio, Consulting móvil y Tech móvil, además de revisar el conjunto mediante capturas y las comprobaciones de overflow e imágenes.

Superficies revisadas: Pathway Extreme y jerarquía compartida; tarjetas y bordes; tokens de color; encuadre y calidad de los activos locales; copy, fuentes y estados editoriales. Las diferencias de composición respecto al hero son intencionales para dar un recorrido propio a cada página. Se reutilizan fotografías conceptuales autorizadas para este prototipo; no se presentan como fotografías de clientes.

Hallazgos P2 corregidos:

- El orden de importación de CSS hacía que algunos espaciados base dominaran las reglas de las internas. Se cargan ahora sus reglas después de los estilos base; nuevas capturas muestran la cabecera y el recorrido con el espaciado previsto.
- Los breadcrumbs sobre lila/coral, texto secundario de Studio y notas de fuente tenían contraste bajo. Se oscurecieron y se volvió a comprobar: **0 infracciones detectadas en 18 ejecuciones de axe (9 internas × escritorio/móvil)**.
- Los enlaces de índice de la lectura no conservaban la ruta en la exportación sin servidor. Se corrigió la navegación hash y se comprobó ancla, recarga y vuelta a inicio.

Verificación: compilación y prerender de 10 páginas, **29 comprobaciones de home** y **103 comprobaciones de internas, producción estática y archivo descargable aprobadas**. Los resultados de las internas están en `.qa/pages-test-results.json`; accesibilidad final en `.qa/pages-accessibility.json`. No hay hallazgos accionables P0/P1/P2 pendientes en el alcance revisado.

La publicación del entorno sigue siendo una acción del producto Codex. Guardar la configuración no publica la versión. No se ha hecho un despliegue de la web a Internet.

## Iteración: Escuela con Mateo y Melissa

Petición: sustituir Insights por Escuela en la navbar, mantener Insights en la home, desarrollar Escuela con cursos dummy e incluir a Mateo y Melissa en su hero. Fuentes visuales: las capturas adjuntas de Heal Learning y BBVA Aprendemos Juntos, más las dos fotografías aportadas por el usuario.

Implementación: hero azul con composición fotográfica transparente de los dos presentadores; seis cursos de muestra en carrusel y catálogo, búsqueda insensible a acentos, filtros por tema, ficha de curso con tres lecciones demo, ejercicios de reflexión y marcado de lectura. No hay pagos, matrículas, videos o certificaciones ficticios. El progreso se reinicia al cerrar la ficha y así se indica en ella.

Activos: `public/images/school-mateo-melissa.webp` deriva de las fotografías suministradas (Melissa en posición vertical y fondos retirados). Se comprobó visualmente la composición y las identidades respecto a las fotos del usuario. `school-care.webp` y `school-generations.webp` son fotografías conceptuales generadas para ilustrar los cursos, optimizadas en WebP.

Evidencia final: `.qa/school-final-1440.png`, `.qa/school-final-768.png`, `.qa/school-final-390.png`, sus versiones `-full.png`, `.qa/school-course-desktop.png` y `.qa/school-final-mobile-dialog.png`. Se revisaron el hero, los retratos, el catálogo, los recortes y los estados de la ficha. Las diferencias respecto a las referencias (marca, texto, colores, personas y ausencia de reproducción de videos sin contenido) son adaptaciones intencionales.

Superficies revisadas: Pathway Extreme con acentos editoriales en Georgia, ritmo y espacios, azul/lila/marfil de Vasees, calidad y transparencia de fotografías, copy español y etiquetas de demostración. El menú de escritorio y móvil contiene Escuela y no contiene Insights; la sección Insights de la home se conserva.

Validación: compilación y prerender correctos; **35 comprobaciones específicas de Escuela aprobadas**, incluido foco dentro del diálogo y restitución al cerrar, lectura completa, reinicio de progreso, filtros y estados vacíos; sin overflow a 1440, 768 y 390 px. Axe no detectó infracciones WCAG 2 A/AA y 2.1 AA en página y ficha, tanto a 1440 como a 390 px (4 ejecuciones). Los resultados de interacción están en `.qa/school-test-results.json`.

No quedan hallazgos P0/P1/P2 en el alcance de esta iteración. La versión se entrega mediante el repositorio conectado a Vercel; un push no demuestra que el despliegue haya terminado.

final result: passed
