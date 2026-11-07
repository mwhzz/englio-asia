import type { Progress } from './progress';

/**
 * How hard a learner's lessons are, from how well their recent lessons went (`skill`, a running average of
 * right answers, 0 to 1): struggling learners get more picking (tiles, choices) and no dictation; strong
 * ones get more typing and dictation. New learners start in the middle.
 */
export type Level = 'easy' | 'normal' | 'hard';

/** The new running accuracy after a lesson with `right` of `asked` answered right (recent lessons count most). */
export function nextSkill(skill: number | undefined, right: number, asked: number): number {
  if (asked <= 0) return skill ?? 0.75;
  const accuracy = right / asked;
  return Math.round(((skill ?? 0.75) * 0.7 + accuracy * 0.3) * 1000) / 1000;
}

export function levelFor(p: Pick<Progress, 'skill' | 'completed'>): Level {
  const skill = p.skill ?? 0.75;
  if (skill < 0.6) return 'easy';
  if (skill >= 0.9 && Object.keys(p.completed ?? {}).length >= 3) return 'hard';
  return 'normal';
}
