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
  ok((await page.locator('.school-hero-name').innerText()) === 'Escuela de Familia y Longevidad' && (await page.locator('.school-audience h2').innerText()) === '¿Para quién es?', 'School hero names the School and who it is for');
  ok((await page.locator('.school-hero-actions a').getAttribute('href')) === '#intereses', 'School hero leads to the interest routes');
  ok((await page.locator('.school-routes button').count()) === 5, 'School offers five interest routes');
  ok((await page.getByText('Conversemos sobre la Escuela').count()) === 0 && (await page.locator('.school-faq details').count()) <= 5, 'School has a short FAQ and no sales call');
  ok((await page.locator('.school-closing a').getAttribute('href')) === '#intereses', 'School closing points to the courses');
  const techRoute = page.locator('.school-routes').getByRole('button', { name: /^Tecnología y vida cotidiana/ });
  await techRoute.click();
  ok(await page.locator('.school-catalog-grid article').count() === 1 && await techRoute.getAttribute('aria-pressed') === 'true', 'Public interest route filter works');
  await techRoute.click();
  await page.locator('.school-routes').getByRole('button', { name: /^Mi propia longevidad/ }).click();
  ok((await page.locator('.school-empty h3').innerText()) === 'Esta ruta llegará pronto.', 'A route without courses says it is coming soon');
  await page.locator('.school-empty').getByRole('button', { name: 'Ver todos los cursos' }).click();
  await page.getByRole('searchbox', { name: 'Buscar cursos', exact: true }).fill('tecnologia');
  ok(await page.locator('.school-catalog-grid article').count() === 1, 'Public course search ignores accents');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  const publicPreview = page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Cuidar sin dejar de vivir (próximamente)', exact: true });
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
  ok(
    (await page.locator(".vp-goal-invite").innerText()).includes(
      "Definir mi meta",
    ),
    "Dashboard invites to set a personal goal",
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
  ok(
    (await page.locator("dialog[open] .vp-preview-price").innerText()).includes(
      "Incluido en tu membresía",
    ),
    "Courses are included in the membership, with no per-course price",
  );
  await button("Añadir a mis cursos").click();
  ok(
    (await page.locator(".vp-lesson-sidebar").innerText()).includes("0 de 3"),
    "A member adds a course straight to the classroom",
  );
  for (let i = 0; i < 3; i++) {
    await button("Marcar como completada").click();
    if (i < 2) await button("Siguiente lección").click();
  }
  ok(
    (await page.locator(".vp-lesson-sidebar").innerText()).includes("3 de 3"),
    "Lesson progress completes in memory",
  );
  await button("Test").click();
  ok(
    (await page.locator(".vp-test-locked").innerText()).includes(
      "se abre después del anterior",
    ),
    "Lesson tests unlock in order while lessons stay open",
  );
  await button("Ir al test de la lección 1").click();
  await page.getByLabel("Una lista de todas sus funciones", { exact: true }).check();
  await button("Comprobar respuesta").click();
  ok(
    (await page.locator(".vp-test [role=status]").innerText()).includes(
      "Esa no es la respuesta",
    ),
    "A wrong test answer can be retried",
  );
  const answers = [
    "Algo que queremos hacer con ella",
    "Explicar un paso y dejar que lo pruebe a su ritmo",
    "Reconocer una duda y consultar una fuente de confianza también es aprender",
  ];
  for (let i = 0; i < answers.length; i++) {
    await page.getByLabel(answers[i], { exact: true }).check();
    await button("Comprobar respuesta").click();
    if (i < answers.length - 1) await button("Siguiente test").click();
  }
  ok(
    (await page.locator(".vp-badge-earned").isVisible()) &&
      (await page.locator(".vp-lesson-sidebar").innerText()).includes(
        "Insignia obtenida",
      ),
    "Passing every test in order earns the badge",
  );
  await audit("Insignia y test", 1440);
  await button("Valorar").click();
  await button("Enviar valoración de muestra").click();
  ok(
    (await page.locator(".vp-review [role=alert]").innerText()).includes(
      "estrellas",
    ),
    "Review asks for a rating",
  );
  await page.getByLabel("4 estrellas", { exact: true }).check();
  await page.getByLabel("Tu opinión (opcional)", { exact: true }).fill(
    "Me sirvió para acompañar a mi mamá.",
  );
  await page
    .getByLabel(/Autorizo que Vasees use mi valoración/)
    .check();
  await button("Enviar valoración de muestra").click();
  await audit("Valoración", 1440);
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
  await button("Mis insignias").click();
  ok(
    (await page.locator(".vp-badge-list li").count()) === 1,
    "Profile lists the earned badge",
  );
  await button("Mis datos").click();
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
  await link("Mi membresía").click();
  const card = page.locator(".vp-membership-card");
  ok(
    (await card.innerText()).includes("Activa") &&
      (await card.innerText()).includes("Se renueva el"),
    "Membership shows plan, status and renewal date",
  );
  await audit("Mi membresía", 1440);
  await button("Cambiar al plan anual desde el próximo periodo").click();
  ok(
    (await card.innerText()).includes("490.000 (plan anual)"),
    "A plan change applies from the next period",
  );
  await button("Simular fin del periodo").click();
  ok(
    (await card.locator("h2").innerText()) === "Plan anual",
    "Approved renewal starts the new period with the new plan",
  );
  await page.getByLabel("Resultado del próximo cobro", { exact: true }).selectOption("Rechazado");
  await button("Simular fin del periodo").click();
  ok(
    (await card.innerText()).includes("No pudimos cobrar la renovación") &&
      (await card.innerText()).includes("Pago pendiente"),
    "A rejected renewal leaves the payment pending with access",
  );
  await audit("Pago pendiente", 1440);
  await button("Reintentar el pago").click();
  ok(
    (await card.locator(".vp-form-error").innerText()).includes("rechazado otra vez"),
    "A failed retry explains what happened",
  );
  await page.getByLabel("Resultado del próximo cobro", { exact: true }).selectOption("Aprobado");
  await button("Reintentar el pago").click();
  ok(
    (await card.locator(".vp-badge").innerText()) === "Activa",
    "A successful retry reactivates the membership",
  );
  await button("Cancelar la renovación").click();
  await page.getByLabel("No tengo tiempo para aprovecharla", { exact: true }).check();
  await audit("Cancelar renovación", 1440);
  await button("Confirmar cancelación").click();
  ok(
    (await card.innerText()).includes("Mantienes el acceso hasta el"),
    "Cancelling the renewal keeps access until the end of the period",
  );
  await button("Reactivar la renovación").click();
  ok(
    (await card.locator(".vp-badge").innerText()) === "Activa",
    "The renewal can be reactivated before the period ends",
  );
  await button("Cancelar la renovación").click();
  await button("Confirmar cancelación").click();
  await button("Simular fin del periodo").click();
  ok(
    (await page.locator("h1").innerText()) === "Vuelve cuando quieras." &&
      (await page.locator(".vp-membership-alert").innerText()).includes("venció"),
    "The membership expires after a cancelled period",
  );
  await audit("Membresía vencida", 1440);
  for (const area of ["Encuentros", "Comunidad"]) {
    await link(area).click();
    ok(
      (await page.locator(".vp-membership-gate h1").innerText()) === "Tu membresía venció.",
      `${area} is limited after expiry`,
    );
  }
  await link("Mis cursos").click();
  await page.locator(".vp-course-card").first().getByRole("button", { name: "Continuar" }).click();
  ok(
    await page.locator(".vp-membership-gate").isVisible(),
    "The classroom is limited after expiry",
  );
  await audit("Acceso limitado", 1440);
  await link("Mi perfil").click();
  ok(
    await label("Nombre completo").isVisible(),
    "The profile stays available after expiry",
  );
  await link("Mi membresía").click();
  await button("Elegir plan mensual").click();
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
  await audit("Pago de membresía", 1440);
  await button("Simular pago").click();
  await page.locator(".vp-payment-success").waitFor();
  ok(
    (await page.locator(".vp-payment-success").innerText()).includes(
      "No se ha realizado ningún cobro",
    ),
    "Success discloses no real charge",
  );
  await link("Encuentros").click();
  ok(
    (await page.locator(".vp-encuentro").count()) === 3,
    "Reactivation restores encuentros",
  );
  await link("Mis pagos").click();
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 7 &&
      (await page.locator(".vp-table tbody").innerText()).includes("Plan anual"),
    "Payment history lists every simulated membership charge",
  );
  await page.locator(".vp-table-action").first().click();
  ok(
    (await page.locator("dialog[open]").innerText()).includes(
      "Sin validez fiscal",
    ),
    "Receipt has a demo disclaimer",
  );
  await page.keyboard.press("Escape");
  await link("Encuentros").click();
  ok(
    (await page.locator(".vp-encuentro").count()) === 3,
    "Students see published encuentros only",
  );
  ok(
    await page
      .locator(".vp-encuentro")
      .filter({ hasText: "Historias entre generaciones" })
      .locator("button")
      .evaluate((el) => el.disabled && el.textContent.startsWith("Sin cupos disponibles")),
    "A full encuentro cannot take more registrations",
  );
  await page
    .getByRole("button", { name: "Inscribirme: Conversación abierta: cuidar sin dejar de vivir" })
    .click();
  ok(
    (await page.locator(".vp-encuentro").first().innerText()).includes(
      "13 de 40 cupos",
    ),
    "Registration takes a seat",
  );
  await page.locator(".vp-calendar-menu summary").click();
  const calendarLinks = await page
    .locator(".vp-calendar-menu a")
    .evaluateAll((links) => links.map((a) => a.href));
  ok(
    calendarLinks.length === 4 &&
      calendarLinks[0].startsWith("https://calendar.google.com/") &&
      calendarLinks[0].includes("dates=20261203T230000Z%2F20261204T003000Z") &&
      calendarLinks[1].startsWith("https://outlook.live.com/calendar/0/deeplink/compose") &&
      calendarLinks[1].includes("startdt=2026-12-03T23%3A00%3A00.000Z") &&
      calendarLinks[2].startsWith("https://outlook.office.com/") &&
      calendarLinks[3].startsWith("https://calendar.yahoo.com/") &&
      calendarLinks[3].includes("st=20261203T230000Z"),
    "Calendar links carry the encuentro time in UTC for Google, Outlook, Microsoft 365 and Yahoo",
  );
  ok(
    await page
      .locator(".vp-calendar-menu a")
      .evaluateAll((links) =>
        links.every((a) => a.target === "_blank" && a.rel.includes("noopener")),
      ),
    "Calendar links open safely in a new tab",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    button("Descargar archivo .ics").click(),
  ]);
  const ics = await readFile(await download.path(), "utf8");
  ok(
    download.suggestedFilename() === "conversacion-abierta-cuidar-sin-dejar-de-vivir.ics" &&
      ics.startsWith("BEGIN:VCALENDAR\r\n") &&
      ics.includes("DTSTART:20261203T230000Z\r\n") &&
      ics.includes("DTEND:20261204T003000Z\r\n") &&
      ics.includes("SUMMARY:Conversación abierta: cuidar sin dejar de vivir") &&
      ics.split("\r\n").every((line) => Buffer.byteLength(line) <= 75),
    "The .ics file is a valid calendar event",
  );
  await audit("Encuentros", 1440);
  await page.getByRole("button", { name: /^Mis encuentros/ }).click();
  ok(
    (await page.locator(".vp-encuentro").count()) === 1,
    "My encuentros lists the registration",
  );
  await link("Comunidad").click();
  ok(
    (await page.locator(".vp-thread-list li").count()) === 3,
    "Community lists the forum conversations",
  );
  await page.getByLabel("Foro", { exact: true }).selectOption("generaciones-que-se-encuentran");
  ok(
    (await page.locator(".vp-thread-list li").count()) === 1,
    "Forum filter shows one course forum",
  );
  await page.getByLabel("Foro", { exact: true }).selectOption("todos");
  await page.locator(".vp-heading-actions").getByRole("button", { name: "Abrir una conversación" }).click();
  await button("Publicar conversación").click();
  ok(
    await page.locator("dialog[open] [role=alert]").isVisible(),
    "A new conversation needs a title and a message",
  );
  await page.locator("dialog[open]").getByLabel("Título", { exact: true }).fill("¿Qué libro les ayudó a cuidar?");
  await page.locator("dialog[open]").getByLabel("Tu mensaje", { exact: true }).fill("Busco lecturas cortas sobre cuidado compartido.");
  await audit("Abrir conversación", 1440);
  await button("Publicar conversación").click();
  ok(
    page.url().endsWith("/escuela/conversacion") &&
      (await page.locator("h1").innerText()) === "¿Qué libro les ayudó a cuidar?",
    "Publishing opens the new conversation",
  );
  await page.locator(".vp-back-link").click();
  await page.getByRole("button", { name: /¿Cómo pedir ayuda sin sentir que fallo\?/ }).click();
  await page.getByRole("button", { name: "Reportar la respuesta de Daniela R." }).click();
  await button("Enviar reporte").click();
  ok(
    await page.locator("dialog[open] [role=alert]").isVisible(),
    "A report needs a reason",
  );
  await page.getByLabel("Comparte datos personales de alguien", { exact: true }).check();
  await button("Enviar reporte").click();
  ok(
    (await page.locator(".vp-message-reported").count()) === 1,
    "The student sees their report was sent",
  );
  await page.getByLabel("Tu respuesta", { exact: true }).fill("A mí también me pasó.");
  await button("Publicar respuesta").click();
  ok(
    (await page.locator(".vp-thread").innerText()).includes("A mí también me pasó."),
    "Replies are published in the conversation",
  );
  await audit("Conversación", 1440);
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
  const report = await page.locator(".vp-reviews-report").innerText();
  ok(
    report.includes("Tecnología que nos acerca") &&
      !report.includes("no debe aparecer") &&
      !report.includes("Tecnología y vida cotidiana"),
    "Admin report shows only authorized reviews, never goals",
  );
  await link("Moderación").click();
  ok(
    (await page.locator(".vp-moderation-list > li").count()) === 2,
    "Moderation groups the reported messages",
  );
  await page
    .locator(".vp-moderation-list > li")
    .filter({ hasText: "Daniela R." })
    .getByRole("button", { name: "Ocultar mensaje" })
    .click();
  ok(
    (await page.locator(".vp-moderation-list > li").count()) === 1,
    "Hiding a message resolves its reports",
  );
  await audit("Moderación", 1440);
  await link("Membresías").click();
  const members = await page.locator(".vp-members-table").innerText();
  ok(
    (await page.locator(".vp-members-table tbody tr").count()) === 3 &&
      members.includes("El precio no me funciona ahora") &&
      members.includes("Vencida"),
    "Admin sees membership status and cancellation reasons",
  );
  await audit("Membresías admin", 1440);
  await link("Encuentros").click();
  await button("Crear encuentro").click();
  await page.locator("dialog[open]").getByLabel("Título", { exact: true }).fill("Encuentro de prueba");
  await page.getByLabel("Fecha", { exact: true }).fill("2027-03-04");
  await page.getByLabel("Hora de inicio (Colombia)", { exact: true }).fill("18:00");
  await page.getByLabel("Hora de cierre (Colombia)", { exact: true }).fill("17:00");
  await button("Crear encuentro de muestra").click();
  ok(
    (await page.locator("dialog[open] [role=alert]").innerText()).includes(
      "posterior",
    ),
    "Encuentro end must follow its start",
  );
  await page.getByLabel("Hora de cierre (Colombia)", { exact: true }).fill("19:30");
  await page.getByLabel("Estado", { exact: true }).selectOption("Publicado");
  await audit("Crear encuentro", 1440);
  await button("Crear encuentro de muestra").click();
  ok(
    (await page.locator(".vp-table tbody tr").count()) === 5,
    "Admin creates an encuentro",
  );
  await page.getByRole("button", { name: "Cancelar Historias entre generaciones" }).click();
  ok(
    (await page.locator(".vp-table tbody tr").filter({ hasText: "Historias entre generaciones" }).innerText()).includes("Cancelado"),
    "Admin cancels an encuentro",
  );
  await audit("Encuentros admin", 1440);
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
    (await page.locator(".vp-page-card").count()) === 12,
    `CMS covers all public pages, excluding access forms (${await page.locator(".vp-page-card").count()})`,
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
    (await page.locator(".vp-table tbody tr").count()) === 4,
    "Admin can filter rejected payments, including rejected membership charges",
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
  ok(
    page.url().endsWith("/escuela/bienvenida"),
    "A new profile starts with the welcome flow",
  );
  await button("Continuar").click();
  ok(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("role") === "alert",
    ),
    "Welcome asks for a goal and focuses the message",
  );
  await page.getByLabel(/^Tecnología y vida cotidiana/).check();
  await button("Continuar").click();
  await page.getByLabel(/^Familias y generaciones/).check();
  await button("Continuar").click();
  await page.getByLabel(/^30 minutos a la semana/).check();
  await audit("Bienvenida", 1440);
  await button("Ver mi ruta sugerida").click();
  const routeText = await page.locator(".vp-route-result").innerText();
  ok(
    routeText.includes("Tecnología que nos acerca") &&
      routeText.includes("Generaciones que se encuentran") &&
      routeText.includes("Ver una lección y responder su test."),
    "Welcome suggests a route and a weekly action",
  );
  await audit("Ruta sugerida", 1440);
  await button("Ir a mi inicio").click();
  const goalText = await page.locator(".vp-goal").innerText();
  ok(
    goalText.includes("Tecnología y vida cotidiana") && goalText.includes("50%"),
    "Dashboard charts progress toward the goal from passed tests",
  );
  await button("La cumplí esta semana").click();
  ok(
    (await page.locator(".vp-goal").innerText()).includes("1 semana cumplida"),
    "Weekly action can be checked off",
  );
  await audit("Meta personal", 1440);
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
    ["Encuentros", "encuentros"],
    ["Comunidad", "community"],
    ["Mi membresía", "membership"],
    ["Mi perfil", "profile"],
    ["Mis pagos", "student-payments"],
    ["Resumen", "admin-home"],
    ["Cursos", "courses"],
    ["Encuentros", "admin-encuentros"],
    ["Moderación", "moderation"],
    ["Páginas y contenido", "pages"],
    ["Biblioteca de medios", "media"],
    ["Membresías", "admin-memberships"],
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
      if (slug === "admin-home") {
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
    await button("Test").click();
    if (width !== 768) await audit("Test de lección", width);
    await page.evaluate(() => {
      history.pushState({}, "", "/escuela/bienvenida");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
      `Welcome ${width}: no overflow`,
    );
    if (width !== 768) {
      await shot(`welcome-${width}`);
      await audit("Bienvenida", width);
    }
    await openWorkspace("Explorar cursos");
    await page
      .locator(".vp-course-card")
      .filter({ hasText: "Tecnología que nos acerca" })
      .getByRole("button", { name: "Ver curso" })
      .click();
    if (width !== 768) await audit("Ficha de curso", width);
    await page.keyboard.press("Escape");
    await openWorkspace("Mi membresía");
    await button("Cancelar la renovación").click();
    await button("Confirmar cancelación").click();
    await button("Simular fin del periodo").click();
    await button("Elegir plan mensual").click();
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
    await page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Tecnología que nos acerca (próximamente)', exact: true }).click();
    if (width !== 768) { await shot(`public-trailer-${width}`); await audit('Tráiler público', width); }
    await page.keyboard.press('Escape');
  }
  await page.locator('.school-catalog-grid').getByRole('button', { name: 'Ver tráiler de muestra: Tecnología que nos acerca (próximamente)', exact: true }).click();
  await button('Ingresar para continuar').click();
  await label('Contraseña de muestra').fill('demo-1234');
  await button('Entrar a mi Escuela').click();
  await label('Código de 6 dígitos').fill('123456');
  await button('Confirmar y continuar').click();
  ok(page.url().endsWith('/escuela/aula') && (await page.locator('h1').innerText()) === 'Tecnología que nos acerca', 'Login continues to the selected public course in the classroom');
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
