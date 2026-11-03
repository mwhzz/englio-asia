import { useEffect, useState } from 'react';

const KEY = 'englio-ship-at';

function readSaved(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/**
 * Where the ship should be drawn. After finishing a lesson it waits at the
 * old jetty, then sails to the new one once `visible` (so the learner sees it go).
 */
export function useShipIndex(target: number, visible: boolean): number {
  const [shown, setShown] = useState(() => {
    const saved = readSaved();
    return saved !== null && Number.isFinite(saved) && saved < target ? saved : target;
  });

  useEffect(() => {
    if (shown === target) {
      try {
        localStorage.setItem(KEY, String(target));
      } catch {
        // The ship just won't remember where it was.
      }
      return;
    }
    if (!visible) return;
    const timer = setTimeout(() => setShown(target), 500);
    return () => clearTimeout(timer);
  }, [target, shown, visible]);

  return shown;
}
