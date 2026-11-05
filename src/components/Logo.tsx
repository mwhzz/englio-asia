/**
 * The Englio logo: the mark (the learning path: a start ring, the path, the goal) and the word with its dot.
 * Blue night on light screens, black-lime on dark ones (colours in styles/logo.css; brand rules in brand/README.md).
 */
export function Logo({ size = 34, word = true }: { size?: number; word?: boolean }) {
  return (
    <span className="logo" style={{ fontSize: size * 0.68 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="logo-mark">
        <rect width="100" height="100" rx="22.5" className="logo-tile" />
        <path d="M31 71c6-9 18-8 26-14s8-15 12-22" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="0.1 11" />
        <circle cx="26" cy="77" r="8" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="73" cy="26" r="11" className="logo-goal" />
      </svg>
      {word && (
        <span className="logo-word">
          Englio<span className="logo-dot" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
