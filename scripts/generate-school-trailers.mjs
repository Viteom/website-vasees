// Regenerate the explicitly labelled, silent demo previews with local FFmpeg.
// Production builds serve the checked-in MP4/VTT files and do not need FFmpeg.
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { schoolCourses } from '../src/content/school.ts';

const temporary = await mkdtemp('/tmp/vasees-trailers-');
const root = process.cwd();
const wrap = (text, maximum = 29) => {
  const lines = [''];
  for (const word of text.split(' ')) {
    if (lines.at(-1).length && lines.at(-1).length + word.length + 1 > maximum) lines.push(word);
    else lines[lines.length - 1] += `${lines.at(-1) ? ' ' : ''}${word}`;
  }
  return lines.join('\n');
};
try {
  await mkdir('public/videos', { recursive: true });
  for (const course of schoolCourses) {
    const overlays = [
      { text: 'VASEES / ESCUELA DE HIJOS Y NIETOS', size: 12, y: 30 },
      { text: wrap(course.title), size: 40, y: 115, start: 0, end: 2.5 },
      { text: `${course.category} / ${course.lessons.length} lecciones de muestra`, size: 16, y: 290, start: 0, end: 2.5 },
      { text: 'UNA PRIMERA MIRADA', size: 12, y: 83, start: 2.5, end: 7.5 },
      ...course.lessons.map((lesson, index) => ({ text: `0${index + 1} / ${lesson.title}`, size: 24, y: 120 + index * 65, start: 2.5, end: 7.5 })),
      { text: 'Más años.\nMás por descubrir.', size: 40, y: 117, start: 7.5, end: 10 },
      { text: 'Explora el curso en Vasees.', size: 17, y: 290, start: 7.5, end: 10 },
      { text: 'AVANCE VISUAL DE DEMOSTRACIÓN / SIN AUDIO', size: 11, y: 370 },
    ];
    const filters = [
      'scale=720:406:force_original_aspect_ratio=increase', 'crop=720:406',
      'drawbox=x=0:y=0:w=iw:h=ih:color=0x092f40@0.78:t=fill',
    ];
    for (const [index, overlay] of overlays.entries()) {
      const file = path.join(temporary, `${course.id}-${index}.txt`);
      await writeFile(file, overlay.text);
      let filter = `drawtext=fontfile='${root}/public/fonts/pathway-extreme.ttf':textfile='${file}':fontcolor=white:fontsize=${overlay.size}:x=35:y=${overlay.y}:line_spacing=8`;
      if (overlay.start !== undefined) filter += `:enable='gte(t,${overlay.start})*lt(t,${overlay.end})'`;
      filters.push(filter);
    }
    const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-loop', '1', '-i', path.join(root, 'public', course.image), '-vf', filters.join(','), '-t', '10', '-r', '24', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', path.join(root, 'public', course.trailer)], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || 'FFmpeg failed');
    const cues = `WEBVTT\n\n00:00.000 --> 00:02.500\n${course.title}. ${course.category}. ${course.lessons.length} lecciones de muestra.\n\n00:02.500 --> 00:07.500\n${course.lessons.map(lesson => lesson.title).join('. ')}.\n\n00:07.500 --> 00:10.000\nMás años. Más por descubrir. Explora el curso en Vasees.\n`;
    await writeFile(path.join(root, 'public', course.trailerCaptions), cues);
    console.log(`Created ${course.id}: 10s silent demo preview`);
  }
} finally { await rm(temporary, { recursive: true, force: true }); }
