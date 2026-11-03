import { useEffect, useRef, useState, type Dispatch, type PointerEvent, type RefObject, type SetStateAction } from 'react';
import { MAP_HEIGHT, MAP_WIDTH } from './districtShapes';
import { panBy, zoomAt, type View } from './zoom';

const TAP_SLOP = 8; // px a finger may move and still count as a tap

type Point = { x: number; y: number };

/** Converts a screen point to frame units (the SVG viewBox), and returns units per pixel. */
function toFrame(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect();
  const k = Math.max(MAP_WIDTH / rect.width, MAP_HEIGHT / rect.height);
  const offsetX = (rect.width * k - MAP_WIDTH) / 2;
  const offsetY = (rect.height * k - MAP_HEIGHT) / 2;
  return { x: (clientX - rect.left) * k - offsetX, y: (clientY - rect.top) * k - offsetY, k };
}

/**
 * Drag to pan, pinch or scroll to zoom, tap to pick a district.
 * Returns pointer handlers for the <svg> and whether a gesture is in progress
 * (animations are paused while the finger is down so the map follows it exactly).
 */
export function useMapGestures(
  svgRef: RefObject<SVGSVGElement | null>,
  enabled: boolean,
  setView: Dispatch<SetStateAction<View>>,
  onTap: (districtId: string) => void,
) {
  const pointers = useRef(new Map<number, Point>());
  const start = useRef<{ point: Point; districtId: string | null; moved: boolean } | null>(null);
  const [active, setActive] = useState(false);

  // Scroll-wheel / trackpad zoom (needs a non-passive listener to stop page scroll).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !enabled) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toFrame(svg, e.clientX, e.clientY);
      setView((v) => zoomAt(v, Math.exp(-e.deltaY * 0.0022), p.x, p.y));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [svgRef, enabled, setView]);

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (!enabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const districtId = (e.target as Element).getAttribute('data-id');
      start.current = { point: { x: e.clientX, y: e.clientY }, districtId, moved: false };
    } else if (start.current) {
      start.current.moved = true; // a second finger means pinch, not tap
    }
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    const prev = pointers.current.get(e.pointerId);
    if (!enabled || !svg || !prev || !start.current) return;
    const next = { x: e.clientX, y: e.clientY };

    if (!start.current.moved) {
      const dist = Math.hypot(next.x - start.current.point.x, next.y - start.current.point.y);
      if (dist < TAP_SLOP) return;
      start.current.moved = true;
      setActive(true);
    }

    const others = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId).map(([, p]) => p);
    pointers.current.set(e.pointerId, next);
    const { k } = toFrame(svg, 0, 0);

    if (others.length === 0) {
      setView((v) => panBy(v, (next.x - prev.x) * k, (next.y - prev.y) * k));
      return;
    }

    // Pinch: scale by the change in finger distance, around their midpoint.
    const other = others[0];
    const before = Math.hypot(prev.x - other.x, prev.y - other.y);
    const after = Math.hypot(next.x - other.x, next.y - other.y);
    if (before < 1) return;
    const mid = toFrame(svg, (next.x + other.x) / 2, (next.y + other.y) / 2);
    setView((v) => {
      const zoomed = zoomAt(v, after / before, mid.x, mid.y);
      return panBy(zoomed, ((next.x - prev.x) / 2) * k, ((next.y - prev.y) / 2) * k);
    });
  }

  function onPointerEnd(e: PointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    const tap = start.current && !start.current.moved ? start.current.districtId : null;
    start.current = null;
    setActive(false);
    if (tap && e.type === 'pointerup') onTap(tap);
  }

  return {
    active,
    handlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd },
  };
}
