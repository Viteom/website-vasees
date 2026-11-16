import { ArrowUpRight } from '@phosphor-icons/react';
import { initiatives } from './content/home';
import { SiteLink } from './navigation';

const paths = ['/ecosistema/kanna', '/la-chispa', '/escuela'];
export function InitiativeCards() {
  return <div className="ecosystem-grid">{initiatives.map((item, index) => <article className={`initiative ${item.className}`} key={item.name}>
    <div className="initiative-top"><span className="eyebrow">{item.label}</span>{item.className === 'chispa' ? <img src="/images/brands/chispa-mark.svg" alt="" /> : <ArrowUpRight size={28} />}</div>
    <div className="initiative-brand-slot"><h3>{item.className === 'kanna' ? <img src="/images/brands/kanna-logo.png" alt="Kánna" width="940" height="268" loading="lazy" /> : item.className === 'chispa' ? <img src="/images/brands/chispa-wordmark.svg" alt="La Chispa" width="252" height="39" loading="lazy" /> : <>Escuela de<br />Hijos y Nietos</>}</h3></div>
    <h4>{item.title}</h4><p>{item.text}</p><SiteLink className="initiative-action" href={paths[index]}><span>{item.status}</span><span className="small-round"><ArrowUpRight size={21} /></span></SiteLink>
  </article>)}</div>;
}
