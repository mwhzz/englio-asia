import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Sentence, Vocab } from '../types';
import { dayKey, shiftDay } from './days';
import { sentenceExercise } from './lesson';
import type { Progress } from './progress';
import { sample, shuffle, uniqueBy } from './random';

/** Days until a missed item comes back, step by step; after the last step it counts as learned. */
export const INTERVALS = [1, 3, 7, 14];

/** The word or sentence an exercise is about (matching, blanks and grammar aren't tracked). */
export function reviewKey(ex: Exercise): string | null {
  switch (ex.kind) {
    case 'select':
      return `w:${ex.word.en}`;
    case 'translate':
    case 'listen':
    case 'choice':
    case 'type':
    case 'dictate':
      return `s:${ex.sentence.en}`;
    default:
      return null;
  }
}

/** Missed: comes back tomorrow, starting the steps again. */
export function noteMistake(p: Progress, key: string, today = dayKey()): Progress {
  return { ...p, review: { ...p.review, [key]: { due: shiftDay(today, INTERVALS[0]), step: 0 } } };
}

/** Right again: the next gap is longer; after the last one the item leaves the review list. */
export function noteRight(p: Progress, key: string, today = dayKey()): Progress {
  const item = p.review?.[key];
  if (!item) return p;
  const review = { ...p.review };
  const step = item.step + 1;
  if (step >= INTERVALS.length) delete review[key];
  else review[key] = { due: shiftDay(today, INTERVALS[step]), step };
  return { ...p, review };
}

export function dueKeys(p: Progress, today = dayKey()): string[] {
  return Object.entries(p.review ?? {})
    .filter(([, item]) => item.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([key]) => key);
}

const SENTENCE_KINDS = ['translate', 'choice', 'type', 'listen'] as const;

/** Up to 10 exercises for the items due today, each asked a different way than a plain repeat. */
export function buildReview(p: Progress, today = dayKey()): Exercise[] {
  const vocab = uniqueBy(
    ALL_LESSONS.flatMap((x) => x.lesson.vocab),
    (v) => v.en,
  );
  const sentences = uniqueBy(
    ALL_LESSONS.flatMap((x) => x.lesson.sentences),
    (s) => s.en,
  );
  const bodies: ExerciseBody[] = [];
  dueKeys(p, today)
    .slice(0, 10)
    .forEach((key, i) => {
      const en = key.slice(2);
      if (key.startsWith('w:')) {
        const word = vocab.find((v) => v.en === en);
        if (word) bodies.push(selectFor(word, vocab));
      } else {
        const sentence = sentences.find((s) => s.en === en);
        if (sentence) bodies.push(sentenceExercise(SENTENCE_KINDS[i % SENTENCE_KINDS.length], sentence, sentences as Sentence[]));
      }
    });
  return shuffle(bodies).map((b, i) => ({ ...b, id: `r${i}` }));
}

function selectFor(word: Vocab, pool: Vocab[]): ExerciseBody {
  const others = sample(
    uniqueBy(pool, (v) => v.bn).filter((v) => v.bn !== word.bn),
    2,
  );
  return { kind: 'select', word, choices: shuffle([word, ...others]) };
}
