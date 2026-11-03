import type { ClassLevel } from '../../data/classLevels';

/** The class numeral, or an icon for university (cap) and job (briefcase). */
export function LevelGlyph({ level, size }: { level: ClassLevel; size: number }) {
  if (level.short) return <span lang="bn">{level.short}</span>;
  const path =
    level.stage === 'university'
      ? 'M12 4 1.5 9 12 14l8.5-4.05V16h2V9L12 4zm-6 9.2V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-3.8l-6 2.86-6-2.86z'
      : 'M9 4h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v3H2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h6V6H9v1zM2 14h8v2h4v-2h8v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  );
}
