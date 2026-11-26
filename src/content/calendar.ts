// Calendar links and .ics export for School encuentros. Times are stored in UTC ISO strings.
export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string; // ISO 8601, UTC
  end: string; // ISO 8601, UTC
};

/** 2026-12-03T23:00:00.000Z -> 20261203T230000Z */
export const compactUtc = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactUtc(event.start)}/${compactUtc(event.end)}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** host: outlook.live.com for personal accounts, outlook.office.com for Microsoft 365. */
export function outlookCalendarUrl(event: CalendarEvent, host: 'outlook.live.com' | 'outlook.office.com' = 'outlook.live.com') {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.start).toISOString(),
    enddt: new Date(event.end).toISOString(),
    body: event.description,
    location: event.location,
  });
  return `https://${host}/calendar/0/deeplink/compose?${params}`;
}

export function yahooCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: compactUtc(event.start),
    et: compactUtc(event.end),
    desc: event.description,
    in_loc: event.location,
  });
  return `https://calendar.yahoo.com/?${params}`;
}

const escapeText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** RFC 5545 §3.1: lines longer than 75 octets continue on the next line after a space. */
function fold(line: string) {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = out.length ? 74 : 75;
    if (bytes.encode(current + char).length > limit) {
      out.push(current);
      current = char;
    } else current += char;
  }
  out.push(current);
  return out.join('\r\n ');
}

/** One calendar file with one or more events (a single encuentro or a whole month). */
export function icsFile(events: CalendarEvent | CalendarEvent[], now = new Date()) {
  const list = Array.isArray(events) ? events : [events];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vasees//Escuela de Familia y Longevidad//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...list.flatMap((event) => [
      'BEGIN:VEVENT',
      `UID:${event.id}@escuela.vasees.co`,
      `DTSTAMP:${compactUtc(now.toISOString())}`,
      `DTSTART:${compactUtc(event.start)}`,
      `DTEND:${compactUtc(event.end)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export const icsFileName = (event: CalendarEvent) =>
  `${event.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'encuentro'}.ics`;

/** Bogotá has no daylight saving time: always UTC-5. */
export const BOGOTA_OFFSET = '-05:00';
export const bogotaToUtc = (date: string, time: string) =>
  new Date(`${date}T${time}:00${BOGOTA_OFFSET}`).toISOString();

export function formatBogota(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  }).format(new Date(iso));
}
export const bogotaParts = (iso: string) => {
  const shifted = new Date(new Date(iso).getTime() - 5 * 3600 * 1000).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
};
