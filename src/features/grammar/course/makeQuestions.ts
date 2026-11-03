import { CONJ_FILLS, DUALS, FORM_FILLS, NOUN_KINDS, parseSentence, POS_INFO, PRONOUN_FILLS, SENTENCES, WORDS } from '../../../data/grammarCourses/posBank';
import type { CourseLesson, Pos, QuestionKind, WrittenQuestion } from '../../../data/grammarCourses/types';
import { sample, shuffle } from '../../../lib/random';

export type CourseQuestion =
  | {
      kind: 'choice';
      prompt: string;
      /** The word or sentence the question is about. */
      card: string;
      /** A word in the card to underline. */
      mark?: string;
      options: string[];
      answer: string;
      why: string;
    }
  | {
      kind: 'tap';
      prompt: string;
      /** The sentence as words; untagged words (the, a, my…) can't be tapped. */
      words: { word: string; pos: Pos | null }[];
      target: Pos;
      why: string;
    };

const ORDER: Pos[] = ['n', 'pro', 'v', 'adj', 'adv', 'prep', 'conj', 'int'];
const label = (pos: Pos) => `${POS_INFO[pos].en} (${POS_INFO[pos].bn})`;
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const YES = 'হ্যাঁ';
const NO = 'না';

/** Up to four part-of-speech choices: the answer plus others the learner already knows (topped up in course order). */
function posOptions(answer: Pos, known: Pos[]): string[] {
  const others = shuffle(known.filter((p) => p !== answer));
  const extra = ORDER.filter((p) => p !== answer && !known.includes(p));
  return shuffle([answer, ...[...others, ...extra].slice(0, 3)]).map(label);
}

const wordsOf = (pos: Pos) => WORDS.filter((w) => w[1] === pos);
const sentencesWith = (pos: Pos) => SENTENCES.map(parseSentence).filter((s) => s.some((w) => w.pos === pos));
const why = (word: string, pos: Pos, bn?: string) => `"${word}"${bn ? ` (${bn})` : ''} একটা ${POS_INFO[pos].en}: ${POS_INFO[pos].hint}।`;

/** One question of `kind` about one of `targets`, with choices drawn from what the learner knows. */
export function makeQuestion(kind: QuestionKind, targets: Pos[], known: Pos[]): CourseQuestion {
  const target = pick(targets);

  switch (kind) {
    case 'is': {
      const yes = Math.random() < 0.5;
      const pool = yes ? wordsOf(target) : WORDS.filter((w) => w[1] !== target && (known.length > 1 ? known.includes(w[1]) : true));
      const [word, pos, bn] = pick(pool);
      return { kind: 'choice', prompt: `এই শব্দটা কি একটা ${POS_INFO[target].en} (${POS_INFO[target].bn})?`, card: word, options: [YES, NO], answer: yes ? YES : NO, why: why(word, pos, bn) };
    }
    case 'which': {
      if (Math.random() < 0.5) {
        const [word, pos, bn] = pick(wordsOf(target));
        return { kind: 'choice', prompt: 'এই শব্দটা কোন part of speech?', card: word, options: posOptions(pos, known), answer: label(pos), why: why(word, pos, bn) };
      }
      const sentence = pick(sentencesWith(target));
      const word = pick(sentence.filter((w) => w.pos === target)).word;
      return {
        kind: 'choice',
        prompt: 'দাগ দেওয়া শব্দটা কোন part of speech?',
        card: sentence.map((w) => w.word).join(' ').replace(/ ([.,!?])/g, '$1'),
        mark: word,
        options: posOptions(target, known),
        answer: label(target),
        why: why(word, target),
      };
    }
    case 'tap': {
      const words = pick(sentencesWith(target));
      const right = [...new Set(words.filter((w) => w.pos === target).map((w) => w.word))];
      return {
        kind: 'tap',
        prompt: `বাক্যের ${POS_INFO[target].en} (${POS_INFO[target].bn}) শব্দটা চাপো`,
        words,
        target,
        why: `এই বাক্যে ${POS_INFO[target].en}: ${right.join(', ')}। ${POS_INFO[target].en} ${POS_INFO[target].hint}।`,
      };
    }
    case 'nounKind': {
      const [word, proper] = pick(NOUN_KINDS);
      return {
        kind: 'choice',
        prompt: 'এটা কোন ধরনের noun?',
        card: word,
        options: ['Proper noun (নির্দিষ্ট নাম)', 'Common noun (সাধারণ নাম)'],
        answer: proper ? 'Proper noun (নির্দিষ্ট নাম)' : 'Common noun (সাধারণ নাম)',
        why: proper ? `"${word}" একটা নির্দিষ্ট নাম, তাই proper noun (বড় হাতের অক্ষরে শুরু)।` : `"${word}" যেকোনো একটাকে বোঝায়, তাই common noun।`,
      };
    }
    case 'pronounFill': {
      const [sentence, answer, wrong] = pick(PRONOUN_FILLS);
      return { kind: 'choice', prompt: 'খালি জায়গায় কোন pronoun বসবে?', card: sentence, options: shuffle([answer, ...wrong]), answer, why: `"${answer}" বসবে; এটা আগের noun-এর বদলে বসেছে।` };
    }
    case 'formFill': {
      // Prefer this lesson's part of speech, then anything already learned.
      const own = FORM_FILLS.filter((f) => targets.includes(f[2]));
      const learned = FORM_FILLS.filter((f) => known.includes(f[2]));
      const [sentence, answer, pos, wrong] = pick(own.length ? own : learned.length ? learned : FORM_FILLS);
      return { kind: 'choice', prompt: 'কোন শব্দটা বসবে?', card: sentence, options: shuffle([answer, ...wrong]), answer, why: `এখানে একটা ${POS_INFO[pos].en} লাগবে: "${answer}"। ${POS_INFO[pos].en} ${POS_INFO[pos].hint}।` };
    }
    case 'conjFill': {
      const [sentence, answer, wrong] = pick(CONJ_FILLS);
      return { kind: 'choice', prompt: 'কোন conjunction বসবে?', card: sentence, options: shuffle([answer, ...wrong]), answer, why: `"${answer}" দুটো অংশকে ঠিক অর্থে জোড়া দেয়।` };
    }
    case 'dual': {
      const [sentence, word, pos] = pick(DUALS);
      const choices = shuffle([pos, ...sample((['n', 'v', 'adj', 'adv', 'prep'] as Pos[]).filter((p) => p !== pos), 2)]).map(label);
      return {
        kind: 'choice',
        prompt: `এই বাক্যে "${word}" কোন part of speech?`,
        card: sentence,
        mark: word,
        options: choices,
        answer: label(pos),
        why: `এখানে "${word}" ${POS_INFO[pos].en} হিসেবে কাজ করছে: ${POS_INFO[pos].hint}।`,
      };
    }
  }
}

/** A hand-written question as the lesson asks it, with its options mixed. */
export const fromWritten = (w: WrittenQuestion): CourseQuestion => ({
  kind: 'choice',
  prompt: w.prompt,
  card: w.card ?? '',
  mark: w.mark,
  options: shuffle([w.correct, ...w.wrong]),
  answer: w.correct,
  why: w.why,
});

const keyOf = (q: CourseQuestion) => (q.kind === 'tap' ? `tap:${q.target}:${q.words.map((w) => w.word).join(' ')}` : `${q.prompt}:${q.card}:${q.mark ?? ''}`);

/**
 * The questions for one lesson: its hand-written questions, then generated ones about its parts of speech
 * (cycling its question kinds), plus a few from earlier lessons (spaced review) so older ones aren't
 * forgotten. No question repeats.
 */
export function makeQuestions(lesson: CourseLesson, earlier: CourseLesson[]): CourseQuestion[] {
  const focus = lesson.focus ?? [];
  const kinds = focus.length ? (lesson.kinds ?? []) : [];
  const written = lesson.questions ?? [];
  const before = [...new Set(earlier.flatMap((l) => (l.kinds?.length ? (l.focus ?? []) : [])))].filter((p) => !focus.includes(p));
  const earlierWritten = earlier.flatMap((l) => l.questions ?? []);
  const known = [...new Set([...before, ...focus])];
  // Without generated questions, a lesson is as long as what was written for it.
  const size = kinds.length ? (lesson.size ?? 10) : written.length + Math.min(2, earlierWritten.length);
  const reviews = before.length ? 3 : Math.min(2, earlierWritten.length);
  const out: CourseQuestion[] = [];
  const seen = new Set<string>();

  const add = (make: () => CourseQuestion) => {
    for (let tries = 0; tries < 30; tries++) {
      const q = make();
      if (!seen.has(keyOf(q))) {
        seen.add(keyOf(q));
        out.push(q);
        return;
      }
    }
  };

  for (const w of written.slice(0, size - reviews)) add(() => fromWritten(w));
  for (let i = 0; kinds.length && out.length < size - reviews; i++) {
    add(() => makeQuestion(kinds[i % kinds.length], focus, known));
    if (i > size * 4) break;
  }
  if (before.length) for (let i = 0; i < reviews; i++) add(() => makeQuestion(i % 2 ? 'tap' : 'which', before, known));
  else for (const w of sample(earlierWritten, reviews)) add(() => fromWritten(w));

  // Keep the lesson's first question about its own topic; mix the rest.
  return out.length ? [out[0], ...shuffle(out.slice(1))] : [];
}
