import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Vocab } from '../types';
import { dayKey } from './days';
import type { Progress } from './progress';
import { shuffle, uniqueBy } from './random';
import { buildReview, dueKeys } from './review';

/** Words that come back by matching, five to a match (four matches at most: a lesson teaches 5 words and each comes back 4 times). */
export const RETURNING_WORDS = 20;
/** Other due items (sentences, blanks, grammar, leftover words), asked one by one. */
export const RETURNING_OTHERS = 2;

/**
 * A lesson's "coming back" part: words and sentences from earlier lessons (or units) that are due today,
 * at the end of the lesson, so learning keeps coming back over the days (docs/LEARNING_DESIGN.md). Each
 * lesson teaches 5 words and each comes back 4 times, so words come back by matching, 5 at a time (heard
 * when tapped). The lesson's own words are left out: they're being learned right now.
 */
export function withReturning(exercises: Exercise[], p: Progress, lessonId: string, today = dayKey()): Exercise[] {
  const lesson = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.lesson;
  if (!lesson) return exercises;
  const own = new Set([...lesson.vocab.map((v) => `w:${v.en}`), ...lesson.sentences.map((s) => `s:${s.en}`)]);
  const due = dueKeys(p, today).filter((k) => !own.has(k));

  const vocab = new Map<string, Vocab>();
  for (const { lesson: l } of ALL_LESSONS) for (const v of l.vocab) if (!vocab.has(v.en)) vocab.set(v.en, v);
  const words = uniqueBy(
    due.filter((k) => k.startsWith('w:') && vocab.has(k.slice(2))).map((k) => vocab.get(k.slice(2))!),
    (v) => v.bn,
  ).slice(0, RETURNING_WORDS);

  const matches: ExerciseBody[] = [];
  const leftover: string[] = [];
  for (let i = 0; i < words.length; i += 5) {
    const group = words.slice(i, i + 5);
    if (group.length >= 3) matches.push({ kind: 'match', pairs: group });
    else leftover.push(...group.map((v) => `w:${v.en}`));
  }
  const matched = new Set(words.map((v) => `w:${v.en}`).filter((k) => !leftover.includes(k)));
  const others = due.filter((k) => !matched.has(k) && (!k.startsWith('w:') || leftover.includes(k)));
  const chosen = new Set(others.slice(0, RETURNING_OTHERS));
  const singles = buildReview(p, today, { max: RETURNING_OTHERS, skip: new Set(due.filter((k) => !chosen.has(k))) });

  return [...exercises, ...shuffle([...matches.map((m, i) => ({ ...m, id: `rm${i}` })), ...singles])];
}
