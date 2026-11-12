import type { LessonPart } from '../../types';

const PARTS: { id: LessonPart; bn: string }[] = [
  { id: 'learn', bn: 'শেখো' },
  { id: 'practice', bn: 'অনুশীলন' },
  { id: 'review', bn: 'ফিরে আসা' },
];

/** Under the progress bar: the lesson's three parts, the one now lit, the ones done ticked off. */
export function LessonParts({ part }: { part: LessonPart | undefined }) {
  if (!part) return null;
  const now = PARTS.findIndex((p) => p.id === part);
  return (
    <ol className="lparts" aria-label="লেসনের ধাপ">
      {PARTS.map((p, i) => (
        <li key={p.id} className={i === now ? 'is-now' : i < now ? 'is-done' : undefined} aria-current={i === now ? 'step' : undefined} lang="bn">
          {p.bn}
        </li>
      ))}
    </ol>
  );
}
