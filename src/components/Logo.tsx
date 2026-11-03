/** The Englio mark (a speech bubble with an "E" on a chunky green tile) plus the wordmark. */
export function Logo({ size = 34, word = true }: { size?: number; word?: boolean }) {
  return (
    <span className="logo" style={{ fontSize: size * 0.68 }}>
      <svg viewBox="0 0 40 43" width={size} height={(size * 43) / 40} aria-hidden="true" className="logo-mark">
        <defs>
          <linearGradient id="logo-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5be07f" />
            <stop offset="1" stopColor="#34c759" />
          </linearGradient>
        </defs>
        <rect y="3" width="40" height="40" rx="11" fill="#248a3d" />
        <rect width="40" height="40" rx="11" fill="url(#logo-face)" />
        <path
          d="M14 9h12a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6h-8l-5.5 4.5v-4.9A6 6 0 0 1 8 22v-7a6 6 0 0 1 6-6z"
          fill="#fff"
        />
        <path d="M23.5 13.5h-7v10h7M16.5 18.5H22" fill="none" stroke="#248a3d" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {word && (
        <span className="logo-word">
          Engl<span>io</span>
        </span>
      )}
    </span>
  );
}
