import { ALL_LESSONS } from '../data/course';
import type { Exercise, ExerciseBody, Fill, Lesson, Sentence, Vocab } from '../types';
import { tokens } from './answer';
import { sample, shuffle, uniqueBy } from './random';

// One sentence exercise per sentence, cycling through these kinds.
const SENTENCE_KINDS = ['translate', 'listen', 'translate', 'choice', 'type'] as const;

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
function extraExercises(extras: Extras, sentences: Sentence[], speak = false): ExerciseBody[] {
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
  if (dictate) out.push({ kind: 'dictate', sentence: dictate });
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
    rest.push(sentenceExercise(SENTENCE_KINDS[i % SENTENCE_KINDS.length], sentence, sentencePool));
  });
  for (const fill of sample(fills, 2)) rest.push({ kind: 'fill', fill: { ...fill, options: shuffle(fill.options) } });
  rest.push(...extraExercises(extras, sentences, speak));

  return [...intro, ...shuffle(rest)].map((ex, i) => ({ ...ex, id: `ex${i}` }));
}

/** A lesson's exercises; `speak` adds a speaking exercise (only when the device can recognise speech). */
export function buildLesson(lessonId: string, { speak = false } = {}): Exercise[] {
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
  );
}

/** A review session mixing material from every completed lesson. */
export function buildPractice(completed: Record<string, number>): Exercise[] {
  const lessons = ALL_LESSONS.map((x) => x.lesson).filter((l) => completed[l.id]);
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
