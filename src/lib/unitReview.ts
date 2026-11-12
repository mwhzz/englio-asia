import type { ExerciseBody, Unit, Vocab } from '../types';
import { sample, shuffle, uniqueBy } from './random';

/** Words in groups of five, for matching. */
function groups(words: Vocab[]): Vocab[][] {
  const out: Vocab[][] = [];
  for (let i = 0; i < words.length; i += 5) out.push(words.slice(i, i + 5));
  // A last group of one or two can't be matched: it joins the group before.
  if (out.length > 1 && out[out.length - 1].length < 3) out[out.length - 2].push(...out.pop()!);
  return out;
}

/**
 * Words from the unit's earlier lessons, asked again in this lesson, so every word keeps coming back
 * inside its unit (docs/LEARNING_DESIGN.md): every earlier word to match again (heard when tapped), five
 * at a time, and two older words to pick again. The first lesson of a unit has nothing to review.
 */
export function unitReview(unit: Unit, lessonIndex: number): ExerciseBody[] {
  if (lessonIndex <= 0) return [];
  const earlier = uniqueBy(unit.lessons.slice(0, lessonIndex).flatMap((l) => l.vocab), (w) => w.bn);
  const out: ExerciseBody[] = groups(shuffle(earlier))
    .filter((g) => g.length >= 3)
    .map((pairs) => ({ kind: 'match', pairs }));
  for (const word of sample(earlier, 2)) {
    const others = sample(earlier.filter((o) => o.bn !== word.bn), 2);
    if (others.length === 2) out.push({ kind: 'select', word, choices: shuffle([word, ...others]) });
  }
  return out;
}
