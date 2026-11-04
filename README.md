# Vasees — concepto de sitio web

React + TypeScript + Vite, with Tailwind CSS v4, Framer Motion and Lucide icons.

## Development

Use Node.js 22.12+ (validated with Node.js 24).

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

Components live in `src/components/ui`, imported through `@/components/ui`. This is the UI directory configured in `components.json` for shadcn; the `@` alias maps to `src`. Global styles and Tailwind theme tokens are in `src/styles.css`. Utilities are in `src/lib/utils.ts`.

`src/components/ui/prisma-hero.tsx` integrates the supplied component. Navigation links lead to introductory sections. The video has a playback control and a CSS background fallback. The supplied video is hosted by a third party and requires access to `d8j0ntlcm91z4.cloudfront.net` in the viewing browser.

The brand name is Vasees and the website copy is in Spanish. Workshop/program notices and contact placeholder remain concept content, pending launch details. No forms, backend or registration service are connected.
