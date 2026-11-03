import type { Exercise, Unit } from '../types';
import type { Progress } from './progress';
import { sample, shuffle, uniqueBy } from './random';

/** Two quick questions per unit: pick the English word for a Bangla one, then the meaning of a sentence. */
export interface PlacementRound {
  unitIndex: number;
  exercises: Exercise[];
}

export function buildPlacement(units: Unit[]): PlacementRound[] {
  return units
    .map((unit, unitIndex) => {
      const vocab = uniqueBy(
        unit.lessons.flatMap((l) => l.vocab),
        (v) => v.bn,
      );
      const sentences = uniqueBy(
        unit.lessons.flatMap((l) => l.sentences),
        (s) => s.bn,
      );
      if (vocab.length < 3 || sentences.length < 3) return null;
      const [word] = sample(vocab, 1);
      const [sentence] = sample(sentences, 1);
      const exercises: Exercise[] = [
        { id: `p${unitIndex}a`, kind: 'select', word, choices: shuffle([word, ...sample(vocab.filter((v) => v !== word), 2)]) },
        {
          id: `p${unitIndex}b`,
          kind: 'choice',
          sentence,
          options: shuffle([sentence.bn, ...sample(sentences.filter((s) => s !== sentence), 2).map((s) => s.bn)]),
        },
      ];
      return { unitIndex, exercises };
    })
    .filter((r): r is PlacementRound => r !== null);
}

/** Marks every lesson of the units before `startUnit` as done, without XP (the learner already knows them). */
export function skipUnits(p: Progress, units: Unit[], startUnit: number): Progress {
  const completed = { ...p.completed };
  for (const unit of units.slice(0, startUnit)) for (const l of unit.lessons) completed[l.id] = completed[l.id] || 1;
  return { ...p, completed, placementTaken: true };
}
