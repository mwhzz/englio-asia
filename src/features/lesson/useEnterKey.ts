import { useEffect, useRef } from 'react';

/** Calls `handler` when Enter is pressed anywhere except on a focused button (which clicks itself). */
export function useEnterKey(handler: () => void) {
  const latest = useRef(handler);
  latest.current = handler;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'BUTTON') return;
      e.preventDefault();
      latest.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
