import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrismaHero } from '@/components/ui/prisma-hero';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><><PrismaHero /><main className="mx-auto max-w-6xl px-5 py-24 md:px-10">
{[
  ['our-story', '01 / Nuestra historia', 'Una mirada diferente.', 'Un espacio donde artistas visuales, cineastas y narradores se encuentran para explorar ideas y crear juntos.'],
  ['collective', '02 / Colectivo', 'Creamos juntos.', 'Distintas disciplinas, nuevas posibilidades. El colectivo reúne miradas propias para imaginar y dar forma a proyectos compartidos.'],
  ['workshops', '03 / Talleres', 'Espacio para descubrir.', 'Aprender haciendo, experimentar y compartir procesos. Próximamente encontrarás aquí las fechas de los talleres y cómo participar.'],
  ['programs', '04 / Programas', 'Sigue explorando.', 'Estamos preparando nuestros programas. Aquí compartiremos las próximas oportunidades y los pasos para participar.'],
  ['inquiries', '05 / Contacto', 'Todo empieza con una idea.', 'Pronto habilitaremos nuestros canales de contacto para recibir tus ideas y propuestas de colaboración.']
].map(([id, label, heading, text]) => <section id={id} key={id} className="scroll-mt-8 grid gap-6 border-t border-primary/20 py-16 md:grid-cols-2"><p className="text-xs uppercase tracking-widest text-primary/60">{label}</p><div><h2 className="mb-5 text-4xl tracking-tight md:text-5xl">{heading}</h2><p className="max-w-md leading-relaxed text-primary/70">{text}</p></div></section>)}
<footer className="border-t border-primary/20 pt-8 text-xs text-primary/50">Vasees* · Colectivo creativo · Sitio en desarrollo</footer>
</main></></React.StrictMode>);
