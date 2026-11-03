import type { Story } from '../src/types.ts';
import { HttpError } from './http.ts';

type Obj = Record<string, unknown>;
const ID = /^[a-z0-9-]{2,60}$/;
const COLOR = /^#[0-9a-f]{6}$/i;

const text = (o: Obj, key: string, where = 'Story'): string => {
  const v = o?.[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  throw new HttpError(400, `${where}: "${key}" is required`);
};
const list = (o: Obj, key: string): Obj[] => {
  const v = o[key] ?? [];
  if (!Array.isArray(v)) throw new HttpError(400, `"${key}" must be a list`);
  return v as Obj[];
};

/** Checks a story from the admin and returns it cleaned up, so the story reader can always show it. */
export function validateStory(body: unknown): Story {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Story must be an object');
  const o = body as Obj;
  const id = text(o, 'id');
  if (!ID.test(id)) throw new HttpError(400, 'Id may only use a–z, 0–9 and "-"');
  const color = typeof o.color === 'string' && COLOR.test(o.color) ? o.color : '#007aff';

  const lines = list(o, 'lines').map((l) => ({
    ...(typeof l.who === 'string' && l.who.trim() ? { who: l.who.trim() } : {}),
    en: text(l, 'en', 'Line'),
    bn: text(l, 'bn', 'Line'),
  }));
  if (lines.length < 2) throw new HttpError(400, 'A story needs at least two lines');

  const quiz = list(o, 'quiz').map((q) => {
    const item = { question: text(q, 'question', 'Question'), correct: text(q, 'correct', 'Question'), wrong: (Array.isArray(q.wrong) ? q.wrong : []).map(String).filter(Boolean), why: text(q, 'why', 'Question') };
    if (!item.wrong.length) throw new HttpError(400, `"${item.question}" needs a wrong answer`);
    if (item.wrong.includes(item.correct)) throw new HttpError(400, `"${item.question}" lists the right answer as wrong`);
    return item;
  });
  if (!quiz.length) throw new HttpError(400, 'Add at least one question');

  return { id, title: text(o, 'title'), titleBn: text(o, 'titleBn'), color, lines, quiz };
}
