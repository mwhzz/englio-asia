import type { CSSProperties } from 'react';
import type { UnitMark } from '../riverLayout';

/** An arched bridge across the river at the start of each unit, with its shadow on the water. */
export function Bridge({ mark }: { mark: UnitMark }) {
  const { bridgeFrom: a, bridgeTo: b, bridgeY: y } = mark;
  const mid = (a + b) / 2;
  const deck = `M${a} ${y}Q${mid} ${y - 20} ${b} ${y}`;
  const rail = `M${a} ${y - 7}Q${mid} ${y - 27} ${b} ${y - 7}`;
  const posts = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const x = a + (b - a) * t;
    // Height of the arch at t (quadratic Bézier with control point 20 above).
    const dy = -2 * t * (1 - t) * 20;
    return <path key={i} d={`M${x.toFixed(1)} ${(y + dy - 1).toFixed(1)}v-6`} className="sc-bridge-post" />;
  });

  return (
    <g className="sc-bridge" style={{ '--u': mark.unit.color } as CSSProperties}>
      <ellipse cx={mid} cy={y + 10} rx={(b - a) / 2 - 6} ry="5" className="sc-bridge-shadow" />
      <rect x={a - 6} y={y - 4} width="10" height="14" rx="2" className="sc-bridge-pier" />
      <rect x={b - 4} y={y - 4} width="10" height="14" rx="2" className="sc-bridge-pier" />
      <path d={deck} className="sc-bridge-deck-edge" />
      <path d={deck} className="sc-bridge-deck" />
      {posts}
      <path d={rail} className="sc-bridge-rail" />
    </g>
  );
}
