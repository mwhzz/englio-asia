import { LETTERS } from '../../data/letters';
import { sample, shuffle } from '../../lib/random';

export type GameKind = 'listen' | 'case' | 'order';

export interface Round {
  /** What to show (or say, for "listen"). */
  prompt: string;
  /** For "order": four letters in a row with one missing (null). */
  sequence?: (string | null)[];
  options: string[];
  answer: string;
}

const UPPERS = LETTERS.map((l) => l.upper);

/** The answer plus three other letters, shuffled. */
function withDistractors(answer: string, pool: string[]): string[] {
  return shuffle([answer, ...sample(pool.filter((x) => x !== answer), 3)]);
}

/**
 * Rounds for one game:
 * listen: hear a letter, tap it · case: match capital and small letters (alternating) · order: fill the gap in A B _ D.
 */
export function makeRounds(kind: GameKind, count = 8): Round[] {
  return sample(UPPERS, count).map((upper, i) => {
    if (kind === 'listen') return { prompt: upper, options: withDistractors(upper, UPPERS), answer: upper };
    if (kind === 'case') {
      const lowers = UPPERS.map((u) => u.toLowerCase());
      return i % 2
        ? { prompt: upper.toLowerCase(), options: withDistractors(upper, UPPERS), answer: upper }
        : { prompt: upper, options: withDistractors(upper.toLowerCase(), lowers), answer: upper.toLowerCase() };
    }
    // order: a run of four letters around this one, with this one missing.
    const at = UPPERS.indexOf(upper);
    const start = Math.min(Math.max(at - Math.floor(Math.random() * 4), 0), UPPERS.length - 4);
    const sequence = UPPERS.slice(start, start + 4).map((u) => (u === upper ? null : u));
    return { prompt: upper, sequence, options: withDistractors(upper, UPPERS), answer: upper };
  });
}
