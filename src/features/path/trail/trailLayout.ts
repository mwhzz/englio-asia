/** Room above the first stop (below the unit card). */
const TOP = 64;
/** Between two stops. */
const STEP = 136;
/** Extra room under the next lesson for its start button. */
const START_ROOM = 32;
/** How far a stop swings left or right of the middle, in px. */
export const SWING = 76;

export interface TrailPoint {
  /** Offset from the middle of the column, in px. */
  dx: number;
  y: number;
}

/**
 * A unit's stops on a gentle S-curve down the middle of the column.
 * Units take turns swinging right or left first, so the path weaves.
 */
export function trailLayout(count: number, unitIndex: number, currentIndex: number): { points: TrailPoint[]; height: number } {
  const dir = unitIndex % 2 ? -1 : 1;
  const points: TrailPoint[] = [];
  let y = TOP;
  for (let i = 0; i < count; i++) {
    points.push({ dx: Math.round(dir * SWING * Math.sin((i * Math.PI) / 3)), y });
    y += STEP + (i === currentIndex ? START_ROOM : 0);
  }
  const last = points[points.length - 1];
  return { points, height: last.y + (currentIndex === count - 1 ? 132 : 104) };
}

/** A smooth curve from one stop to the next (in the SVG's centered coordinates). */
export function curveBetween(a: TrailPoint, b: TrailPoint): string {
  const mid = (b.y - a.y) / 2;
  return `M${a.dx} ${a.y}C${a.dx} ${a.y + mid} ${b.dx} ${b.y - mid} ${b.dx} ${b.y}`;
}
