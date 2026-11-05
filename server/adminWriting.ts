import type { DatabaseSync } from 'node:sqlite';
import { WRITING_KINDS } from '../src/data/writing/kinds.ts';
import type { WritingTask } from '../src/data/writing/types.ts';
import { LEVELS } from '../src/lib/levelCourse.ts';
import type { Level } from '../src/types.ts';
import { readWriting } from './course.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { idIn, langOf } from './languages.ts';

type Obj = Record<string, unknown>;
const ID = /^[a-z0-9-]{2,60}$/;

const changed = <T,>(db: DatabaseSync, fn: () => T): T =>
  transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });

const text = (o: Obj, key: string): string => {
  const v = o?.[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  throw new HttpError(400, `"${key}" is required`);
};

const lines = (o: Obj, key: string): string[] =>
  (Array.isArray(o[key]) ? (o[key] as unknown[]) : []).map((x) => String(x).trim()).filter(Boolean);

/** Checks a writing task from the admin and returns it cleaned up. */
export function validateWriting(body: unknown): WritingTask {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Task must be an object');
  const o = body as Obj;
  const id = text(o, 'id');
  if (!ID.test(id)) throw new HttpError(400, 'Id may only use a–z, 0–9 and "-"');
  const kind = WRITING_KINDS.find((k) => k.id === o.kind)?.id;
  if (!kind) throw new HttpError(400, `"kind" must be one of: ${WRITING_KINDS.map((k) => k.id).join(', ')}`);
  const levels = Array.isArray(o.levels) ? o.levels : [];
  if (levels.some((l) => !LEVELS.includes(l as Level))) throw new HttpError(400, `"levels" must be a list of: ${LEVELS.join(', ')}`);
  const hints = lines(o, 'hints');
  if (!hints.length) throw new HttpError(400, 'Write at least one point to cover');
  const model = text(o, 'model');
  const minWords = Math.round(Number(o.minWords));
  if (!(minWords >= 10 && minWords <= 1000)) throw new HttpError(400, '"minWords" must be between 10 and 1000');
  return {
    id,
    kind,
    levels: LEVELS.filter((l) => levels.includes(l)),
    title: text(o, 'title'),
    titleBn: text(o, 'titleBn'),
    prompt: text(o, 'prompt'),
    hints,
    phrases: lines(o, 'phrases'),
    // Keep paragraphs, drop stray spaces at line ends and extra blank lines.
    model: model.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'),
    minWords,
  };
}

export function listWriting(db: DatabaseSync, lang = 'bn') {
  return readWriting(db, lang).map((t) => ({ id: t.id, kind: t.kind, levels: t.levels, title: t.title, titleBn: t.titleBn, minWords: t.minWords }));
}

export function getWriting(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT data FROM writing_tasks WHERE id = ?').get(params.id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'No such task');
  return JSON.parse(row.data);
}

export function createWriting(db: DatabaseSync, { body }: Request) {
  const lang = langOf(db, (body as { lang?: string } | null)?.lang);
  const given = validateWriting(body);
  const task = { ...given, id: idIn(lang, given.id) };
  return changed(db, () => {
    if (db.prepare('SELECT 1 FROM writing_tasks WHERE id = ?').get(task.id)) throw new HttpError(409, `A task with id "${task.id}" already exists`);
    const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM writing_tasks').get() as { p: number };
    db.prepare('INSERT INTO writing_tasks (id, lang, position, data) VALUES (?, ?, ?, ?)').run(task.id, lang, p, JSON.stringify(task));
    return { id: task.id };
  });
}

/** Saves a task; its id can't change (learners' finished tasks refer to it). */
export function updateWriting(db: DatabaseSync, { params, body }: Request) {
  const task = validateWriting({ ...(body as object), id: params.id });
  return changed(db, () => {
    if (!db.prepare('UPDATE writing_tasks SET data = ? WHERE id = ?').run(JSON.stringify(task), params.id).changes) throw new HttpError(404, 'No such task');
    return { ok: true };
  });
}

export function deleteWriting(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM writing_tasks WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such task');
    return { ok: true };
  });
}

/** Moves a task one place up (-1) or down (+1). */
export function moveWriting(db: DatabaseSync, { params, body }: Request) {
  const dir = (body as { dir?: number } | null)?.dir === -1 ? -1 : 1;
  return changed(db, () => {
    const ids = (db.prepare('SELECT id FROM writing_tasks WHERE lang = (SELECT lang FROM writing_tasks WHERE id = ?) ORDER BY position, id').all(params.id) as { id: string }[]).map((r) => r.id);
    const i = ids.indexOf(params.id);
    if (i < 0) throw new HttpError(404, 'No such task');
    const j = i + dir;
    if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
    const set = db.prepare('UPDATE writing_tasks SET position = ? WHERE id = ?');
    ids.forEach((id, position) => set.run(position, id));
    return { ok: true };
  });
}
