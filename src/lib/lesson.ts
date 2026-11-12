import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Fill, Lesson, LessonPart, Sentence, Vocab } from '../types';
import { tokens } from './answer';
import { sample, shuffle, uniqueBy } from './random';
import { wordInSentence } from './wordInSentence';
import type { Level } from './difficulty';
import { unitReview } from './unitReview';

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

/** How hard a kind of question is, for the practice part's order. */
const RANK: Record<ExerciseBody['kind'], number> = {
  select: 0, match: 0, hearWord: 1, choice: 2, hear: 3, listen: 4, translate: 5, fill: 6, gaps: 7,
  grammar: 8, dialog: 9, type: 10, dictate: 11, speak: 12,
};

function generate(
  vocab: Vocab[],
  sentences: Sentence[],
  fills: Fill[],
  vocabPool: Vocab[],
  sentencePool: Sentence[],
  extras: Extras = {},
  speak = false,
  level: Level = 'normal',
  review: ExerciseBody[] = [],
): Exercise[] {
  const words = uniqueBy(vocab, (w) => w.bn);
  // Every new word (5 in a lesson) is picked once (and heard when tapped).
  const intro: ExerciseBody[] = sample(words, 5).map((word) => ({
    kind: 'select',
    word,
    // Wrong choices are the lesson's other new words when it has enough, so each new word is seen again and again.
    choices: shuffle([word, ...sample(uniqueBy(words.length >= 3 ? words : vocabPool, (o) => o.bn).filter((o) => o.bn !== word.bn), 2)]),
  }));

  // Learn: pick each new word, then match them all.
  if (words.length >= 3) intro.push({ kind: 'match', pairs: sample(words, 5) });
  const rest: ExerciseBody[] = [];
  // Hear a new word or letter, nothing written, and pick it: the ear learns it too.
  if (words.length >= 3)
    for (const word of sample(words, 2))
      rest.push({ kind: 'hearWord', word, choices: shuffle([word, ...sample(words.filter((o) => o.bn !== word.bn && o.en !== word.en), 2)]) });
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
  // A second look at the new words near the end (match all, pick three again), so each is seen 6+ times.
  const again: ExerciseBody[] = [];
  if (words.length >= 3) {
    again.push({ kind: 'match', pairs: shuffle(words).slice(0, 5) });
    for (const word of sample(words, 3))
      again.push({ kind: 'select', word, choices: shuffle([word, ...sample(words.filter((o) => o.bn !== word.bn), 2)]) });
  }

  // Practice runs easy to hard: recognise, hear, read, build, write, say (mixed within each step).
  const practice = shuffle(rest).sort((a, b) => RANK[a.kind] - RANK[b.kind]);
  const parts: [ExerciseBody[], LessonPart][] = [
    [intro, 'learn'],
    [practice, 'practice'],
    [[...again, ...review], 'review'],
  ];
  return parts.flatMap(([list, part]) => list.map((ex) => ({ ...ex, part }))).map((ex, i) => ({ ...ex, id: `ex${i}` }));
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
    unitReview(unit, unit.lessons.indexOf(lesson)),
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
