import type { DatabaseSync } from 'node:sqlite';
import type { BoardTopic, Exam } from '../src/data/board/types.ts';
import { readBoard } from './course.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';

type Obj = Record<string, unknown>;
const ID = /^[a-z0-9-]{2,60}$/;

const changed = <T,>(db: DatabaseSync, fn: () => T): T =>
  transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });

const text = (o: Obj, key: string, where = 'Topic'): string => {
  const v = o?.[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  throw new HttpError(400, `${where}: "${key}" is required`);
};

/** Checks a board topic from the admin and returns it cleaned up, so practice can always run it. */
export function validateBoard(body: unknown): BoardTopic {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Topic must be an object');
  const o = body as Obj;
  const id = text(o, 'id');
  if (!ID.test(id)) throw new HttpError(400, 'Id may only use a–z, 0–9 and "-"');
  const exam = (Array.isArray(o.exam) ? o.exam : []).filter((e): e is Exam => e === 'ssc' || e === 'hsc');
  if (!exam.length) throw new HttpError(400, 'Choose SSC, HSC or both');
  const questions = (Array.isArray(o.questions) ? o.questions : []).map((x, i) => {
    const q = x as Obj;
    const where = `Question ${i + 1}`;
    const item = { question: text(q, 'question', where), correct: text(q, 'correct', where), wrong: (Array.isArray(q.wrong) ? q.wrong : []).map(String).map((w) => w.trim()).filter(Boolean), why: text(q, 'why', where) };
    if (!item.wrong.length) throw new HttpError(400, `${where} needs a wrong answer`);
    if (item.wrong.includes(item.correct)) throw new HttpError(400, `${where} lists the right answer as wrong`);
    if (new Set(item.wrong).size !== item.wrong.length) throw new HttpError(400, `${where} has the same wrong answer twice`);
    return item;
  });
  if (questions.length < 5) throw new HttpError(400, 'Write at least 5 questions (a practice round asks 10)');
  return { id, exam, title: text(o, 'title'), titleBn: text(o, 'titleBn'), tip: text(o, 'tip'), questions };
}

export function listBoard(db: DatabaseSync) {
  return readBoard(db).map((t) => ({ id: t.id, exam: t.exam, title: t.title, titleBn: t.titleBn, questions: t.questions.length }));
}

export function getBoard(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT data FROM board_topics WHERE id = ?').get(params.id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'No such topic');
  return JSON.parse(row.data);
}

export function createBoard(db: DatabaseSync, { body }: Request) {
  const topic = validateBoard(body);
  return changed(db, () => {
    if (db.prepare('SELECT 1 FROM board_topics WHERE id = ?').get(topic.id)) throw new HttpError(409, `A topic with id "${topic.id}" already exists`);
    const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM board_topics').get() as { p: number };
    db.prepare('INSERT INTO board_topics (id, position, data) VALUES (?, ?, ?)').run(topic.id, p, JSON.stringify(topic));
    return { id: topic.id };
  });
}

/** Saves a topic; its id can't change (learners' best scores refer to it). */
export function updateBoard(db: DatabaseSync, { params, body }: Request) {
  const topic = validateBoard({ ...(body as object), id: params.id });
  return changed(db, () => {
    if (!db.prepare('UPDATE board_topics SET data = ? WHERE id = ?').run(JSON.stringify(topic), params.id).changes) throw new HttpError(404, 'No such topic');
    return { ok: true };
  });
}

export function deleteBoard(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM board_topics WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such topic');
    return { ok: true };
  });
}

/** Moves a topic one place up (-1) or down (+1). */
export function moveBoard(db: DatabaseSync, { params, body }: Request) {
  const dir = (body as { dir?: number } | null)?.dir === -1 ? -1 : 1;
  return changed(db, () => {
    const ids = (db.prepare('SELECT id FROM board_topics ORDER BY position, id').all() as { id: string }[]).map((r) => r.id);
    const i = ids.indexOf(params.id);
    if (i < 0) throw new HttpError(404, 'No such topic');
    const j = i + dir;
    if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
    const set = db.prepare('UPDATE board_topics SET position = ? WHERE id = ?');
    ids.forEach((id, position) => set.run(position, id));
    return { ok: true };
  });
}
