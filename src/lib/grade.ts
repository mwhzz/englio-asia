import type { Exercise, Grade } from '../types';
import { answersOf, compare } from './answer';

/** The gaps text with each `___` replaced by its word. */
export function fillGaps(text: string, words: string[]): string {
  let i = 0;
  return text.replace(/___/g, () => words[i++] ?? '___');
}

/** The answer a speaking exercise sends when the learner can't speak right now. */
export const SKIP_SPEAKING = '__skip__';

const verdict = (ok: boolean, solution: string): Grade => ({ result: ok ? 'correct' : 'wrong', solution });

/** Checks a learner's answer for any exercise kind. */
export function grade(ex: Exercise, answer: string): Grade {
  switch (ex.kind) {
    case 'select':
      return verdict(answer === ex.word.en, ex.word.en);
    case 'match':
      return { result: 'correct', solution: '' };
    case 'choice':
    case 'hear':
      return verdict(answer === ex.sentence.bn, ex.sentence.bn);
    case 'fill':
      return verdict(answer === ex.fill.answer, ex.fill.text.replace('___', ex.fill.answer));
    case 'translate':
    case 'listen':
      return { result: compare(answer, answersOf(ex.sentence), false), solution: ex.sentence.en };
    case 'type':
    case 'dictate':
      return { result: compare(answer, answersOf(ex.sentence), true), solution: ex.sentence.en };
    case 'speak':
      // "Can't speak now" passes the exercise without checking.
      if (answer === SKIP_SPEAKING) return { result: 'correct', solution: ex.sentence.en, skipped: true };
      return { result: compare(answer, answersOf(ex.sentence), true), solution: ex.sentence.en };
    case 'gaps':
      return verdict(answer === ex.gaps.answers.join('|'), fillGaps(ex.gaps.text, ex.gaps.answers));
    case 'grammar':
      return verdict(answer === ex.grammar.correct, ex.grammar.correct);
    case 'dialog':
      return verdict(answer === ex.dialog.lines[ex.dialog.reply].en, ex.dialog.lines[ex.dialog.reply].en);
  }
}
