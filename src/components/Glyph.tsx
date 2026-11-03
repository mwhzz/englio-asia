// Small SVG icons (SF Symbols-like), used instead of emoji in the UI.
const PATHS = {
  flame:
    'M12 2c.4 3.3-1 5-2.6 6.8C7.7 10.7 6 12.6 6 15.5A6 6 0 0 0 12 22a6 6 0 0 0 6-6.3c0-2.6-1.3-4.3-2.4-5.7-.3 1.5-1 2.6-2.1 3.2.3-3.6-.5-7.4-1.5-11.2z',
  bolt: 'M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.6L13.5 2z',
  heart: 'M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.1 8 21.6 11.6 19.5 16.4 12 21 12 21z',
  play: 'M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z',
  home: 'M12 3.2 2.6 11a1 1 0 0 0 1.3 1.5l.6-.5V20a1.5 1.5 0 0 0 1.5 1.5h3.8v-5.8h4.4v5.8H18a1.5 1.5 0 0 0 1.5-1.5v-8l.6.5a1 1 0 0 0 1.3-1.5L12 3.2z',
  person: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.5-8 5.6 0 .8.6 1.4 1.4 1.4h13.2c.8 0 1.4-.6 1.4-1.4 0-3.1-3.6-5.6-8-5.6z',
  dumbbell:
    'M3 9h2V7.5A1.5 1.5 0 0 1 6.5 6h1A1.5 1.5 0 0 1 9 7.5V11h6V7.5A1.5 1.5 0 0 1 16.5 6h1A1.5 1.5 0 0 1 19 7.5V9h2v6h-2v1.5a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5V13H9v3.5A1.5 1.5 0 0 1 7.5 18h-1A1.5 1.5 0 0 1 5 16.5V15H3V9z',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10h1zm2 0h6V7a3 3 0 0 0-6 0v3z',
  trophy: 'M6 3h12v5a6 6 0 0 1-5 5.9V17h4v3H7v-3h4v-3.1A6 6 0 0 1 6 8V3zM3 5h2v3a3 3 0 0 1-2-2.8V5zm16 0h2v.2A3 3 0 0 1 19 8V5z',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 20.5v-15zM13 3h4.5A2.5 2.5 0 0 1 20 5.5v15a2.5 2.5 0 0 0-2.5-1.5H13V3z',
  star: 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8z',
  'star-outline': 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8z',
  close: 'M6 6l12 12M18 6 6 18',
  mic: 'M12 2.5a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 0 0 7 0V6A3.5 3.5 0 0 0 12 2.5zM5.5 11a1 1 0 0 1 2 0 4.5 4.5 0 0 0 9 0 1 1 0 0 1 2 0 6.5 6.5 0 0 1-5.5 6.4V20h2.5a1 1 0 0 1 0 2h-7a1 1 0 0 1 0-2H11v-2.6A6.5 6.5 0 0 1 5.5 11z',
  moon: 'M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z',
  letters: 'M4 20 10 4h1.6l6 16M6.4 14h8.8M18.5 9.5v6.2c0 2.4 2.6 3.3 3.5 1.6',
  bookmark: 'M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4.2L5 21V4.5A1.5 1.5 0 0 1 6.5 3z',
  back: 'M15 5 8 12l7 7',
  pencil: 'M4 16.8V20h3.2L17.6 9.6l-3.2-3.2L4 16.8zM19.7 7.5a1 1 0 0 0 0-1.4l-1.8-1.8a1 1 0 0 0-1.4 0l-1.3 1.3 3.2 3.2 1.3-1.3z',
  shuffle: 'M4 7h3.5c2 0 3 1 4 2.6l1 1.8c1 1.6 2 2.6 4 2.6H20M17 4l3 3-3 3M4 17h3.5c1.4 0 2.3-.5 3-1.3M13.5 8.3c.7-.8 1.6-1.3 3-1.3M17 14l3 3-3 3',
  chevron: 'M6.5 9.5 12 15l5.5-5.5',
  speaker: 'M4 9.5h3.2L12 5.5v13l-4.8-4H4zM15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5v5l3 2',
  target: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z',
} as const;

// Drawn as outlines; everything else is filled.
const STROKED = new Set<string>(['check', 'chevron', 'back', 'shuffle', 'letters', 'star-outline', 'close', 'speaker', 'clock', 'target']);

export type GlyphName = keyof typeof PATHS;

export function Glyph({ name, size = 18, className }: { name: GlyphName; size?: number; className?: string }) {
  const stroke = STROKED.has(name);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d={PATHS[name]}
        fill={stroke ? 'none' : 'currentColor'}
        stroke={stroke ? 'currentColor' : undefined}
        strokeWidth={stroke ? (name === 'star-outline' ? 1.8 : 2.4) : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
