import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "5177",
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "",
  browser,
  checks = 0;
server.stdout.on("data", (data) => (logs += data.toString()));
server.stderr.on("data", (data) => (logs += data.toString()));
const ok = (value, message) => {
  assert.ok(value, message);
  checks++;
};
const base = "http://127.0.0.1:5177";
try {
  for (let i = 0; i < 100 && !/Local/.test(logs); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  ok(/Local/.test(logs), "Production preview starts");
  await mkdir(".qa", { recursive: true });
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [],
    submissions = [],
    audits = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (request.method() !== "GET")
      submissions.push(`${request.method()} ${request.url()}`);
  });
  const button = (name) => page.getByRole("button", { name, exact: true });
  const link = (name) =>
    page.locator(".vp-sidebar").getByRole("link", { name, exact: true });
  const shot = (name) =>
    page.screenshot({ path: `.qa/portal-${name}.png`, fullPage: true });
  const label = (name) => page.getByLabel(name, { exact: true });
  async function audit(name, width) {
    await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
    const results = await page.evaluate(() =>
      axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
    );
    audits.push({
      name,
      width,
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
    await writeFile(
      ".qa/portal-accessibility.json",
      JSON.stringify(audits, null, 2),
    );
  }
  const html = await (await fetch(`${base}/escuela/`)).text();
  ok(
    html.includes("school-landing-hero") &&
      html.includes("school-mateo-melissa.webp") &&
      !html.includes("vp-student-welcome"),
    "Direct School document renders its public landing",
  );
  for (const route of ['/escuela/inicio', '/admin', '/escuela/perfil', '/admin/contenido']) {
    const source = await (await fetch(`${base}${route}`)).text();
    ok(source.includes('vp-auth-art') && !source.includes('class="hero"'), `${route}: direct clean URL serves its own access document`);
  }
  await page.goto(base, { waitUntil: "networkidle" });
  ok(
    (await page
      .locator(".nav-links")
      .getByRole("link", { name: "Insights", exact: true })
      .count()) === 0 && (await page.locator("#insights").count()) === 1,
    "Insights remains only on the home",
  );
  await page
    .locator(".nav-links")
    .getByRole("link", { name: "Escuela", exact: true })
    .click();
  ok(
    await page.locator(".school-landing-hero").isVisible(),
    "School navigation opens the public landing",
  );
  ok(await page.locator('.site-header').isVisible(), 'Public School keeps the website header');
  ok(await page.locator('.school-catalog-grid article').count() === 4, 'Public School shows published courses only');
  await page.locator('.school-categories').getByRole('button', { name: 'Tecnología', exact: true }).click();
  ok(await page.locator('.school-catalog-grid article').count() === 1, 'Public course category filter works');
  await page.locator('.school-categories').getByRole('button', { name: 'Todos', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar cursos', exact: true }).fill('tecnologia');
  ok(await page.locator('.school-catalog-grid article').count() === 1, 'Public course search ignores accents');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  const publicPreview = page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Cuidar sin dejar de vivir', exact: true });
  await publicPreview.click();
  const video = page.locator('.school-course-dialog video');
  await video.evaluate(element => element.play());
  await page.waitForFunction(() => document.querySelector('.school-course-dialog video').currentTime > 0.2);
  ok(await video.evaluate(element => element.duration > 9 && element.duration < 11), 'Public trailer is a playable ten-second demo');
  await video.evaluate(element => element.pause());
  ok(await page.locator('.school-course-dialog').getByRole('button', { name: 'Marcar como completada' }).count() === 0, 'Public preview does not expose classroom progress controls');
  await page.keyboard.press('Escape');
  ok(await publicPreview.evaluate(element => element === document.activeElement), 'Closing public preview restores focus');
  await page.locator('.header-cta').click();
  ok(await page.locator('.vp-auth-form').isVisible(), 'School header login opens the account access');
  await label("Contraseña de muestra").fill("demo-1234");
  await button("Mostrar contraseña").click();
  ok(
    (await label("Contraseña de muestra").getAttribute("type")) === "text",
    "Password visibility toggles",
  );
  await button("Entrar a mi Escuela").click();
  await label("Código de 6 dígitos").fill("999999");
  await button("Confirmar y continuar").click();
  ok(
    await page.getByRole("alert").isVisible(),
    "Wrong code has an error state",
  );
  await button("Solicitar otro código").click();
  ok(
    (await page.getByRole("status").innerText()).includes(
      "No enviamos correos",
    ),
    "Code request is honestly simulated",
  );
  await label("Código de 6 dígitos").fill("123456");
  await button("Confirmar y continuar").click();
  ok(
    await page.locator(".vp-student-welcome").isVisible(),
    "Valid demo code opens the student dashboard",
  );
  await shot("student-1440");
  await link("Explorar cursos").click();
  ok(
    (await page.locator(".vp-course-card").count()) === 4,
    "Only published courses appear in student catalog",
  );
  await button("Tecnología").click();
  ok(
    (await page.locator(".vp-course-card").count()) === 1,
    "Category filters courses",
  );
  await button("Todos").click();
  await page
    .getByRole("searchbox", { name: "Buscar cursos", exact: true })
    .fill("tecnologia");
  ok(
    (await page.locator(".vp-course-card").count()) === 1,
    "Search ignores accents",
  );
  await page
    .getByRole("searchbox", { name: "Buscar cursos", exact: true })
    .fill("sin coincidencias");
  ok(await page.locator(".vp-empty").isVisible(), "Search has an empty state");
  await button("Ver todos los cursos").click();
  await page
    .locator(".vp-course-card")
    .filter({ hasText: "Tecnología que nos acerca" })
    .getByRole("button", { name: "Ver curso" })
    .click();
  await page.locator("dialog[open]").waitFor();
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  ok(
    await page
      .locator("dialog[open]")
      .evaluate((dialog) => dialog.contains(document.activeElement)),
    "Course modal contains keyboard focus",
  );
  await button("Continuar al pago de prueba").click();
  ok(
    (await label("Número de tarjeta de prueba").getAttribute("readonly")) !==
      null,
    "Checkout cannot collect real card data",
  );
  await button("PSE").click();
  ok(
    await label("Banco de demostración").isVisible(),
    "PSE has a demo bank selector",
  );
  await button("Tarjeta").click();
  await label("Resultado de prueba").selectOption("Rechazado");
  await label("Entiendo que este es un pago simulado.").check();
  await button("Simular pago").click();
  await page.getByRole("alert").waitFor();
  ok(
    (await page.getByRole("alert").innerText()).includes("rechazado"),
    "Rejected sample payment can be retried",
  );
  await label("Resultado de prueba").selectOption("Aprobado");
  await shot("checkout-1440");
  await button("Simular pago").click();
  await page.locator(".vp-payment-success").waitFor();
  ok(
    (await page.locator(".vp-payment-success").innerText()).includes(
      "No se ha realizado ningún cobro",
    ),
    "Success discloses no real charge",
  );
  await button("Ir a mi curso").click();
  ok(
    (await page.locator(".vp-lesson-sidebar").innerText()).includes("0 de 3"),
    "Checkout enrolls the course in the demo",
  );
  for (let i = 0; i < 3; i++) {
    await button("Marcar como completada").click();
    if (i < 2) await button("Siguiente lección").click();
  }
  ok(
    (await page.locator(".vp-lesson-sidebar").innerText()).includes("3 de 3"),
    "Lesson progress completes in memory",
  );
  await button("Mis notas").click();
  await label("Mis notas de esta vista").fill(
    "Una conversación para compartir.",
  );
  await button("Guardar nota de muestra").click();
  await shot("classroom-1440");
  await link("Mis cursos").click();
  ok(
    (await page.locator(".vp-course-card").count()) === 3,
    "New course appears in My courses",
  );
  await link("Explorar cursos").click();
  await page
    .locator(".vp-course-card")
    .filter({ hasText: "Un propósito que sigue creciendo" })
    .getByRole("button", { name: "Ver curso" })
    .click();
  await button("Añadir a mis cursos").click();
  ok(
    await page.locator(".vp-classroom").isVisible(),
    "Free course enrolls without checkout",
  );
  await link("Mi perfil").click();
  await label("Nombre completo").fill("Laura de la Escuela");
  await label("Ciudad").fill("Bogotá");
  await button("Guardar datos de muestra").click();
  await button("Preferencias").click();
  await page.getByLabel("El Futuro tiene Canas", { exact: false }).check();
  await button("Guardar preferencias").click();
  await link("Mi inicio").click();
  ok(
    (await page
      .locator(".vp-sidebar .vp-sidebar-bottom strong")
      .innerText()) === "Laura de la Escuela",
    "Profile name updates throughout the app",
  );
  await link("Mi perfil").click();
  ok(
    (await label("Ciudad").inputValue()) === "Bogotá",
    "Profile city survives navigation",
  );
  await button("Preferencias").click();
  ok(
    await page
      .getByLabel("El Futuro tiene Canas", { exact: false })
      .isChecked(),
    "Preferences survive navigation",
  );
  await button("Acceso").click();
  ok(
    (await page.locator(".vp-security-row").first().innerText()).includes(
      "Por conectar",
    ),
    "Account security is marked pending",
  );
  await link("Mis pagos").click();
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 2,
    "Payment history includes sample checkout",
  );
  await page.locator(".vp-table-action").first().click();
  ok(
    (await page.locator("dialog[open]").innerText()).includes(
      "Sin validez fiscal",
    ),
    "Receipt has a demo disclaimer",
  );
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    history.pushState({}, "", "/admin");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  ok(
    await page.locator(".vp-access-preview").isVisible(),
    "Student view requires an explicit switch to admin demo",
  );
  await button("Ver demo admin").click();
  ok(
    await page.locator(".vp-admin-intro").isVisible(),
    "Explicit switch opens admin demo",
  );
  await shot("admin-1440");
  await link("Cursos").click();
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 6,
    "Admin sees published and draft courses",
  );
  await button("Crear curso").click();
  await label("Título del curso").fill("Conversaciones que abren futuro");
  await label("Descripción").fill(
    "Un curso de muestra para aprender a escuchar entre generaciones.",
  );
  await label("Valor de muestra en COP").fill("45000");
  await button("Lecciones").click();
  await button("Añadir lección").click();
  await label("Título de la lección 2").fill("Escuchar de otra manera");
  await label("Contenido de la lección 2").fill(
    "Escuchar es abrir espacio para una experiencia diferente.",
  );
  await button("Subir lección 2").click();
  ok(
    (await label("Título de la lección 1").inputValue()) ===
      "Escuchar de otra manera",
    "Admin can reorder lessons",
  );
  await button("Vista previa").click();
  ok(
    (await page.locator("dialog[open]").innerText()).includes(
      "Conversaciones que abren futuro",
    ),
    "Course preview reflects edits",
  );
  await page.keyboard.press("Escape");
  await button("Publicar en la demo").click();
  ok(
    (await page.getByRole("status").innerText()).includes(
      "publicado en el catálogo",
    ),
    "Publishing feedback is accurate",
  );
  await button("Ver demo estudiante").click();
  await link("Explorar cursos").click();
  ok(
    (await page
      .locator(".vp-course-card")
      .filter({ hasText: "Conversaciones que abren futuro" })
      .count()) === 1,
    "Admin publication updates student catalog",
  );
  await button("Ver demo admin").click();
  await link("Cursos").click();
  await button("Duplicar Conversaciones que abren futuro").click();
  ok(
    (await page
      .locator(".vp-table tbody tr")
      .filter({ hasText: "Copia" })
      .count()) === 1,
    "Duplicate creates an independent draft",
  );
  await button("Archivar Conversaciones que abren futuro · Copia").click();
  await label("Estado").selectOption("Archivado");
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 1,
    "Archive filter works",
  );
  await button("Recuperar Conversaciones que abren futuro · Copia").click();
  ok(
    await page.locator(".vp-empty").isVisible(),
    "Recovering removes course from archive filter",
  );
  await link("Páginas y contenido").click();
  ok(
    (await page.locator(".vp-page-card").count()) === 10,
    "CMS covers all public pages, excluding access forms",
  );
  await page
    .locator(".vp-page-card")
    .first()
    .getByRole("button", { name: "Editar contenido" })
    .click();
  await label("Título de la página").fill("Un futuro que construimos juntos.");
  await button("Añadir sección").click();
  await label("Título de la sección 4").fill("Una nueva mirada");
  await label("Texto de la sección 4").fill(
    "Todo empieza con una conversación.",
  );
  await button("Vista previa de contenido").click();
  ok(
    (await page.locator("dialog[open]").innerText()).includes(
      "Un futuro que construimos juntos.",
    ),
    "CMS preview shows changed text",
  );
  await shot("cms-preview-1440");
  await page.keyboard.press("Escape");
  await button("Guardar en la demo").click();
  await page
    .locator(".vp-page-card")
    .first()
    .getByRole("button", { name: "Editar contenido" })
    .click();
  ok(
    (await label("Título de la página").inputValue()) ===
      "Un futuro que construimos juntos.",
    "CMS edits survive navigation",
  );
  await link("Biblioteca de medios").click();
  await label("Archivo para la biblioteca de muestra").setInputFiles({
    name: "portada-demo.png",
    mimeType: "image/png",
    buffer: await readFile("public/images/vasees-logo.png"),
  });
  ok(
    (await page
      .locator(".vp-media-card")
      .filter({ hasText: "portada-demo.png" })
      .count()) === 1,
    "Local upload appears in media library",
  );
  await page
    .locator(".vp-media-card")
    .filter({ hasText: "portada-demo.png" })
    .click();
  await button("Quitar de la demo").click();
  ok(
    (await page
      .locator(".vp-media-card")
      .filter({ hasText: "portada-demo.png" })
      .count()) === 0,
    "Local media can be removed",
  );
  await link("Personas y acceso").click();
  await button("Simular invitación").click();
  await label("Nombre de muestra").fill("Persona de prueba");
  await label("Correo de muestra").fill("prueba@example.com");
  await button("Crear invitación de muestra").click();
  ok(
    (await page.getByRole("status").innerText()).includes(
      "No se envió ningún correo",
    ),
    "User invitation sends no email",
  );
  await link("Pagos de muestra").click();
  await label("Estado").selectOption("Rechazado");
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 1,
    "Admin can filter rejected payments",
  );
  await link("Correos y códigos").click();
  await label("Asunto del correo").fill("Una nueva pregunta, {nombre}");
  await button("Guardar plantilla de muestra").click();
  await button("Previsualizar").click();
  ok(
    (await page.locator("dialog[open]").innerText()).includes(
      "Una nueva pregunta, Laura",
    ),
    "Mail preview resolves sample variables",
  );
  await shot("resend-preview-1440");
  await page.keyboard.press("Escape");
  ok(
    (await page.locator(".vp-provider-card").innerText()).includes(
      "Sin conectar",
    ),
    "Resend is marked unconnected",
  );
  await link("Configuración").click();
  await button("Navegación").click();
  await label("Etiqueta 1").fill("Nuestras soluciones");
  await button("Guardar configuración de muestra").click();
  ok(
    (await page.locator(".vp-menu-preview").innerText()).includes(
      "Nuestras soluciones",
    ),
    "Navigation preview updates",
  );
  await button("Acceso e integraciones").click();
  ok(
    (await page.locator(".vp-integration-list .vp-badge").count()) === 4,
    "Settings lists pending integrations",
  );
  await button("Cerrar sesión de demostración").click();
  await page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await button("Ver paso de recuperación").click();
  await label("Código de 6 dígitos").fill("123456");
  await button("Confirmar y continuar").click();
  await label("Nueva contraseña de muestra").fill("sample-password");
  await button("Simular nueva contraseña").click();
  ok(
    (await page.getByRole("status").innerText()).includes(
      "No se guardó ninguna contraseña",
    ),
    "Recovery stores no password",
  );
  await page.getByRole("link", { name: "Crea tu cuenta", exact: true }).click();
  await label("Tu nombre").fill("Camila de muestra");
  await label("Contraseña de muestra").fill("sample-password");
  await label("Entiendo que estoy explorando una cuenta de muestra.").check();
  await button("Crear perfil de muestra").click();
  await label("Código de 6 dígitos").fill("123456");
  await button("Confirmar y continuar").click();
  ok(
    (await page.locator("h1").innerText()).includes("Camila"),
    "Registration opens the named demo profile",
  );
  await page.reload({ waitUntil: "networkidle" });
  ok(
    await page.locator(".vp-auth-form").isVisible(),
    "Refresh resets the demo session",
  );
  ok(
    await page.evaluate(
      () => localStorage.length === 0 && sessionStorage.length === 0,
    ),
    "No browser storage is used",
  );

  const layouts = [
    ["Mi inicio", "student-home"],
    ["Explorar cursos", "catalog"],
    ["Mis cursos", "library"],
    ["Mi perfil", "profile"],
    ["Mis pagos", "student-payments"],
    ["Resumen", "admin-home"],
    ["Cursos", "courses"],
    ["Páginas y contenido", "pages"],
    ["Biblioteca de medios", "media"],
    ["Personas y acceso", "users"],
    ["Pagos de muestra", "payments"],
    ["Correos y códigos", "messages"],
    ["Configuración", "settings"],
  ];
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${base}/escuela/ingresar`, { waitUntil: "networkidle" });
    await shot(`login-${width}`);
    await audit("Login", width);
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Login ${width}: no overflow`,
    );
    await button("Vista estudiante").click();
    for (let i = 0; i < layouts.length; i++) {
      const [name, slug] = layouts[i];
      if (i === 5) {
        if (width <= 900) await button("Abrir menú de la plataforma").click();
        await button("Ver demo admin").click();
      }
      if (width <= 900) {
        await button("Abrir menú de la plataforma").click();
        await page
          .locator(".vp-mobile-nav")
          .getByRole("link", { name, exact: true })
          .click();
      } else await link(name).click();
      ok(
        (await page.locator("h1").count()) === 1,
        `${name} ${width}: single heading`,
      );
      ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth === innerWidth,
        ),
        `${name} ${width}: no document overflow`,
      );
      if (width !== 768) {
        await shot(`${slug}-${width}`);
        await audit(name, width);
      }
    }
    async function openWorkspace(name) {
      if (width <= 900) {
        await button("Abrir menú de la plataforma").click();
        await page
          .locator(".vp-mobile-nav")
          .getByRole("link", { name, exact: true })
          .click();
      } else await link(name).click();
    }
    await openWorkspace("Cursos");
    await page.locator(".vp-row-actions button").first().click();
    await shot(`course-editor-${width}`);
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Course editor ${width}: no overflow`,
    );
    if (width !== 768) await audit("Editor de curso", width);
    await button("Lecciones").click();
    ok(
      await label("Título de la lección 1").isVisible(),
      `Course lessons ${width}: fields accessible`,
    );
    await openWorkspace("Páginas y contenido");
    await page
      .locator(".vp-page-card")
      .first()
      .getByRole("button", { name: "Editar contenido" })
      .click();
    await shot(`page-editor-${width}`);
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Page editor ${width}: no overflow`,
    );
    if (width !== 768) await audit("Editor de página", width);
    if (width <= 900) await button("Abrir menú de la plataforma").click();
    await button("Ver demo estudiante").click();
    await openWorkspace("Mis cursos");
    await page
      .locator(".vp-course-card")
      .first()
      .getByRole("button", { name: "Continuar" })
      .click();
    await shot(`classroom-${width}`);
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Classroom ${width}: no overflow`,
    );
    if (width !== 768) await audit("Aula", width);
    await openWorkspace("Explorar cursos");
    await page
      .locator(".vp-course-card")
      .filter({ hasText: "Tecnología que nos acerca" })
      .getByRole("button", { name: "Ver curso" })
      .click();
    if (width !== 768) await audit("Ficha de curso", width);
    await button("Continuar al pago de prueba").click();
    await shot(`checkout-${width}`);
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Checkout ${width}: no overflow`,
    );
    if (width !== 768) await audit("Pago de muestra", width);
    await button("Cerrar sesión de demostración").click();
  }
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${base}/escuela/`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const image of await page.locator('main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(element => element.decode()); }
    await page.evaluate(() => scrollTo(0, 0));
    await shot(`public-school-${width}`);
    ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `Public landing ${width}: no document overflow`);
    await audit('Landing pública de Escuela', width);
    await page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Tecnología que nos acerca', exact: true }).click();
    if (width !== 768) { await shot(`public-trailer-${width}`); await audit('Tráiler público', width); }
    await page.keyboard.press('Escape');
  }
  await page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Tecnología que nos acerca', exact: true }).click();
  await button('Ingresar para continuar').click();
  await label('Contraseña de muestra').fill('demo-1234');
  await button('Entrar a mi Escuela').click();
  await label('Código de 6 dígitos').fill('123456');
  await button('Confirmar y continuar').click();
  ok(page.url().endsWith('/escuela/pago') && (await page.locator('.vp-order-summary').innerText()).includes('Tecnología que nos acerca'), 'Login continues to the selected public course');
  await page.evaluate(() => { history.pushState({}, '', '/escuela'); dispatchEvent(new PopStateEvent('popstate')); });
  ok(await page.locator('.school-landing-hero').isVisible(), 'Landing stays public for signed-in demo visitors');
  await page.locator('.header-cta').click();
  ok(page.url().endsWith('/escuela/inicio') && await page.locator('.vp-student-welcome').isVisible(), 'My School links to its own student dashboard');
  await writeFile(
    ".qa/portal-accessibility.json",
    JSON.stringify(audits, null, 2),
  );
  ok(
    audits.every((item) => !item.violations.length),
    "No automated WCAG A/AA violations",
  );
  ok(
    errors.length === 0,
    `No browser or hydration errors: ${errors.join("; ")}`,
  );
  ok(
    submissions.length === 0,
    `No credential, payment, email or upload network submissions: ${submissions.join("; ")}`,
  );
  await writeFile(
    ".qa/school-test-results.json",
    JSON.stringify(
      {
        passed: checks,
        errors,
        submissions,
        viewports: [1440, 768, 390],
        audits: audits.length,
      },
      null,
      2,
    ),
  );
  console.log(
    `${checks} School and CMS checks passed; ${audits.length} accessibility scans.`,
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
