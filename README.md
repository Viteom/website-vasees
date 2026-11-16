# Vasees · Más años. Más futuro.

Web editorial y prototipo interactivo de la Escuela de Hijos y Nietos y su backoffice. React 19, TypeScript y Vite; tipografía Pathway Extreme alojada localmente (licencia OFL en `public/fonts/OFL.txt`).

## Desarrollo y verificación

Node.js 24 y npm, con Chromium disponible en el entorno.

```sh
npm ci --cache /workspace/.npm --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

```sh
npm run build
npm run smoke
npm run smoke:flower
node scripts/export-preview.mjs
npm run smoke:pages
npm run smoke:school
```

La compilación valida TypeScript y genera 32 rutas estáticas y un 404. Las rutas de Escuela y administración generan el acceso de muestra: no se prerenderiza un perfil autenticado. Las pruebas levantan y cierran sus propios servidores en 5174, 5176 y 5177; usan Chromium del sistema (`CHROMIUM_PATH` permite cambiarlo). Las capturas y resultados quedan en `.qa/`, ignorada en Git. `smoke:pages` necesita la exportación reciente; `smoke:school` utiliza axe-core para comprobaciones automatizadas WCAG A/AA.

## Recorrer la Escuela y el backoffice

- `/escuela` es la landing pública: header, hero con Mateo y Melissa, degradado azul, catálogo, avances en video, enfoque y preguntas.
- **Ingresar** abre `/escuela/ingresar`. El área de estudiante tiene su propia ruta `/escuela/inicio`.
- Puedes explorar los cursos y sus avances sin cuenta. Al continuar al aula o una inscripción se muestra el ingreso y se conserva el curso elegido.
- Los botones **Vista estudiante** y **Vista administrador** permiten recorrer ambos perfiles de demostración.
- El formulario de estudiante pasa por la vista de código: utiliza **123456**. El código es fijo y no se envía por correo.
- Registro, recuperación y nueva contraseña son recorridos visuales. Usar datos ficticios.
- `/admin` abre el acceso al backoffice; desde la Escuela se requiere un cambio explícito de vista demo.

Todo el estado vive en memoria: se conserva al navegar en la misma pestaña y se reinicia al recargar. No se crean cuentas, no se validan identidades, no se guardan contraseñas, no hay permisos de servidor, transacciones, suscripciones ni envíos reales. El selector de rol es una herramienta para revisar la maqueta, no una implementación de seguridad. La landing pública permanece accesible también al iniciar la sesión demo; su botón cambia a Mi Escuela.

### Estudiante

| Ruta | Experiencia |
|---|---|
| `/escuela/inicio` | Inicio privado de muestra, cursos en biblioteca, progreso y recomendaciones |
| `/escuela/explorar` | Catálogo publicado, búsqueda sin acentos, categorías y ficha de curso |
| `/escuela/mis-cursos` | Biblioteca de muestra con progreso |
| `/escuela/aula` | Lectura de lecciones, reflexión, recursos y notas temporales |
| `/escuela/perfil` | Datos, preferencias, newsletter y vista de acceso |
| `/escuela/pago` | Pago simulado con tarjeta fija o PSE de muestra; aprobado y rechazado |
| `/escuela/pagos` | Historial y resumen sin validez fiscal |

Hay seis cursos iniciales con tres lecciones cada uno: cuatro publicados y dos borradores visibles en administración. Los valores en COP son ilustrativos. El pago aprobado añade el curso a la biblioteca de esta demo; el curso gratuito se añade sin pasar por pago. La tarjeta de muestra es de solo lectura y no admite datos reales. Las notas del aula duran mientras se permanezca en esa vista.

### Administración

| Ruta | Experiencia |
|---|---|
| `/admin` | Resumen y accesos a contenidos |
| `/admin/cursos` | Buscar, filtrar, crear, duplicar, archivar y recuperar cursos |
| `/admin/curso` | Información, precio, portada, lecciones, orden, recurso de muestra y publicación en demo |
| `/admin/contenido` | Las diez páginas públicas de Vasees |
| `/admin/pagina` | Título, descripción, secciones, orden, visibilidad y previsualización editorial |
| `/admin/medios` | Biblioteca, incorporación local de archivos y detalle |
| `/admin/usuarios` | Perfiles ficticios, roles, estado e invitaciones simuladas |
| `/admin/pagos` | Registro, filtros y detalle de operaciones de muestra |
| `/admin/mensajes` | Plantillas para códigos, bienvenida, recuperación y resumen; vista de correo |
| `/admin/ajustes` | Identidad, navegación de muestra, roles propuestos e integraciones pendientes |

Publicar un curso en el panel actualiza el catálogo del estudiante en la misma sesión. Editar páginas y navegación actualiza su previsualización del CMS; no reescribe los archivos del sitio público ni despliega Vercel. Las imágenes locales se pueden elegir como portada durante esa sesión. Los recursos PDF/MP4 que se eligen en el editor muestran sus metadatos; no se almacenan en un servidor. Los avances de la landing son archivos de muestra locales independientes de esos recursos.

## Fase técnica pendiente

El alcance aprobado es visual. Resend es el único proveedor previsto para códigos y mensajes transaccionales. Las plantillas no realizan solicitudes de envío ni solicitan una clave API.

Resend entrega correos; el backend deberá crear y verificar los códigos, gestionar su caducidad y límites de intentos, autenticar sesiones y aplicar permisos de estudiante, editor y administrador. También quedan pendientes la base de datos del CMS, almacenamiento de archivos, pasarela de pago y sus confirmaciones. Esta demo no requiere secretos de esos servicios.

## Web pública

Home con hero floral, clientes por sus nombres, manifiesto que se revela de desenfoque a nitidez al hacer scroll, soluciones, Observatorio, ecosistema, diagnóstico, FAQ e Insights. Insights se conserva en la home; Escuela ocupa su lugar en la navbar. El newsletter se llama **El Futuro tiene Canas**.

| Ruta | Contenido |
|---|---|
| `/studio` | Marca, comunicación, capacidades, proceso y FAQ |
| `/consulting` | Cultura, cuidado, conversaciones y colaboración intergeneracional |
| `/tech` | Tecnología para longevidad; línea en desarrollo |
| `/ecosistema` | Organizaciones e iniciativas, con filtros |
| `/observatorio` | Líneas de exploración, lecturas y fuentes |
| `/observatorio/vivir-mas` | Lectura editorial de muestra con índice y contexto |
| `/ecosistema/kanna` | Iniciativa de talento senior en desarrollo |
| `/la-chispa` | Proyecto editorial sobre vida, vejez, cultura y arte |

El contacto público prepara un `mailto:info@vasees.co` para revisar en la aplicación de correo; el sitio no lo envía. El diagnóstico es un ejercicio orientativo, con respuestas temporales. El newsletter público ofrece información, sin activar suscripciones. Se respetan movimiento reducido, navegación por teclado y foco en los diálogos. La web conserva `noindex, nofollow` durante esta etapa de revisión.

## Archivos principales

- `src/main.tsx`, `src/styles.css`: home y navegación pública.
- `src/inner-pages.tsx`, `src/inner-pages.css`, `src/content/`: internas, contenidos y metadatos.
- `src/components/ui/sign-in-page.tsx`: adaptación visual del componente adjunto, con los enlaces e iconos ya utilizados por Vasees.
- `src/portal/demo-store.tsx`: datos ficticios y estado temporal compartido.
- `src/portal/index.tsx`, `shared.tsx`, `student.tsx`, `admin.tsx`, `portal.css`: acceso, layouts, estudiante, CMS y estilos.
- `src/navigation.tsx`: navegación interna e historial; rutas hash para la exportación sin servidor.
- `src/school.tsx`, `src/school.css`: landing pública de Escuela y fichas con avances; el área de estudiante está en `src/portal/`.
- `public/images/`: logo, fotografía conceptual y composición de Mateo y Melissa. La composición se corrigió usando el nuevo retrato de Melissa como referencia y se convirtió a WebP.
- `scripts/prerender.mjs`: documentos estáticos; `scripts/export-preview.mjs`: exportación autocontenida de revisión.

El repositorio está vinculado al proyecto Vercel `website-vasees`. Los cambios enviados a su rama de producción pueden iniciar un despliegue; el estado **Ready** se comprueba en Vercel. Publicar una versión del entorno de Codex es una acción separada de la interfaz de Codex.


## Avances públicos de cursos

Los seis cursos iniciales disponen de un clip MP4 de 10 segundos, silencioso e identificado como avance visual de demostración. La landing muestra los cuatro cursos publicados; los otros dos conservan sus clips preparados para una publicación de muestra desde el panel. Cada avance presenta el tema y el recorrido. Se incluye un archivo VTT en español y el índice textual de las lecciones junto al video. La reproducción es una acción del visitante, sin autoplay al abrir la landing ni al abrir la ficha.

Los archivos están en `public/videos/`. Para regenerarlos localmente, con Node.js 24 y FFmpeg disponible, ejecuta `node scripts/generate-school-trailers.mjs`. La compilación y Vercel sirven los archivos ya incluidos y no necesitan FFmpeg. Los cursos nuevos sin un clip muestran «Avance en preparación». La exportación autocontenida incluye también los videos y sus pistas VTT.


## Movimiento sutil de la flor

El hero de la home conserva su fotografía y encuadre. Sus pétalos tienen una oscilación localizada de 12 segundos; el fondo y el tallo permanecen quietos. El movimiento se generó localmente mediante el renderizador `src/flower-wind.ts`. Las herramientas de Higgsfield no estaban disponibles en este chat.

La web reproduce `public/videos/hero-flower-breeze.mp4` (H.264, sin audio, 1296×864) en bucle, con pausa/reanudación y suspensión fuera de pantalla o al ocultar la pestaña. La imagen original aparece al cargar, si falla la reproducción y con movimiento reducido. En una visita con movimiento reducido no se solicita el video. `public/images/hero-flower-breeze.gif` es la versión GIF descargable de 720×480, también en bucle. La exportación autocontenida incluye la versión MP4.

`npm run smoke:flower` comprueba reproducción, pausa, continuidad del bucle, encuadre, ausencia de cambios en la posición del texto, suspensión fuera de pantalla, movimiento reducido, imagen de respaldo y accesibilidad del hero. Los hashes y la comprobación de cierre del render están en `src/content/flower-motion-proof.json`. Para regenerar los medios, con Chromium y FFmpeg disponibles, ejecuta `node scripts/generate-flower-motion.mjs`; la compilación de Vercel sirve los archivos ya generados.
