import type { GrammarLevel, GrammarTopic } from '../types';

/**
 * A grammar topic as plain text fields, so the admin can write it like a document:
 * paragraphs separated by a blank line, and one item per line with "|" between its parts.
 */
export interface TopicFields {
  id: string;
  level: GrammarLevel;
  title: string;
  titleBn: string;
  summary: string;
  /** Paragraphs, separated by a blank line. */
  explain: string;
  /** "label: Part + Part + Part" per line. */
  formulas: string;
  /** "cell | cell | cell" per line; the first line is the header. */
  table: string;
  /** "English | বাংলা" per line. */
  examples: string;
  /** "wrong | right | note" per line. */
  mistakes: string;
  /** "question | right answer | wrong 1; wrong 2 | why" per line. */
  quiz: string;
}

export const EMPTY_TOPIC: TopicFields = {
  id: '',
  level: 'beginner',
  title: '',
  titleBn: '',
  summary: '',
  explain: '',
  formulas: '',
  table: '',
  examples: '',
  mistakes: '',
  quiz: '',
};

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
const cells = (line: string) => line.split('|').map((c) => c.trim());

export function toFields(t: GrammarTopic): TopicFields {
  return {
    id: t.id,
    level: t.level,
    title: t.title,
    titleBn: t.titleBn,
    summary: t.summary,
    explain: t.explain.join('\n\n'),
    formulas: t.formulas.map((f) => `${f.label}: ${f.parts.join(' + ')}`).join('\n'),
    table: (t.table ?? []).map((row) => row.join(' | ')).join('\n'),
    examples: t.examples.map((e) => `${e.en} | ${e.bn}`).join('\n'),
    mistakes: t.mistakes.map((m) => `${m.wrong} | ${m.right} | ${m.note}`).join('\n'),
    quiz: t.quiz.map((q) => `${q.question} | ${q.correct} | ${q.wrong.join('; ')} | ${q.why}`).join('\n'),
  };
}

/** The topic the server expects; the server checks it and says what's missing. */
export function fromFields(f: TopicFields): GrammarTopic {
  const table = lines(f.table).map(cells);
  return {
    id: f.id.trim(),
    level: f.level,
    title: f.title.trim(),
    titleBn: f.titleBn.trim(),
    summary: f.summary.trim(),
    explain: f.explain
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    formulas: lines(f.formulas).map((line) => {
      const at = line.indexOf(':');
      return { label: line.slice(0, at).trim(), parts: line.slice(at + 1).split('+').map((p) => p.trim()).filter(Boolean) };
    }),
    ...(table.length ? { table } : {}),
    examples: lines(f.examples).map((line) => {
      const [en, bn = ''] = cells(line);
      return { en, bn };
    }),
    mistakes: lines(f.mistakes).map((line) => {
      const [wrong, right = '', note = ''] = cells(line);
      return { wrong, right, note };
    }),
    quiz: lines(f.quiz).map((line) => {
      const [question, correct = '', wrong = '', why = ''] = cells(line);
      return { question, correct, wrong: wrong.split(';').map((w) => w.trim()).filter(Boolean), why };
    }),
  };
}

/** A topic id made from its English title: "Present Simple" → "present-simple". */
export const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
