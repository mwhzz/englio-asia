import { useLayoutEffect, useState, type RefObject } from 'react';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Tracks where `slot` sits inside `root`, so one shared element (the map) can
 * glide between screens instead of being re-created on each one.
 * Keeps the last position after the slot disappears.
 */
export function useSlotRect(root: RefObject<HTMLElement | null>, slot: HTMLElement | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const container = root.current;
    if (!slot || !container) return;
    const measure = () => {
      const a = slot.getBoundingClientRect();
      const b = container.getBoundingClientRect();
      setRect({ top: a.top - b.top, left: a.left - b.left, width: a.width, height: a.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    observer.observe(container);
    return () => observer.disconnect();
  }, [root, slot]);

  return rect;
}
