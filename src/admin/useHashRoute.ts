import { useEffect, useState } from 'react';

/** The page from the URL hash, e.g. "#/lesson/u1-l2" → ["lesson", "u1-l2"]. */
export function useHashRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const go = (...parts: string[]) => {
  window.location.hash = `/${parts.map(encodeURIComponent).join('/')}`;
};
