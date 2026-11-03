import { useLayoutEffect, useRef } from 'react';

/**
 * Makes an element glide from where something was tapped to where it lands
 * after the next render (the "FLIP" trick), e.g. a word tile moving into the answer.
 */
export function useFlip() {
  const els = useRef(new Map<string, HTMLElement>());
  const pending = useRef<{ key: string; from: DOMRect } | null>(null);

  useLayoutEffect(() => {
    const move = pending.current;
    pending.current = null;
    const el = move && els.current.get(move.key);
    if (!move || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = el.getBoundingClientRect();
    el.animate(
      [{ transform: `translate(${move.from.left - to.left}px, ${move.from.top - to.top}px)` }, { transform: 'none' }],
      { duration: 380, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' },
    );
  });

  return {
    /** Ref for an element that may land somewhere. */
    track: (key: string) => (el: HTMLElement | null) => {
      if (el) els.current.set(key, el);
      else els.current.delete(key);
    },
    /** The element with `key` will glide in from `from` on the next render. */
    fly: (key: string, from: DOMRect) => {
      pending.current = { key, from };
    },
  };
}
