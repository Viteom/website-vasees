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
  return href === '/' ? '#inicio' : `#${href}`;
}

export function navigate(href: string) {
  const target = routeHref(href);
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
  const hash = href.startsWith('/#') ? href.slice(2) : href.startsWith('#') ? href.slice(1) : null;
  requestAnimationFrame(() => {
    if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'auto' });
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
