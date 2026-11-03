import type { CSSProperties } from 'react';
import { DOODLES, doodlesFor } from './doodles';
import type { TrailPoint } from './trailLayout';

/** How far from the middle a drawing sits, on the side the path has left free. */
const OFFSET = 118;
const TILTS = [-10, 6, -4, 9];

/** Faint line drawings in the unit's color beside each stop, on the side away from the curve. */
export function TrailDoodles({ title, points }: { title: string; points: TrailPoint[] }) {
  const names = doodlesFor(title);
  return (
    <div className="trail-doodles" aria-hidden="true">
      {points.map((p, i) => {
        const side = p.dx === 0 ? (i % 2 ? 1 : -1) : -Math.sign(p.dx);
        return (
          <svg
            key={i}
            className="trail-doodle"
            viewBox="0 0 24 24"
            style={
              {
                top: p.y - 6 + (i % 2) * 18,
                left: `calc(50% + ${side * OFFSET}px)`,
                '--tilt': `${TILTS[i % TILTS.length]}deg`,
                '--d': `${(i % 3) * 0.8}s`,
              } as CSSProperties
            }
          >
            <path d={DOODLES[names[i % names.length]]} />
          </svg>
        );
      })}
    </div>
  );
}
