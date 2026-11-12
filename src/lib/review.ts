import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Sentence, Vocab } from '../types';
import { dayKey, shiftDay } from './days';
import { sentenceExercise } from './lesson';
import type { Progress } from './progress';
import { sample, shuffle, uniqueBy } from './random';

/** Days until a missed item comes back, step by step; after the last step it counts as learned. */
export const INTERVALS = [1, 2, 4, 7];

/** The word, sentence, blank or grammar point an exercise is about (matching isn't tracked). */
export function reviewKey(ex: Exercise): string | null {
  switch (ex.kind) {
    case 'select':
    case 'hearWord':
      return `w:${ex.word.en}`;
    case 'translate':
    case 'listen':
    case 'choice':
    case 'hear':
    case 'type':
    case 'dictate':
      return `s:${ex.sentence.en}`;
    // Weak spots beyond words: a missed blank or grammar question comes back too.
    case 'fill':
      return `f:${ex.fill.text}`;
    case 'grammar':
      return `g:${ex.grammar.correct}`;
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

/**
 * A finished lesson's new words join the review list, so every taught word comes back after 1, 2, 4 and
 * 7 days, not only the missed ones (docs/LEARNING_DESIGN.md). A word already on the list keeps its place.
 */
export function scheduleTaught(p: Progress, words: string[], today = dayKey()): Progress {
  const review = { ...p.review };
  for (const en of words) review[`w:${en}`] ??= { due: shiftDay(today, INTERVALS[0]), step: 0 };
  return { ...p, review };
}

export function dueKeys(p: Progress, today = dayKey()): string[] {
  return Object.entries(p.review ?? {})
    .filter(([, item]) => item.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([key]) => key);
}

const SENTENCE_KINDS = ['translate', 'choice', 'type', 'listen'] as const;

/**
 * Up to `max` exercises for the items due today, each asked a different way than a plain repeat; `skip`
 * leaves out items (a lesson's own words, when its review part is built).
 */
export function buildReview(p: Progress, today = dayKey(), { max = 10, skip = new Set<string>() } = {}): Exercise[] {
  const vocab = uniqueBy(
    ALL_LESSONS.flatMap((x) => x.lesson.vocab),
    (v) => v.en,
  );
  const sentences = uniqueBy(
    ALL_LESSONS.flatMap((x) => x.lesson.sentences),
    (s) => s.en,
  );
  const fills = ALL_LESSONS.flatMap((x) => x.lesson.fills);
  const grammars = ALL_LESSONS.flatMap((x) => x.lesson.grammar ?? []);
  const bodies: ExerciseBody[] = [];
  dueKeys(p, today)
    .filter((key) => !skip.has(key))
    .slice(0, max)
    .forEach((key, i) => {
      const en = key.slice(2);
      if (key.startsWith('f:')) {
        const fill = fills.find((f) => f.text === en);
        if (fill) bodies.push({ kind: 'fill', fill: { ...fill, options: shuffle(fill.options) } });
      } else if (key.startsWith('g:')) {
        const grammar = grammars.find((g) => g.correct === en);
        if (grammar) bodies.push({ kind: 'grammar', grammar, options: shuffle([grammar.correct, ...grammar.wrong]) });
      } else if (key.startsWith('w:')) {
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
