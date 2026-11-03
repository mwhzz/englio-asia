import type { CSSProperties } from 'react';
import { Planets } from './Planets';
import { SKY_WIDTH, type Sky } from './starLayout';
import { VillageHorizon } from './VillageHorizon';

/**
 * Everything painted on the sky behind the stars: a Milky Way band, a
 * colored nebula per unit, background star dust, a crescent moon, and the
 * lines that join each unit's stars into a constellation.
 */
export function StarLines({ sky, done, current }: { sky: Sky; done: (lessonId: string) => boolean; current: number }) {
  const lines = sky.stars.slice(1).map((to, i) => {
    const from = sky.stars[i];
    const sameUnit = from.unitIndex === to.unitIndex;
    const state = done(to.lesson.id) ? 'lit' : to.index === current ? 'next' : 'dim';
    return { from, to, sameUnit, state, color: to.unit.color };
  });

  return (
    <svg className="sky-svg" viewBox={`0 0 ${SKY_WIDTH} ${sky.height}`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs>
        <radialGradient id="sky-milky">
          <stop offset="0" stopColor="#c9d4ff" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#c9d4ff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#c9d4ff" stopOpacity="0" />
        </radialGradient>
        {sky.constellations.map((c) => (
          <radialGradient key={c.unit.id} id={`nebula-${c.unit.id}`}>
            <stop offset="0" stopColor={c.unit.color} stopOpacity="0.38" />
            <stop offset="0.55" stopColor={c.unit.color} stopOpacity="0.12" />
            <stop offset="1" stopColor={c.unit.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <mask id="sky-crescent">
          <circle cx="0" cy="0" r="16" fill="#fff" />
          <circle cx="-7" cy="-4" r="14" fill="#000" />
        </mask>
      </defs>

      {/* A faint Milky Way running diagonally down the sky. */}
      {Array.from({ length: Math.ceil(sky.height / 700) }, (_, i) => (
        <ellipse
          key={i}
          cx="180"
          cy={i * 700 + 175}
          rx="320"
          ry="70"
          fill="url(#sky-milky)"
          transform={`rotate(${i % 2 ? 24 : -24} 180 ${i * 700 + 175})`}
        />
      ))}

      {sky.constellations.map((c) => (
        <ellipse key={c.unit.id} cx={c.nebula.x} cy={c.nebula.y} rx={c.nebula.rx} ry={c.nebula.ry} fill={`url(#nebula-${c.unit.id})`} />
      ))}

      <Planets height={sky.height} />

      {sky.dust.map((d, i) => (
        <circle
          key={i}
          cx={d.x.toFixed(1)}
          cy={d.y.toFixed(1)}
          r={d.r.toFixed(2)}
          className={d.twinkle ? 'sky-dust is-twinkle' : 'sky-dust'}
          style={{ animationDelay: `${(i % 9) * 0.45}s` }}
        />
      ))}

      <g transform="translate(318 46)" className="sky-moon">
        <circle r="26" className="sky-moon-glow" />
        <circle r="16" mask="url(#sky-crescent)" className="sky-moon-body" />
      </g>

      {lines.map(({ from, to, sameUnit, state, color }) => (
        <line
          key={to.lesson.id}
          x1={from.x.toFixed(1)}
          y1={from.y.toFixed(1)}
          x2={to.x.toFixed(1)}
          y2={to.y.toFixed(1)}
          className={`sky-line is-${state}${sameUnit ? '' : ' is-between'}`}
          style={{ '--u': color } as CSSProperties}
        />
      ))}

      <VillageHorizon y={sky.height - 100} />
    </svg>
  );
}
