import type { BoardTopic, Exam } from '../data/board/types';
import { slug } from './topicForm';

/** A board topic as plain text fields: one question per line, "question | right | wrong 1; wrong 2 | why". */
export interface BoardFields {
  id: string;
  exam: Exam[];
  title: string;
  titleBn: string;
  tip: string;
  questions: string;
}

export const EMPTY_BOARD: BoardFields = { id: '', exam: ['ssc', 'hsc'], title: '', titleBn: '', tip: '', questions: '' };

export function boardToFields(t: BoardTopic): BoardFields {
  return {
    id: t.id,
    exam: t.exam,
    title: t.title,
    titleBn: t.titleBn,
    tip: t.tip,
    questions: t.questions.map((q) => `${q.question} | ${q.correct} | ${q.wrong.join('; ')} | ${q.why}`).join('\n'),
  };
}

/** The topic the server expects; the server checks it and says what's missing. */
export function fieldsToBoard(f: BoardFields): BoardTopic {
  return {
    id: f.id.trim() || slug(f.title),
    exam: f.exam,
    title: f.title.trim(),
    titleBn: f.titleBn.trim(),
    tip: f.tip.trim(),
    questions: f.questions
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [question = '', correct = '', wrong = '', why = ''] = line.split('|').map((c) => c.trim());
        return { question, correct, wrong: wrong.split(';').map((w) => w.trim()).filter(Boolean), why };
      }),
  };
}
