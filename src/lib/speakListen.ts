import { ALL_LESSONS } from '../data/course';
import type { Dialog, Exercise, ExerciseBody, Sentence } from '../types';
import { tokens } from './answer';
import type { Progress } from './progress';
import { sample, shuffle, uniqueBy } from './random';

export const ROUND = 10;

/** What the learner has met: finished lessons' content, or the first unit's on day one. */
function learned(p: Progress) {
  const done = ALL_LESSONS.filter((x) => p.completed[x.lesson.id]).map((x) => x.lesson);
  const lessons = done.length ? done : ALL_LESSONS.filter((x) => x.unit === ALL_LESSONS[0].unit).map((x) => x.lesson);
  return {
    sentences: uniqueBy(
      lessons.flatMap((l) => l.sentences),
      (s) => s.en,
    ),
    words: uniqueBy(
      lessons.flatMap((l) => l.vocab),
      (v) => v.en,
    ),
    dialogs: lessons.flatMap((l) => l.dialogs ?? []),
  };
}

const withIds = (list: ExerciseBody[], prefix: string): Exercise[] => list.map((ex, i) => ({ ...ex, id: `${prefix}${i}` }));

/**
 * A listening round: hear a sentence and pick its meaning, arrange what you hear, or type it.
 * Nothing is shown in writing until it's answered.
 */
export function buildListening(p: Progress): Exercise[] {
  const { sentences } = learned(p);
  const picked = sample(sentences, ROUND);
  const out = picked.map((sentence, i): ExerciseBody => {
    const others = sentences.filter((s) => s.en !== sentence.en);
    if (i % 3 === 0) return { kind: 'hear', sentence, options: shuffle([sentence.bn, ...sample(others, 2).map((s) => s.bn)]) };
    if (i % 3 === 1) {
      const answer = tokens(sentence.en);
      const extra = sample(
        others.flatMap((s) => tokens(s.en)).filter((w) => !answer.includes(w)),
        3,
      );
      return { kind: 'listen', sentence, tiles: shuffle([...answer, ...new Set(extra)]) };
    }
    return { kind: 'dictate', sentence };
  });
  return withIds(out, 'ls');
}

/** A speaking round: short words first, then whole sentences, each said into the mic and scored word by word. */
export function buildSpeaking(p: Progress): Exercise[] {
  const { sentences, words } = learned(p);
  const asSentence = (w: { en: string; bn: string }): Sentence => ({ en: w.en, bn: w.bn, alt: [] });
  const list: Sentence[] = [...sample(words, 3).map(asSentence), ...sample(sentences, ROUND - 3)];
  return withIds(
    list.map((sentence) => ({ kind: 'speak', sentence })),
    'sp',
  );
}

/** Conversations to act out: the app says the other person's lines, the learner says theirs. */
export const conversationsFor = (p: Progress): Dialog[] => learned(p).dialogs;
