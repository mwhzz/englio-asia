import type { CSSProperties } from 'react';
import type { Pt } from './geometry';

/** Small flocks gliding across the scene. */
export function Birds({ flocks }: { flocks: Pt[] }) {
  return (
    <g className="sc-birds" aria-hidden="true">
      {flocks.map((f, i) => (
        <g key={i} transform={`translate(0 ${f.y.toFixed(0)})`}>
          <g className="sc-flock" style={{ '--delay': `${i * -6}s`, '--dur': `${22 + i * 4}s` } as CSSProperties}>
            {[0, 1, 2].map((b) => (
              <path key={b} d={`M${b * 9} ${b % 2 ? 4 : 0}q3 -3 5 0q2 -3 5 0`} className="sc-bird" />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}
