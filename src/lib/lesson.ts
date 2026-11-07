import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Fill, Lesson, Sentence, Vocab } from '../types';
import { tokens } from './answer';
import { sample, shuffle, uniqueBy } from './random';
import { wordInSentence } from './wordInSentence';
import type { Level } from './difficulty';

// One sentence exercise per sentence, cycling through these kinds; easier and harder mixes by level (difficulty.ts).
const SENTENCE_KINDS = ['translate', 'listen', 'translate', 'choice', 'type'] as const;
const KINDS_BY_LEVEL: Record<Level, readonly (typeof SENTENCE_KINDS)[number][]> = {
  easy: ['translate', 'choice', 'listen', 'choice', 'translate'],
  normal: SENTENCE_KINDS,
  hard: ['type', 'listen', 'type', 'translate', 'choice'],
};

function distractorTiles(answer: string[], pool: Sentence[], n = 3): string[] {
  const used = new Set(answer.map((w) => w.toLowerCase()));
  const words = new Set<string>();
  for (const sentence of pool) {
    tokens(sentence.en).forEach((word, i) => {
      // Sentence-initial capitals would give the distractor away.
      const tile = i === 0 && word !== 'I' ? word.toLowerCase() : word;
      if (!used.has(tile.toLowerCase())) words.add(tile);
    });
  }
  return sample([...words], n);
}

export function sentenceExercise(kind: (typeof SENTENCE_KINDS)[number], sentence: Sentence, pool: Sentence[]): ExerciseBody {
  const others = pool.filter((o) => o.en !== sentence.en);
  switch (kind) {
    case 'translate':
    case 'listen': {
      const answer = tokens(sentence.en);
      return { kind, sentence, tiles: shuffle([...answer, ...distractorTiles(answer, others)]) };
    }
    case 'choice': {
      const wrong = sample(uniqueBy(others, (o) => o.bn).filter((o) => o.bn !== sentence.bn), 2);
      return { kind, sentence, options: shuffle([sentence.bn, ...wrong.map((o) => o.bn)]) };
    }
    case 'type':
      return { kind, sentence };
  }
}

/** Gaps, grammar points and conversations a lesson may have. */
type Extras = Pick<Lesson, 'gaps' | 'grammar' | 'dialogs'>;

/** At most one of each extra kind, plus a dictation of a short sentence (and, when the device can listen, one to say). */
function extraExercises(extras: Extras, sentences: Sentence[], speak = false, level: Level = 'normal'): ExerciseBody[] {
  const out: ExerciseBody[] = [];
  for (const gaps of sample(extras.gaps ?? [], 1)) {
    out.push({ kind: 'gaps', gaps, bank: shuffle([...gaps.answers, ...gaps.extra]) });
  }
  for (const grammar of sample(extras.grammar ?? [], 1)) {
    out.push({ kind: 'grammar', grammar, options: shuffle([grammar.correct, ...grammar.wrong]) });
  }
  for (const dialog of sample(extras.dialogs ?? [], 1)) {
    out.push({ kind: 'dialog', dialog, options: shuffle([dialog.lines[dialog.reply].en, ...dialog.wrong]) });
  }
  const short = sentences.filter((x) => tokens(x.en).length <= 5);
  const [dictate, spoken] = sample(short, 2);
  // Dictation is for learners who are doing well; a struggling one isn't asked to write from hearing.
  if (dictate && level !== 'easy') out.push({ kind: 'dictate', sentence: dictate });
  if (speak && (spoken ?? dictate)) out.push({ kind: 'speak', sentence: spoken ?? dictate });
  return out;
}

function generate(
  vocab: Vocab[],
  sentences: Sentence[],
  fills: Fill[],
  vocabPool: Vocab[],
  sentencePool: Sentence[],
  extras: Extras = {},
  speak = false,
  level: Level = 'normal',
): Exercise[] {
  const words = uniqueBy(vocab, (w) => w.bn);
  const intro: ExerciseBody[] = sample(words, 3).map((word) => ({
    kind: 'select',
    word,
    choices: shuffle([word, ...sample(uniqueBy(vocabPool, (o) => o.bn).filter((o) => o.bn !== word.bn), 2)]),
  }));

  const rest: ExerciseBody[] = [];
  if (words.length >= 3) rest.push({ kind: 'match', pairs: sample(words, 5) });
  shuffle(sentences).forEach((sentence, i) => {
    const kinds = KINDS_BY_LEVEL[level];
    rest.push(sentenceExercise(kinds[i % kinds.length], sentence, sentencePool));
  });
  for (const fill of sample(fills, 2)) rest.push({ kind: 'fill', fill: { ...fill, options: shuffle(fill.options) } });
  // New words again, now inside a sentence of the lesson: "Our house is ___." (at most two).
  const inSentences = intro
    .map((ex) => (ex.kind === 'select' ? wordInSentence(ex.word, shuffle(sentences), vocabPool) : null))
    .filter((fill): fill is Fill => fill !== null);
  for (const fill of inSentences.slice(0, 2)) rest.push({ kind: 'fill', fill: { ...fill, options: shuffle(fill.options) } });
  rest.push(...extraExercises(extras, sentences, speak, level));

  return [...intro, ...shuffle(rest)].map((ex, i) => ({ ...ex, id: `ex${i}` }));
}

/**
 * A lesson's exercises; `speak` adds a speaking exercise (only when the device can recognise speech), and
 * `level` makes it easier or harder (lib/difficulty.ts).
 */
export function buildLesson(lessonId: string, { speak = false, level = 'normal' as Level } = {}): Exercise[] {
  const found = ALL_LESSONS.find((x) => x.lesson.id === lessonId);
  if (!found) throw new Error(`Unknown lesson: ${lessonId}`);
  const { unit, lesson } = found;
  return generate(
    lesson.vocab,
    lesson.sentences,
    lesson.fills,
    unit.lessons.flatMap((l) => l.vocab),
    unit.lessons.flatMap((l) => l.sentences),
    lesson,
    speak,
    level,
  );
}

/** A review session mixing material from every completed lesson. */
export function buildPractice(completed: Record<string, number>): Exercise[] {
  const done = ALL_LESSONS.map((x) => x.lesson).filter((l) => completed[l.id]);
  // Nothing finished yet (a beginner out of hearts in lesson 1): practise the first lesson's words.
  const lessons = done.length ? done : ALL_LESSONS.slice(0, 1).map((x) => x.lesson);
  const vocab = lessons.flatMap((l) => l.vocab);
  const sentences = lessons.flatMap((l) => l.sentences);
  const fills = lessons.flatMap((l) => l.fills);
  const extras: Extras = {
    gaps: lessons.flatMap((l) => l.gaps ?? []),
    grammar: lessons.flatMap((l) => l.grammar ?? []),
    dialogs: lessons.flatMap((l) => l.dialogs ?? []),
  };
  return generate(sample(vocab, 8), sample(sentences, 5), fills, vocab, sentences, extras);
}
