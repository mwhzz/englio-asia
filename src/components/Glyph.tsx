// Englio's own icons (not copies of a system set): rounded outlines on a 24 px grid, most with one small solid
// dot, like the speech bubble in the logo. Each icon is drawn in currentColor from:
//   t  soft fills behind the outline, at low opacity (the "duotone" look of the colourful icons)
//   f  solid shapes
//   s  outlines
//   d  dots [cx, cy, r]
//   c  "cut-out" lines drawn in white on top (for the solid tab icons)
// The tab icons also have a solid version for the selected tab (SOLID, used with `filled`).
interface Icon {
  t?: string[];
  f?: string[];
  s?: string[];
  d?: [number, number, number][];
  c?: string[];
  /** Outline width, when this icon needs a heavier line than the rest. */
  w?: number;
}

const FLAME = 'M12 2.5c1 3.5 6 6 6 11.5a6 6 0 0 1-12 0c0-3 1.6-4.8 3-6 .2 2 1 3 2 3.5-.6-3.4.2-6.4 1-9z';
const GEM = 'M7 3.5h10l4 5.5-9 11.5L3 9z';
export const HEART_PATH = 'M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8 2.9C20 15.3 12 20 12 20z';
const CUP = 'M7 4h10v5a5 5 0 0 1-10 0z';
const STAR = 'M12 3.5l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.2l-5 2.7 1-5.6-4.1-3.9 5.6-.7z';
const BELL = 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z';
const BUBBLE = 'M4 11a7 7 0 0 1 7-7h2a7 7 0 0 1 0 14h-3l-4 3v-4.2A7 7 0 0 1 4 11z';
const FACE = 'M10.5 3.5h3a7 7 0 0 1 7 7v3a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7v-3a7 7 0 0 1 7-7z';
const PATH_LINE = 'M10.4 18.8c2.8-.8 5.1-2 5.5-4.4M15.9 9.6c-.4-2.4-2.6-3.6-5.3-4.4';
const LETTERS = ['M2.5 19 7.5 5.5 12.5 19M4.5 14h6', 'M18 12.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6z', 'M21.3 11.5v7.5'];

const ICONS = {
  // Tabs
  path: { s: ['M8 17a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM16 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', PATH_LINE], d: [[8, 4.5, 3]] },
  chat: { s: [BUBBLE, 'M9.5 9.5v3M12.5 8v6'], d: [[15.5, 11, 1.3]] },
  letters: { s: LETTERS },
  person: { s: [FACE, 'M8.5 14.5c1.8 2 5.2 2 7 0'], d: [[9, 10, 1.3], [15, 10, 1.3]] },
  // Streak, XP, hearts
  flame: { t: [FLAME], s: [FLAME], f: ['M12 20a2.4 2.4 0 0 1-2.4-2.4c0-1.6 1.4-2.4 2.4-4 1 1.6 2.4 2.4 2.4 4A2.4 2.4 0 0 1 12 20z'] },
  gem: { t: [GEM], s: [GEM, 'M3 9h18M9.5 3.5 12 9l2.5-5.5'], d: [[12, 9, 1.6]] },
  heart: { t: [HEART_PATH], s: [HEART_PATH], d: [[8.3, 9.6, 1.4]] },
  // Everything else
  bolt: { t: ['M13.5 2.5 5 13.5h6.5L10.5 21.5 19 10.5h-6.5z'], s: ['M13.5 2.5 5 13.5h6.5L10.5 21.5 19 10.5h-6.5z'] },
  play: { f: ['M8 5.5v13c0 .8.9 1.3 1.6.8l9.5-6.5a1 1 0 0 0 0-1.6L9.6 4.7C8.9 4.2 8 4.7 8 5.5z'] },
  home: { s: ['M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z', 'M10 20.5v-5h4v5'], d: [[12, 10.5, 1.3]] },
  dumbbell: { s: ['M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11'], d: [[12, 12, 1.6]] },
  check: { s: ['M5 12.5l4.5 4.5L19 7.5'] },
  lock: {
    t: ['M7.5 10h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z'],
    s: ['M7.5 10h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z', 'M8 10V7.5a4 4 0 0 1 8 0V10'],
    d: [[12, 15.5, 1.6]],
  },
  trophy: { t: [CUP], s: [CUP, 'M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 14v3.5M8.5 20.5h7'], d: [[12, 8.5, 1.4]] },
  book: { s: ['M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z', 'M12 6.5V20'], d: [[16.3, 9.5, 1.2]] },
  star: { f: ['M12 2.8l2.7 5.6 6.1.8-4.4 4.2 1.1 6.1L12 16.6l-5.5 2.9 1.1-6.1-4.4-4.2 6.1-.8z'] },
  'star-outline': { t: [STAR], s: [STAR], d: [[12, 11.8, 1.4]] },
  close: { s: ['M6.5 6.5l11 11M17.5 6.5l-11 11'] },
  mic: { s: ['M12 3a3.5 3.5 0 0 1 3.5 3.5v4a3.5 3.5 0 0 1-7 0v-4A3.5 3.5 0 0 1 12 3z', 'M5 11a7 7 0 0 0 14 0M12 18v3'], d: [[12, 7.5, 1.3]] },
  moon: { s: ['M18.5 14.5A7.5 7.5 0 1 1 9.5 5.5a6 6 0 0 0 9 9z'], d: [[17, 6, 1.4]] },
  bookmark: { s: ['M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.5L12 16.5l-6.5 4V5A1.5 1.5 0 0 1 7 3.5z'], d: [[12, 9, 1.5]] },
  back: { s: ['M14.5 5.5 8 12l6.5 6.5'] },
  pencil: { s: ['M4.5 19.5 5.5 15 15.5 5a2.1 2.1 0 0 1 3 3l-10 10z', 'M13.5 7l3 3'], d: [[5.2, 18.8, 1.2]] },
  shuffle: { s: ['M4 7h4c4 0 4 10 8 10h4M4 17h4c1.5 0 2.4-1.4 3.1-3M13 10c.7-1.6 1.6-3 3-3h4M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5'] },
  chevron: { s: ['M6.5 9.5 12 15l5.5-5.5'] },
  speaker: { s: ['M4 10h3l4.5-4v12L7 14H4z', 'M15 9.5a3.5 3.5 0 0 1 0 5M17.8 7a7 7 0 0 1 0 10'], d: [[5.5, 12, 0.9]] },
  clock: { s: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M12 7v5l3 2'], d: [[12, 12, 1.3]] },
  target: { s: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z'], d: [[12, 12, 1.5]] },
  search: { s: ['M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z', 'M15.5 15.5 20 20'], d: [[10.5, 10.5, 1.3]] },
  plus: { s: ['M12 5v14M5 12h14'] },
  minus: { s: ['M5 12h14'] },
  expand: { s: ['M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5'] },
  bell: { t: [BELL], s: [BELL, 'M10 21h4'], d: [[12, 3, 1.3]] },
  chart: { s: ['M4 20h16', 'M7 16v-4M12 16V8M17 16v-6'], d: [[17, 5.5, 1.5]] },
  gear: {
    s: ['M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6', 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z'],
    d: [[12, 12, 1.5]],
  },
  alert: { t: ['M10.3 4.2a2 2 0 0 1 3.4 0l7.2 12.6a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3z'], s: ['M10.3 4.2a2 2 0 0 1 3.4 0l7.2 12.6a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3z', 'M12 9.5v4'], d: [[12, 16.6, 1.2]] },
  people: { s: ['M9 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM3 20a6 6 0 0 1 12 0', 'M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.3a6 6 0 0 1 3 5.2'], d: [[9, 7.5, 1.1]] },
  more: { d: [[5.5, 12, 1.8], [12, 12, 1.8], [18.5, 12, 1.8]] },
  upload: { s: ['M12 15V4.5M7.5 9 12 4.5 16.5 9', 'M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14'] },
  globe: { s: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M3.5 9.5h17M3.5 14.5h17', 'M12 3c-2.6 2.6-3.8 5.6-3.8 9s1.2 6.4 3.8 9c2.6-2.6 3.8-5.6 3.8-9S14.6 5.6 12 3z'] },
} satisfies Record<string, Icon>;

export type GlyphName = keyof typeof ICONS;

// The selected tab's icon: solid, with the inner lines cut out in white.
const SOLID: Partial<Record<GlyphName, Icon>> = {
  path: { s: [PATH_LINE], d: [[8, 19.5, 3], [16, 12, 3], [8, 4.5, 3]] },
  chat: { f: [BUBBLE], s: [BUBBLE], c: ['M9.5 9.5v3M12.5 8v6M15.5 11h0'] },
  letters: { s: LETTERS, w: 2.7 },
  person: { f: [FACE], s: [FACE], c: ['M8.5 14.5c1.8 2 5.2 2 7 0', 'M9 10h0M15 10h0'] },
};

export function Glyph({ name, size = 18, className, filled = false }: { name: GlyphName; size?: number; className?: string; filled?: boolean }) {
  const icon: Icon = (filled && SOLID[name]) || ICONS[name];
  // Thin strokes vanish at small sizes; thicken them a little there.
  const width = icon.w ?? (size <= 16 ? 2.3 : 2);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      {icon.t?.map((d) => <path key={`t${d}`} d={d} fill="currentColor" fillOpacity={0.2} />)}
      {icon.f?.map((d) => <path key={`f${d}`} d={d} fill="currentColor" />)}
      {icon.s?.map((d) => (
        <path key={`s${d}`} d={d} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {icon.d?.map(([cx, cy, r]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" />)}
      {icon.c?.map((d) => (
        <path key={`c${d}`} d={d} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
