import { useEffect, useRef, useState } from 'react';

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates a number smoothly to `target` (from 0 on first show). */
export function useTween(target: number, duration = 1400, delay = 250): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const start = from.current;
    let frame = 0;
    const began = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - began) / duration));
      const v = start + (target - start) * ease(t);
      from.current = v;
      setValue(v);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);

  return value;
}
