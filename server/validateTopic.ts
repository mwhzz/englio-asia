import type { GrammarLevel, GrammarTopic } from '../src/types.ts';
import { HttpError } from './http.ts';

type Obj = Record<string, unknown>;
const LEVELS: GrammarLevel[] = ['beginner', 'intermediate', 'advanced'];
const ID = /^[a-z0-9-]{2,60}$/;

const text = (o: Obj, key: string, optional = false): string => {
  const v = o?.[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (optional) return '';
  throw new HttpError(400, `"${key}" is required`);
};

const strings = (v: unknown, what: string): string[] => {
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new HttpError(400, `${what} must be a list of text`);
  return v.map((x: string) => x.trim()).filter(Boolean);
};

const objects = (o: Obj, key: string): Obj[] => {
  const v = o[key] ?? [];
  if (!Array.isArray(v)) throw new HttpError(400, `"${key}" must be a list`);
  return v as Obj[];
};

/** Checks a grammar topic from the admin and returns it cleaned up, so the grammar page can always show it. */
export function validateTopic(body: unknown): GrammarTopic {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Topic must be an object');
  const o = body as Obj;
  const id = text(o, 'id');
  if (!ID.test(id)) throw new HttpError(400, 'Id may only use a–z, 0–9 and "-"');
  const level = text(o, 'level') as GrammarLevel;
  if (!LEVELS.includes(level)) throw new HttpError(400, 'Level must be beginner, intermediate or advanced');

  const explain = strings(o.explain ?? [], 'Explanation');
  if (!explain.length) throw new HttpError(400, 'Write at least one paragraph of explanation');

  const formulas = objects(o, 'formulas').map((f) => ({ label: text(f, 'label'), parts: strings(f.parts, 'Pattern parts') }));
  if (formulas.some((f) => !f.parts.length)) throw new HttpError(400, 'Each pattern needs its parts');

  const table = o.table == null ? undefined : (o.table as unknown[]).map((row) => strings(row, 'Table rows'));
  if (table && table.some((row) => row.length !== table[0].length)) throw new HttpError(400, 'Every table row needs the same number of cells');

  const examples = objects(o, 'examples').map((e) => ({ en: text(e, 'en'), bn: text(e, 'bn') }));
  if (!examples.length) throw new HttpError(400, 'Add at least one example');

  const mistakes = objects(o, 'mistakes').map((m) => ({ wrong: text(m, 'wrong'), right: text(m, 'right'), note: text(m, 'note', true) }));

  const quiz = objects(o, 'quiz').map((q) => {
    const item = { question: text(q, 'question'), correct: text(q, 'correct'), wrong: strings(q.wrong ?? [], 'Wrong answers'), why: text(q, 'why') };
    if (!item.wrong.length) throw new HttpError(400, `Quiz "${item.question}" needs a wrong answer`);
    if (item.wrong.includes(item.correct)) throw new HttpError(400, `Quiz "${item.question}" lists the right answer as wrong`);
    return item;
  });
  if (!quiz.length) throw new HttpError(400, 'Add at least one quiz question');

  return {
    id,
    level,
    title: text(o, 'title'),
    titleBn: text(o, 'titleBn'),
    summary: text(o, 'summary', true),
    explain,
    formulas,
    ...(table && table.length ? { table } : {}),
    examples,
    mistakes,
    quiz,
  };
}
