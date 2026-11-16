# Vasees — Más años. Más futuro.

Home e internas editoriales responsive para comunicación, cultura, tecnología y longevidad. React 19, TypeScript y Vite. Tipografía Pathway Extreme alojada localmente, licencia OFL en `public/fonts/OFL.txt`.

## Desarrollo

Node.js 24 y npm (validados en este entorno).

```sh
cd /workspace/website-vasees
npm ci --cache /workspace/.npm --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

```sh
npm run build
npm run preview -- --port 4173 --strictPort
npm run smoke
node scripts/export-preview.mjs
npm run smoke:pages
npm run smoke:school
```

El smoke test de la home abre Chromium y levanta su propio servidor temporal en el puerto 5174. Comprueba navegación entre home y páginas, lectura del Observatorio, servicios, FAQ, diagnóstico, newsletter, preparación del correo, diseño a 1440/768/390 px y movimiento reducido. Guarda capturas en `.qa/` (ignoradas en Git). Usa `/usr/bin/chromium`; puedes indicar otra instalación mediante `CHROMIUM_PATH`. No necesita descargar un navegador. No detiene el servidor de desarrollo.

Cada tarea del entorno ya está aislada: utiliza este checkout; no crees un worktree salvo petición expresa. Los procesos deben iniciarse de nuevo después de restaurar el entorno. No hacen falta secretos ni backend para este alcance.

## Edición

- `src/content/home.ts`: servicios, capacidades, estados, iniciativas, clientes, preguntas, investigación y contacto. `enabled` controla qué servicios se muestran; `status` identifica Tech como línea en desarrollo.
- `src/main.tsx`: recorrido de la home, navegación, fichas en diálogo, formulario de correo y ejercicio de diagnóstico.
- `src/styles.css`: tokens de marca, home, tamaños responsive, tarjetas superpuestas y movimiento reducido.
- `src/inner-pages.tsx` y `src/inner-pages.css`: composición y contenido de las internas.
- `src/content/pages.ts`: metadatos, organizaciones y temas de Consulting.
- `src/school.tsx`, `src/school.css` y `src/content/school.ts`: Escuela, catálogo de seis cursos demo y sus tres lecciones de muestra por curso.
- `src/navigation.tsx`: enlaces, historial y navegación con hash en la vista descargable.
- `public/images/`: fotografías conceptuales generadas con IA y versión raster del logo sin slogan, preparada a partir del adjunto. Sustituir por el vector oficial antes del lanzamiento. El hero de Escuela usa `school-mateo-melissa.webp`, una composición con fondo retirado a partir de las dos fotografías aportadas por el usuario; `school-care.webp` y `school-generations.webp` son imágenes conceptuales para cursos de muestra.

## Internas y salida estática

| Ruta | Recorrido |
|---|---|
| `/studio` | Marca, capacidades, proceso, experiencia relacionada, FAQ y contacto |
| `/consulting` | Conversaciones expandibles, diseño de experiencias, cuidado y FAQ |
| `/tech` | Enfoque en construcción y acceso a Kánna |
| `/ecosistema` | Red con filtros por categoría e iniciativas propias |
| `/observatorio` | Portada editorial, líneas de exploración, lecturas y fuentes |
| `/observatorio/vivir-mas` | Lectura completa con índice y fuentes |
| `/escuela` | Hero con Mateo y Melissa, carrusel, búsqueda, filtros y seis cursos demo con tres lecciones cada uno |
| `/ecosistema/kanna` | Presentación de la iniciativa de talento senior en desarrollo |
| `/la-chispa` | Proyecto editorial y acceso informativo al newsletter |

`npm run build` genera HTML prerenderizado para la home y cada interna mediante `scripts/prerender.mjs`. Cada documento tiene su H1 y metadatos sin depender de JavaScript para leer su contenido. Las rutas se pueden servir desde sus directorios en cualquier alojamiento estático; también se genera `dist/404.html`.

Después de compilar, `node scripts/export-preview.mjs` crea `.qa/Vasees-vista-previa.html`: un único archivo con imágenes y fuente incluidas. Utiliza rutas hash para navegar, volver atrás y recargar sin servidor. `npm run smoke:pages` requiere esta exportación y el build recientes; prueba las nueve internas, sus documentos HTML, tres anchos, filtros, temas, navegación y el archivo autocontenido.

La Escuela incluye un catálogo de demostración: las fichas permiten leer tres lecciones, moverse entre ellas y marcarlas como leídas. Ese estado vive en memoria y se reinicia al cerrar la ficha. No hay cuentas, pagos, certificados, matrículas, vacantes ni integraciones de newsletter simuladas.

`npm run smoke:school` comprueba la navegación (Escuela sustituye a Insights en el menú; Insights permanece en la home), catálogo, búsqueda sin acentos, filtros, carrusel, lectura de lecciones, estado de progreso, teclado, foco y diseño a 1440/768/390 px. Requiere el build reciente y usa su propio puerto 5177.

## Contenido e interacciones

- Los clientes aparecen mediante sus nombres, sin inventar sus identidades gráficas. La franja se puede pausar y se detiene con movimiento reducido.
- El manifiesto revela «Futuro. Longevidad. Humanidad.» de desenfoque a nitidez según el scroll. Con movimiento reducido queda nítido y estático.
- El Observatorio tiene una exploración editorial completa de muestra. No se presenta como una investigación propia finalizada ni ofrece un PDF inexistente. Las dos cifras son proyecciones mundiales 60+ con fuente OMS enlazada.
- El newsletter se llama **El Futuro tiene Canas**. Su acceso y suscripción están pendientes; la ficha ofrece una consulta por correo, sin confirmar altas ficticias.
- Contacto prepara un `mailto:info@vasees.co` con los datos introducidos. El visitante revisa y envía en su aplicación de correo. No se simula envío ni se guardan datos.
- El diagnóstico es un ejercicio orientativo de tres preguntas, no una evaluación validada. Las respuestas viven solo en memoria mientras el diálogo está abierto. Su acción final prepara un correo con el resumen.
- Los cursos de Escuela están identificados como muestras y Kánna continúa en desarrollo. No hay inscripciones ni reproducción de videos ficticia.

## Revisión y lanzamiento

Esta versión incluye `noindex, nofollow` y una nota de revisión. No está desplegada a producción. Revisar antes de lanzar:

1. Archivos y permisos de logos de clientes y logo vectorial oficial sin slogan.
2. Fotografías autorizadas para sustituir las imágenes conceptuales, si se desean personas/proyectos reales.
3. Investigación publicada, autoría, fecha y PDF real.
4. URL del newsletter y proveedor de suscripción, consentimiento y política de privacidad si se activa captura de datos.
5. Disponibilidad comercial de Tech y estado de cada iniciativa.
6. Decisión de indexación y revisión editorial final.

El usuario gestiona la publicación del entorno desde Codex. Este trabajo prepara su contenido y configuración; no realiza la publicación de una versión ni un despliegue web público.
