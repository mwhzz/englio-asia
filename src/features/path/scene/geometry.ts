export interface Pt {
  x: number;
  y: number;
}

/** Dense points along a smooth Catmull-Rom curve through the control points. */
export function smoothLine(ctrl: Pt[], samplesPerSegment = 14): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: at(p0.x, p1.x, p2.x, p3.x), y: at(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

/** Left and right edges of a band of the given width around a center line. */
export function bandEdges(line: Pt[], widthAt: (i: number) => number): { left: Pt[]; right: Pt[] } {
  const left: Pt[] = [];
  const right: Pt[] = [];
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    // Normal pointing to the left of the direction of flow (downwards = towards smaller x).
    const nx = ty / len;
    const ny = -tx / len;
    const half = widthAt(i) / 2;
    left.push({ x: p.x - nx * half, y: p.y - ny * half });
    right.push({ x: p.x + nx * half, y: p.y + ny * half });
  });
  return { left, right };
}

const r = (n: number) => Math.round(n * 10) / 10;

export function polyline(points: Pt[]): string {
  return `M${points.map((p) => `${r(p.x)},${r(p.y)}`).join('L')}`;
}

/** A closed shape from two edges (left down, right back up). */
export function band(left: Pt[], right: Pt[]): string {
  return `${polyline(left)}L${[...right].reverse().map((p) => `${r(p.x)},${r(p.y)}`).join('L')}Z`;
}

/** The x of a polyline at height y (points must run downwards). */
export function xAt(points: Pt[], y: number): number {
  if (y <= points[0].y) return points[0].x;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (y <= b.y) return a.x + ((b.x - a.x) * (y - a.y)) / Math.max(0.0001, b.y - a.y);
  }
  return points[points.length - 1].x;
}

/** Small deterministic random generator so the scenery looks the same every time. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
