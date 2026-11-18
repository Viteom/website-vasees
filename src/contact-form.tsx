import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check } from '@phosphor-icons/react';
import { site } from './content/home';
import { contactInterests, type ContactInterest } from './content/solutions';
import { SiteLink, readQuery } from './navigation';

const isInterest = (value: string | null): value is ContactInterest => contactInterests.some(item => item.value === value);
type Errors = Partial<Record<'name' | 'email' | 'interest', string>>;

/** The single commercial contact flow (brief v3 §10). It only prepares an email: nothing is stored or sent from the site. */
export function ContactForm() {
  const [interest, setInterest] = useState<ContactInterest | ''>('');
  const [errors, setErrors] = useState<Errors>({});
  const summary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solution CTAs link to /?interes=<id>#contacto; read it on load and on in-app navigation.
    const sync = () => { const value = readQuery('interes'); if (isInterest(value)) { setInterest(value); setErrors(old => ({ ...old, interest: undefined })); } };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get('name') ?? '').trim();
    const email = String(values.get('email') ?? '').trim();
    const next: Errors = {};
    if (!name) next.name = 'Escribe tu nombre.';
    if (!email) next.email = 'Escribe tu correo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Revisa el correo: debe tener el formato nombre@dominio.com.';
    if (!interest) next.interest = 'Elige qué necesitas construir.';
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    const choice = contactInterests.find(item => item.value === interest)!;
    const organization = String(values.get('organization') ?? '').trim();
    const challenge = String(values.get('challenge') ?? '').trim();
    const body = `Hola, Vasees.\n\nSoy ${name}${organization ? `, de ${organization}` : ''}.\nCorreo de contacto: ${email}\nLo que necesito: ${choice.label}\n\n${challenge || 'Me gustaría conversar sobre cómo podemos trabajar juntos.'}\n`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Hablemos · ${choice.subject}`)}&body=${encodeURIComponent(body)}`;
  }

  const errorList = Object.entries(errors).filter(([, value]) => value);
  return <section className="contact section-wrap" id="contacto" aria-labelledby="contact-heading">
    <div className="contact-layout">
      <div className="contact-intro">
        <h2 id="contact-heading">¿Qué necesitas construir con Vasees?</h2>
        <p>Elige el desafío que tienes hoy. Si todavía no sabes cómo abordarlo, cuéntanos qué está pasando y lo exploramos juntos.</p>
        <a className="contact-email" href={`mailto:${site.email}`}>{site.email}<ArrowUpRight size={21} aria-hidden="true" /></a>
      </div>
      <form onSubmit={submit} noValidate>
        {errorList.length > 0 && <div className="form-errors" role="alert" tabIndex={-1} ref={summary}><p>Revisa {errorList.length === 1 ? 'este campo' : 'estos campos'}:</p><ul>{errorList.map(([key, value]) => <li key={key}><a href={`#contact-${key}`}>{value}</a></li>)}</ul></div>}
        <fieldset className="interest-options" aria-describedby={errors.interest ? 'contact-interest-error' : undefined}>
          <legend id="contact-interest">¿Qué necesitas?</legend>
          {contactInterests.map(item => <label key={item.value} className={interest === item.value ? 'selected' : ''}>
            <input type="radio" name="interest" value={item.value} checked={interest === item.value} onChange={() => { setInterest(item.value); setErrors(old => ({ ...old, interest: undefined })); }} />
            <span>{item.label}</span>{interest === item.value && <Check size={20} aria-hidden="true" />}
          </label>)}
          {errors.interest && <p className="field-error" id="contact-interest-error">{errors.interest}</p>}
        </fieldset>
        <div className="form-row">
          <label htmlFor="contact-name">Nombre</label>
          <input id="contact-name" name="name" autoComplete="name" maxLength={100} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
          {errors.name && <p className="field-error" id="contact-name-error">{errors.name}</p>}
        </div>
        <div className="form-row">
          <label htmlFor="contact-organization">Organización <span className="optional">(opcional)</span></label>
          <input id="contact-organization" name="organization" autoComplete="organization" maxLength={150} />
        </div>
        <div className="form-row">
          <label htmlFor="contact-email">Correo</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={200} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
          {errors.email && <p className="field-error" id="contact-email-error">{errors.email}</p>}
        </div>
        <div className="form-row">
          <label htmlFor="contact-challenge">Cuéntanos tu reto <span className="optional">{interest === 'explorar' ? '(recomendado)' : '(opcional)'}</span></label>
          <textarea id="contact-challenge" name="challenge" maxLength={800} rows={4} aria-describedby={interest === 'explorar' ? 'contact-challenge-hint' : undefined} />
          {interest === 'explorar' && <p className="field-hint" id="contact-challenge-hint">Unas líneas sobre qué está pasando nos ayudan a orientar la primera conversación.</p>}
        </div>
        <button className="button button-dark" type="submit">Abrir mi correo para escribir a Vasees<ArrowUpRight size={21} aria-hidden="true" /></button>
        <p className="form-note">Se abrirá tu aplicación de correo con un resumen de tus respuestas para que lo revises y lo envíes. Este sitio no almacena ni envía tus datos. Consulta la <SiteLink href="/privacidad">política de tratamiento de datos</SiteLink>, que está en revisión jurídica.</p>
      </form>
    </div>
  </section>;
}
