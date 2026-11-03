import type { CSSProperties } from 'react';
import { DISTRICT_SHAPES } from './districtShapes';

/** A twinkling light in every district: learners all over Bangladesh. */
export function MapLights() {
  return (
    <g className="bdmap-lights" aria-hidden="true">
      {DISTRICT_SHAPES.map((s, i) => (
        // A scrambled order (i * 37 mod 64) so neighbours don't light up together.
        <circle key={s.id} cx={s.cx} cy={s.cy} r={4} style={{ '--t': `${((i * 37) % 64) * 0.045}s` } as CSSProperties} />
      ))}
    </g>
  );
}
