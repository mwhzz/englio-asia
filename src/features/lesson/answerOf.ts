import { fillGaps } from '../../lib/grade';
import type { Exercise } from '../../types';

/** The right answer of an exercise in English with its Bangla meaning, shown after checking; null for matching. */
export function answerOf(ex: Exercise): { en: string; bn: string } | null {
  switch (ex.kind) {
    case 'select':
      return { en: ex.word.en, bn: ex.word.bn };
    case 'fill':
      return { en: ex.fill.text.replace('___', ex.fill.answer), bn: ex.fill.bn };
    case 'match':
      return null;
    case 'gaps':
      return { en: fillGaps(ex.gaps.text, ex.gaps.answers), bn: ex.gaps.bn };
    case 'grammar':
      return { en: ex.grammar.correct, bn: ex.grammar.why };
    case 'dialog':
      return ex.dialog.lines[ex.dialog.reply];
    default:
      return { en: ex.sentence.en, bn: ex.sentence.bn };
  }
}
