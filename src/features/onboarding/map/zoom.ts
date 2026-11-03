import { MAP_HEIGHT, MAP_WIDTH, type DistrictShape } from './districtShapes';

/** Map transform: a point p on the map is drawn at (x + scale * p). */
export interface View {
  x: number;
  y: number;
  scale: number;
}

export const HOME: View = { x: 0, y: 0, scale: 1 };
export const MAX_SCALE = 5;

/** Keeps the scale in range and the map covering the frame (no empty edges). */
export function clampView(v: View): View {
  const scale = Math.min(MAX_SCALE, Math.max(1, v.scale));
  const clamp = (value: number, size: number) => Math.min(0, Math.max(size * (1 - scale), value));
  return { scale, x: clamp(v.x, MAP_WIDTH), y: clamp(v.y, MAP_HEIGHT) };
}

/** Zooms by `factor` keeping the frame point (ux, uy) still, like a pinch. */
export function zoomAt(v: View, factor: number, ux: number, uy: number): View {
  const scale = Math.min(MAX_SCALE, Math.max(1, v.scale * factor));
  const ratio = scale / v.scale;
  return clampView({ scale, x: ux - (ux - v.x) * ratio, y: uy - (uy - v.y) * ratio });
}

export function panBy(v: View, dx: number, dy: number): View {
  return clampView({ ...v, x: v.x + dx, y: v.y + dy });
}

/** Centres a district, zooming in enough to read its neighbours but never zooming out. */
export function focusOn(shape: DistrictShape, currentScale = 1): View {
  const [, , w, h] = shape.box;
  const fit = Math.min(3, Math.max(1.8, Math.min((0.4 * MAP_WIDTH) / w, (0.4 * MAP_HEIGHT) / h)));
  const scale = Math.max(currentScale, fit);
  return clampView({ scale, x: MAP_WIDTH / 2 - scale * shape.cx, y: MAP_HEIGHT / 2 - scale * shape.cy });
}
