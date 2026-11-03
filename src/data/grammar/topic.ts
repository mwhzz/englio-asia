import type { GrammarLevel, GrammarTopic } from '../../types';

type Ex = [en: string, bn: string];
type Mistake = [wrong: string, right: string, note: string];
type Quiz = [question: string, correct: string, wrong: string[], why: string];

/** Writes a grammar topic compactly; formulas are "label: Part + Part + Part". */
export function topic(
  id: string,
  level: GrammarLevel,
  title: string,
  titleBn: string,
  summary: string,
  body: {
    explain: string[];
    formulas?: string[];
    table?: string[][];
    examples: Ex[];
    mistakes?: Mistake[];
    quiz: Quiz[];
  },
): GrammarTopic {
  return {
    id,
    level,
    title,
    titleBn,
    summary,
    explain: body.explain,
    formulas: (body.formulas ?? []).map((f) => {
      const [label, pattern] = f.split(/:\s*/, 2);
      return { label, parts: pattern.split(' + ') };
    }),
    table: body.table,
    examples: body.examples.map(([en, bn]) => ({ en, bn })),
    mistakes: (body.mistakes ?? []).map(([wrong, right, note]) => ({ wrong, right, note })),
    quiz: body.quiz.map(([question, correct, wrong, why]) => ({ question, correct, wrong, why })),
  };
}
