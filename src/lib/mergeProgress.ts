import type { Progress } from './progress';

type Counts = Record<string, number>;

const maxEach = (a: Counts = {}, b: Counts = {}): Counts => {
  const out: Counts = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};
const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])].sort();
const sum = (c: Counts = {}) => Object.values(c).reduce((n, v) => n + v, 0);

/**
 * Two copies of one learner's progress made one (two phones, or a phone and the server), so nothing
 * done on either is lost: lessons, XP per day and things learned are combined; settings and the
 * profile come from the copy saved last. A deliberate reset wins over anything saved before it.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const resetA = a.resetAt ?? 0;
  const resetB = b.resetAt ?? 0;
  if (resetA !== resetB) {
    // One copy was reset since the other last synced: the reset one is right.
    return resetA > resetB ? a : b;
  }

  const [older, newer] = (a.savedAt ?? 0) <= (b.savedAt ?? 0) ? [a, b] : [b, a];
  const xpByDay = maxEach(a.xpByDay, b.xpByDay);
  // XP earned before XP was counted per day stays; everything since comes from the days.
  const before = Math.max((a.xp ?? 0) - sum(a.xpByDay), (b.xp ?? 0) - sum(b.xpByDay), 0);
  const unitTests = { ...older.unitTests };
  for (const [unit, test] of Object.entries(newer.unitTests ?? {})) if (!unitTests[unit] || test.score > unitTests[unit].score) unitTests[unit] = test;
  // The streak belongs to whichever copy was active most recently (the longer one on the same day).
  // (Copies from older app versions may lack some fields, hence the ?? throughout.)
  const streakSide = (a.lastActiveDay ?? '') === (b.lastActiveDay ?? '') ? (a.streak >= b.streak ? a : b) : (a.lastActiveDay ?? '') > (b.lastActiveDay ?? '') ? a : b;

  return {
    ...older,
    ...newer,
    profile: newer.profile ?? older.profile,
    xp: before + sum(xpByDay),
    completed: maxEach(a.completed, b.completed),
    xpByDay,
    lessonsByDay: maxEach(a.lessonsByDay, b.lessonsByDay),
    secondsByDay: maxEach(a.secondsByDay, b.secondsByDay),
    streak: streakSide.streak,
    lastActiveDay: streakSide.lastActiveDay,
    lettersPracticed: union(a.lettersPracticed, b.lettersPracticed),
    grammarLearned: union(a.grammarLearned, b.grammarLearned),
    grammarSaved: newer.grammarSaved ?? older.grammarSaved,
    grammarLessonsDone: union(a.grammarLessonsDone, b.grammarLessonsDone),
    storiesRead: union(a.storiesRead, b.storiesRead),
    placementTaken: !!(a.placementTaken || b.placementTaken),
    review: { ...older.review, ...newer.review },
    unitTests,
    boardScores: maxEach(a.boardScores, b.boardScores),
    // Per day, the copy that practised more.
    boardDays: Object.fromEntries(
      [...new Set([...Object.keys(a.boardDays ?? {}), ...Object.keys(b.boardDays ?? {})])].map((day) => {
        const x = a.boardDays?.[day];
        const y = b.boardDays?.[day];
        return [day, !x ? y! : !y ? x : x.total >= y.total ? x : y];
      }),
    ),
    savedAt: Math.max(a.savedAt ?? 0, b.savedAt ?? 0),
    resetAt: resetA,
  };
}

/** JSON with object keys sorted, so the same progress always gives the same text. */
const stable = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? `{${Object.keys(v)
        .sort()
        .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
        .join(',')}}`
    : Array.isArray(v)
      ? `[${v.map(stable).join(',')}]`
      : JSON.stringify(v);

/** Whether two copies hold the same progress (ignoring when they were saved). */
export const sameProgress = (a: Progress, b: Progress) => stable({ ...a, savedAt: 0 }) === stable({ ...b, savedAt: 0 });
