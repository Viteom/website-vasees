import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

function offline() {
  return typeof window !== 'undefined' && (window.location.protocol === 'file:' || Boolean((window as Window & { __VASEES_OFFLINE__?: boolean }).__VASEES_OFFLINE__));
}

export function readPath() {
  if (typeof window === 'undefined') return '/';
  if (offline()) return window.location.hash.startsWith('#/') ? window.location.hash.slice(1).split('?')[0].replace(/\/$/, '') || '/' : '/';
  return window.location.pathname.replace(/\/$/, '') || '/';
}

export function usePath(initialPath?: string) {
  const [path, setPath] = useState(initialPath ?? readPath);
  useEffect(() => {
    const update = () => setPath(readPath());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('hashchange', update); };
  }, []);
  return path;
}

export function routeHref(href: string) {
  if (!offline()) return href;
  if (href.startsWith('#') && readPath() !== '/') return `#${readPath()}?section=${encodeURIComponent(href.slice(1))}`;
  if (!href.startsWith('/')) return href;
  if (href.startsWith('/#')) return href.slice(1);
  if (href.startsWith('/?')) { const [query, hash = 'inicio'] = href.slice(2).split('#'); return `#${hash}?${query}`; }
  return href === '/' ? '#inicio' : `#${href}`;
}

export function navigate(href: string) {
  const target = routeHref(href);
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
  const hash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : null;
  requestAnimationFrame(() => {
    if (hash) {
      const scroll = () => document.getElementById(hash)?.scrollIntoView({ behavior: 'auto' });
      scroll();
      // A freshly mounted page can still shift while fonts and media settle; land on the section once more.
      window.setTimeout(() => { const top = document.getElementById(hash)?.getBoundingClientRect().top ?? 0; if (Math.abs(top) > 140) scroll(); }, 400);
    }
    else { window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); }
  });
}

export function SiteLink({ href = '/', children, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  function click(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || (!href.startsWith('/') && !(offline() && href.startsWith('#')))) return;
    event.preventDefault();
    navigate(href);
  }
  return <a {...props} href={routeHref(href)} onClick={click}>{children}</a>;
}

/** Reads a query parameter from the real URL, or from the hash query used by the offline export. */
export function readQuery(name: string) {
  if (typeof window === 'undefined') return null;
  const fromSearch = new URLSearchParams(window.location.search).get(name);
  if (fromSearch) return fromSearch;
  const hashQuery = window.location.hash.split('?')[1];
  return hashQuery ? new URLSearchParams(hashQuery).get(name) : null;
}
