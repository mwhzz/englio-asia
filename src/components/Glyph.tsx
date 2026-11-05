// Englio's own icons (not copies of a system set): rounded outlines on a 24 px grid, and in most of them
// one small solid dot, like the speech bubble in the logo. Each icon is outline paths (s), solid shapes (f)
// and dots (d: [cx, cy, r]), all drawn in currentColor.
interface Icon {
  s?: string[];
  f?: string[];
  d?: [number, number, number][];
}

const ICONS = {
  // Tabs
  path: { s: ['M8 17a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM16 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', 'M10.4 18.8c2.8-.8 5.1-2 5.5-4.4M15.9 9.6c-.4-2.4-2.6-3.6-5.3-4.4'], d: [[8, 4.5, 3]] },
  chat: { s: ['M4 11a7 7 0 0 1 7-7h2a7 7 0 0 1 0 14h-3l-4 3v-4.2A7 7 0 0 1 4 11z', 'M9.5 9.5v3M12.5 8v6'], d: [[15.5, 11, 1.3]] },
  letters: { s: ['M2.5 19 7.5 5.5 12.5 19M4.5 14h6', 'M18 12.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6z', 'M21.3 11.5v7.5'] },
  person: { s: ['M10.5 3.5h3a7 7 0 0 1 7 7v3a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7v-3a7 7 0 0 1 7-7z', 'M8.5 14.5c1.8 2 5.2 2 7 0'], d: [[9, 10, 1.3], [15, 10, 1.3]] },
  // Streak, XP, hearts
  flame: {
    s: ['M12 2.5c1 3.5 6 6 6 11.5a6 6 0 0 1-12 0c0-3 1.6-4.8 3-6 .2 2 1 3 2 3.5-.6-3.4.2-6.4 1-9z'],
    f: ['M12 20a2.4 2.4 0 0 1-2.4-2.4c0-1.6 1.4-2.4 2.4-4 1 1.6 2.4 2.4 2.4 4A2.4 2.4 0 0 1 12 20z'],
  },
  gem: { s: ['M7 3.5h10l4 5.5-9 11.5L3 9z', 'M3 9h18M9.5 3.5 12 9l2.5-5.5'], d: [[12, 9, 1.6]] },
  heart: { s: ['M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8 2.9C20 15.3 12 20 12 20z'], d: [[8.3, 9.6, 1.4]] },
  // Everything else
  bolt: { s: ['M13.5 2.5 5 13.5h6.5L10.5 21.5 19 10.5h-6.5z'] },
  play: { f: ['M8 5.5v13c0 .8.9 1.3 1.6.8l9.5-6.5a1 1 0 0 0 0-1.6L9.6 4.7C8.9 4.2 8 4.7 8 5.5z'] },
  home: { s: ['M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z', 'M10 20.5v-5h4v5'], d: [[12, 10.5, 1.3]] },
  dumbbell: { s: ['M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11'], d: [[12, 12, 1.6]] },
  check: { s: ['M5 12.5l4.5 4.5L19 7.5'] },
  lock: {
    s: ['M7.5 10h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z', 'M8 10V7.5a4 4 0 0 1 8 0V10'],
    d: [[12, 15.5, 1.6]],
  },
  trophy: { s: ['M7 4h10v5a5 5 0 0 1-10 0z', 'M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 14v3.5M8.5 20.5h7'], d: [[12, 8.5, 1.4]] },
  book: { s: ['M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z', 'M12 6.5V20'], d: [[16.3, 9.5, 1.2]] },
  star: { f: ['M12 2.8l2.7 5.6 6.1.8-4.4 4.2 1.1 6.1L12 16.6l-5.5 2.9 1.1-6.1-4.4-4.2 6.1-.8z'] },
  'star-outline': { s: ['M12 3.5l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.2l-5 2.7 1-5.6-4.1-3.9 5.6-.7z'], d: [[12, 11.8, 1.4]] },
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
} satisfies Record<string, Icon>;

export type GlyphName = keyof typeof ICONS;

export function Glyph({ name, size = 18, className }: { name: GlyphName; size?: number; className?: string }) {
  const icon: Icon = ICONS[name];
  // Thin strokes vanish at small sizes; thicken them a little there.
  const width = size <= 16 ? 2.3 : 2;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      {icon.s?.map((d) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {icon.f?.map((d) => <path key={d} d={d} fill="currentColor" />)}
      {icon.d?.map(([cx, cy, r]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" />)}
    </svg>
  );
}
