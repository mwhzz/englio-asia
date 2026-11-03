import { useRef, type PointerEvent } from 'react';

/** Hour (1–12) under a point, measured clockwise from 12 at the top; null near the centre. */
function hourAt(el: HTMLElement, clientX: number, clientY: number): number | null {
  const r = el.getBoundingClientRect();
  const dx = clientX - (r.left + r.width / 2);
  const dy = clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < r.width * 0.16) return null;
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI + 360;
  return Math.round(deg / 30) % 12 || 12;
}

/** Press and drag around the dial to choose an hour, like turning a watch crown. */
export function useDialPointer(onHour: (hour: number) => void) {
  const dragging = useRef(false);

  function pick(e: PointerEvent<HTMLElement>) {
    const hour = hourAt(e.currentTarget, e.clientX, e.clientY);
    if (hour) onHour(hour);
  }

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pick(e);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      if (dragging.current) pick(e);
    },
    onPointerUp() {
      dragging.current = false;
    },
    onPointerCancel() {
      dragging.current = false;
    },
  };
}
