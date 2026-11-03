import type { CSSProperties, ReactNode } from 'react';
import type { WaterThing } from '../riverLayout';

function Ripple() {
  return <path d="M-7 0q3.5 -3 7 0t7 0" className="sc-ripple" />;
}

function Sparkle() {
  return <path d="M0 -3.5L.9 -.9 3.5 0 .9 .9 0 3.5 -.9 .9 -3.5 0 -.9 -.9Z" className="sc-sparkle" />;
}

/** কচুরিপানা: floating leaves with a lilac flower. */
function Hyacinth({ variant }: { variant: number }) {
  return (
    <g transform={`rotate(${variant * 360})`}>
      <ellipse cx="-4" cy="0" rx="4" ry="2.6" className="sc-hyacinth" />
      <ellipse cx="3" cy="-2" rx="3.6" ry="2.4" className="sc-hyacinth-dark" />
      <ellipse cx="2" cy="3" rx="3.4" ry="2.2" className="sc-hyacinth" />
      <circle cx="-1" cy="-1" r="1.6" className="sc-hyacinth-flower" />
      <circle cx="0.6" cy="-2.2" r="1.1" className="sc-hyacinth-flower" />
    </g>
  );
}

function Duck({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx="0" cy="0" rx="4.4" ry="2.4" className="sc-duck" />
      <circle cx="3.6" cy="-2.6" r="1.8" className="sc-duck" />
      <path d="M5.2 -2.6l2 .5-2 .6z" className="sc-beak" />
    </g>
  );
}

function Ducks() {
  return (
    <g className="sc-ducks">
      <Duck x={0} />
      <Duck x={-11} />
      <Duck x={-21} />
    </g>
  );
}

/** A small fishing nouka with a fisherman. */
function FishingBoat() {
  return (
    <g className="sc-fishing">
      <path d="M-14 -1 Q0 6 14 -1 L11 3 Q0 8 -11 3 Z" className="sc-nouka" />
      <path d="M-4 -1 q4 -6 9 0z" className="sc-nouka-roof" />
      <circle cx="9" cy="-6" r="1.6" className="sc-fisher" />
      <path d="M9 -4.5v4M9 -3l7 -9" className="sc-fisher-line" />
    </g>
  );
}

/** A clump of reeds where the sand meets the grass. */
function Reeds({ variant }: { variant: number }) {
  const lean = variant < 0.5 ? -1 : 1;
  return (
    <>
      <path d={`M-3 0q${lean} -6 ${lean * 2} -11M0 0q0 -7 ${lean} -13M3 0q${-lean} -5 ${-lean * 2} -9`} className="sc-reed" />
      <ellipse cx={lean * 1.5} cy="-12" rx="1.1" ry="2.6" className="sc-cattail" />
    </>
  );
}

/** A few pebbles on the sand. */
function Stones() {
  return (
    <>
      <ellipse cx="-3" cy="0" rx="2.6" ry="1.7" className="sc-stone" />
      <ellipse cx="2" cy="1" rx="1.9" ry="1.3" className="sc-stone-dark" />
      <ellipse cx="0" cy="-2" rx="1.4" ry="1" className="sc-stone" />
    </>
  );
}

/** Night only: moonlight on the water. */
function Glint({ variant }: { variant: number }) {
  return <ellipse cx="0" cy="0" rx={6 + variant * 8} ry="1.1" className="sc-glint" />;
}

const DRAW: Record<WaterThing['kind'], (t: WaterThing) => ReactNode> = {
  ripple: () => <Ripple />,
  sparkle: () => <Sparkle />,
  hyacinth: (t) => <Hyacinth variant={t.variant} />,
  ducks: () => <Ducks />,
  'fishing-boat': () => <FishingBoat />,
  reeds: (t) => <Reeds variant={t.variant} />,
  stones: () => <Stones />,
  glint: (t) => <Glint variant={t.variant} />,
};

/** Life on the water. Ripples drift and sparkles twinkle with staggered timing. */
export function WaterThings({ things }: { things: WaterThing[] }) {
  return (
    <g className="sc-water-things">
      {things.map((t, i) => (
        <g key={i} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`}>
          <g className={`sc-${t.kind}-wrap`} style={{ '--delay': `${(t.variant * 4).toFixed(2)}s` } as CSSProperties}>
            {DRAW[t.kind](t)}
          </g>
        </g>
      ))}
    </g>
  );
}
