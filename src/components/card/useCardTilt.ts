import { useRef, type PointerEvent } from 'react';

const MAX_TILT = 14; // degrees

/**
 * Tilts the card toward the finger or mouse and moves its shine.
 * Writes CSS variables directly, so following the pointer never re-renders React.
 */
export function useCardTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  function onPointerMove(e: PointerEvent<T>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT * 0.8}deg`);
    el.style.setProperty('--px', `${x * 100}%`);
    el.style.setProperty('--py', `${y * 100}%`);
    el.classList.add('is-tilting');
  }

  function onPointerLeave() {
    const el = ref.current;
    if (!el) return;
    for (const name of ['--rx', '--ry', '--px', '--py']) el.style.removeProperty(name);
    el.classList.remove('is-tilting');
  }

  return { ref, handlers: { onPointerMove, onPointerLeave, onPointerCancel: onPointerLeave } };
}
