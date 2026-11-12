import type { Exercise } from '../types';
import { buildLesson } from './lesson';
import { recordLesson, type Progress } from './progress';
import { shuffle } from './random';
import { testUnit } from './sectionTest';

export const TEST_SIZE = 15;
/** Percent needed to pass and earn the certificate. */
export const PASS_SCORE = 80;
export const TEST_XP = 20;

/**
 * Fifteen questions from across a unit's lessons (matching is left out: it can't be got wrong), or a
 * section's units for its checkpoint (lib/sectionTest.ts).
 */
export function buildUnitTest(unitId: string): Exercise[] {
  const unit = testUnit(unitId)?.unit;
  if (!unit) throw new Error(`Unknown unit: ${unitId}`);
  const pool = unit.lessons.flatMap((l) => buildLesson(l.id)).filter((ex) => ex.kind !== 'match');
  const seen = new Set<string>();
  const picked = shuffle(pool).filter((ex) => {
    const key = JSON.stringify({ ...ex, id: '' });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return picked.slice(0, TEST_SIZE).map((ex, i) => ({ ...ex, id: `t${i}` }));
}

/** First-try score: each mistake costs one question (missed ones are asked again until right). */
export function testScore(total: number, mistakes: number): number {
  return Math.round((100 * Math.max(0, total - mistakes)) / Math.max(1, total));
}

/** Records a finished test: XP for taking it, and the certificate when it's a pass (keeping the best score). */
export function applyTest(p: Progress, unitId: string, score: number, today: string, seconds: number): Progress {
  const passed = score >= PASS_SCORE;
  const after = recordLesson(p, null, passed ? TEST_XP : 5, today, seconds);
  if (!passed) return after;
  const best = p.unitTests?.[unitId];
  return best && best.score >= score ? after : { ...after, unitTests: { ...p.unitTests, [unitId]: { score, date: today } } };
}
