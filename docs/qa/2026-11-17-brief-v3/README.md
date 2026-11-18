# Brief v3 en la web pública: cambios, decisiones y pruebas

Fecha: 17 de noviembre de 2026. Rama: `feat/brief-v3-web-publica`.

Primera parte de la reconstrucción del sitio con el brief maestro v3. Cubre la web pública. La plataforma de la Escuela (bienvenida, foros, membresías y empresas) queda para las partes siguientes.

## Qué cambió

### Navegación y rutas
- Menú: Soluciones · Ecosistema · Observatorio · Escuela · La Chispa, con el botón **Hablemos**. El menú móvil tiene las mismas entradas.
- Ruta nueva `/soluciones`. Las antiguas `/studio`, `/consulting` y `/tech` redirigen a `/soluciones#marca`, `#cultura` y `#tech`: en Vercel con `vercel.json` y dentro de la app con una redirección del lado del cliente.
- Rutas legales nuevas: `/privacidad`, `/terminos`, `/cookies` y `/terminos-escuela`.
- Favicon con el símbolo «ee» del logo, en azul `#11374A` sobre fondo transparente (`favicon.ico`, `favicon.png` y `apple-touch-icon.png`).

### Home, en el orden del brief
1. **Hero**: el mismo H1 y la flor animada, una sola línea de apoyo y un solo botón («Explora nuestras soluciones»). Se quitaron el segundo enlace, los nombres de organizaciones, la tarjeta del Observatorio y la numeración.
2. **Organizaciones con las que hemos trabajado**, debajo del hero. Por ahora son solo nombres, sin logos.
3. Un solo capítulo con **contexto, visión 2031 y Observatorio**. El dato de la OMS lleva su fuente y se aclara que es población de 60 años o más. El dato de Colombia queda como campo editable (`statColombia`), sin publicar mientras no esté verificado. El Observatorio aparece como «Investigación en preparación», sin PDF.
4. **Lo que hacemos**: tres tarjetas visibles al mismo tiempo en escritorio, con los textos del brief. En móvil, tarjetas verticales. Ya no se apilan unas sobre otras.
5. **Ecosistema**: soluciones y plataformas, con enlace a `/ecosistema`.
6. **Escuela de Familia y Longevidad**: invitación a la landing de la Escuela.
7. **El futuro también se lee. Y se conversa.**: La Chispa (enlace a la página y al podcast en YouTube) y el newsletter El Futuro tiene Canas, separados. El botón «Suscríbete a nuestro newsletter» explica que la suscripción está en preparación y no registra correos.
8. **Experiencia**: cinco intervenciones tomadas del brief, sin cifras, logos ni fotos de clientes.
9. **Un solo formulario de contacto**, con cuatro opciones de interés, la del enlace de origen ya preseleccionada (`/?interes=studio#contacto`). Pide nombre, organización y correo, y el reto es opcional (recomendado si eligen «Aún no lo tengo claro»). No pide teléfono. Los errores son accesibles y el botón abre el correo con un resumen; el sitio no guarda ni envía datos.
10. Firma **«Más vida. Más futuro.»** y footer con las secciones y los cuatro enlaces legales.

Se quitaron de la home el diagnóstico «punto de partida», el manifiesto con desenfoque al hacer scroll, el bloque de preguntas frecuentes y las numeraciones `01 / 07`.

### Páginas internas
- **`/soluciones`**: H1 y bajada del brief, navegación por anclas y una sección por solución, cada una con pregunta, H2, cuerpo, servicios agrupados, «Cuándo contratarla», «Qué recibes», «Experiencia» y un botón que abre el formulario con su interés preseleccionado. Cierra con «Hablemos de tu proyecto».
- **`/ecosistema`**: mapa con Vasees, las tres soluciones, las tres plataformas y el eje transversal (impacto como resultado, no como entidad); cómo conversan las partes; las cuatro puertas «¿Cómo participar?»; y un bloque aparte de organizaciones como relaciones externas.
- **`/escuela`**: se llama **Escuela de Familia y Longevidad** en todo el sitio, también en Mi Escuela y la administración. El hero responde «¿Para quién es?» y el botón «Explora lo que puedes aprender» lleva a `#intereses`, donde hay cinco rutas temáticas que filtran el catálogo. Todos los cursos aparecen como «Próximamente · Muestra». Hay un bloque de «propuesta educativa» que dice que no hay membresía ni pagos abiertos, cuatro preguntas frecuentes y un cierre «Explorar cursos». Se quitó «Conversemos sobre la Escuela».
- **La Chispa**: se suma el bloque del newsletter y se quitan los números decorativos.
- **Páginas legales**: marcadas como *Pendiente de revisión jurídica* (`LEGAL_REVIEW_REQUIRED`). Solo dicen lo que es verificable hoy (no hay formularios almacenados, analítica ni pagos) y listan el índice que tendrá el documento aprobado. No hay texto jurídico inventado.
- Los cierres de las páginas internas llevan al formulario único en vez de abrir otro correo.

### Sistema visual y accesibilidad
- Se ocultan las etiquetas «Imagen conceptual».
- Tamaños mínimos: cuerpo de 17 a 19 px, secundarios de 15 a 16 px, etiquetas de 14 px, botones de 16 px con al menos 44 × 52 px; las migas de pan pasaron de 8 a 14 px.
- Contenido centralizado en `src/content/solutions.ts`, `home.ts`, `legal.ts` y `school.ts`, con la configuración de iniciativas que pide el brief (`initiativeConfig`).
- Kánna queda con `publicEnabled: false`: no se enlaza desde la home, el ecosistema ni soluciones, aunque su URL directa sigue existiendo.
- Se corrigieron tres nombres accesibles que no coincidían con el texto visible (control de la flor, póster del podcast y fotografía de la campaña) y el alt redundante de los retratos de invitados.

## Pruebas
| Suite | Resultado |
|---|---|
| `npm run build` (TypeScript, Vite y prerender de 37 rutas) | OK |
| `smoke` (home, formulario, newsletter, legales, redirecciones, 3 anchos) | 44 comprobaciones |
| `smoke:pages` (11 páginas × 3 anchos y la vista previa offline) | 128 comprobaciones |
| `smoke:school` (Escuela pública, Mi Escuela y CMS) | 175 comprobaciones, 44 escaneos axe |
| `smoke:brands` | 58 comprobaciones, 8 escaneos axe |
| `smoke:flower` | 31 comprobaciones |
| `smoke:podcast` | 39 comprobaciones, 2 escaneos axe |
| Auditoría: 11 rutas × 320/390/768/1280/1440/1600 px | Sin desbordes, un H1 por página, sin violaciones axe (WCAG 2.1 A/AA y buenas prácticas), sin textos por debajo de 14 px ni objetivos por debajo de 24 px |

Las suites se actualizaron para comprobar la estructura nueva: orden de la home, un solo botón en el hero, tres tarjetas en una fila, preselección del interés, errores del formulario, legales, redirecciones y que Kánna no aparezca.

## Pendientes para la dirección (no se inventaron)
- Confirmar si cada organización es cliente o aliada; solo Fundación Provida Colombia figura como cliente según el brief. Faltan logos autorizados.
- Validar el dato de Colombia con el DANE antes de publicarlo.
- URL real del newsletter y del proveedor de envío.
- Textos legales aprobados para las cuatro páginas.
- Oferta de la Escuela: cursos activos, membresía, precio, video explicativo y videos de docentes.
- Foto grupal autorizada para la Escuela; por ahora se mantiene la de Mateo y Melissa, sin modificar caras.
- Autorización para publicar Kánna.
- Destino real del contacto (CRM o backend); hoy funciona con mailto.
