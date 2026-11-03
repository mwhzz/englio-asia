import { useEffect, useState } from 'react';
import { STYLES } from './letterStyles';

const HREF =
  'https://fonts.googleapis.com/css2?family=Playwrite+DE+Grund:wght@100..400&family=Playwrite+US+Trad:wght@100..400&display=swap';

/**
 * Loads the handwriting fonts only when the letters page opens (the rest of the app never pays for them).
 * Returns true once they're ready to draw with, so the tracing canvas can redraw its guide letter.
 */
export function useHandwritingFonts(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = HREF;
      document.head.appendChild(link);
    }
    let alive = true;
    Promise.all(STYLES.map((s) => document.fonts.load(`64px "${s.family}"`, 'Aa')))
      .catch(() => [])
      .then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  return ready;
}
