import type { DatabaseSync } from 'node:sqlite';
import { readCourses, readGrammar } from './course.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { validateTopic } from './validateTopic.ts';

const changed = <T,>(db: DatabaseSync, fn: () => T): T =>
  transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });

/** Every topic with the few fields the admin list shows. */
export function listTopics(db: DatabaseSync) {
  const courses = readCourses(db);
  return readGrammar(db).map((t) => ({
    id: t.id,
    level: t.level,
    title: t.title,
    titleBn: t.titleBn,
    quiz: t.quiz.length,
    examples: t.examples.length,
    courseLessons: courses[t.id]?.units.reduce((n, u) => n + u.lessons.length, 0) ?? 0,
  }));
}

export function getTopic(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT data FROM grammar WHERE id = ?').get(params.id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'No such topic');
  return JSON.parse(row.data);
}

export function createTopic(db: DatabaseSync, { body }: Request) {
  const topic = validateTopic(body);
  return changed(db, () => {
    if (db.prepare('SELECT 1 FROM grammar WHERE id = ?').get(topic.id)) throw new HttpError(409, `A topic with id "${topic.id}" already exists`);
    const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM grammar').get() as { p: number };
    db.prepare('INSERT INTO grammar (id, position, data) VALUES (?, ?, ?)').run(topic.id, p, JSON.stringify(topic));
    return { id: topic.id };
  });
}

/** Saves a topic; its id can't change (learners' progress refers to it). */
export function updateTopic(db: DatabaseSync, { params, body }: Request) {
  const topic = validateTopic({ ...(body as object), id: params.id });
  return changed(db, () => {
    if (!db.prepare('UPDATE grammar SET data = ? WHERE id = ?').run(JSON.stringify(topic), params.id).changes) throw new HttpError(404, 'No such topic');
    return { ok: true };
  });
}

export function deleteTopic(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM grammar WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such topic');
    return { ok: true };
  });
}

/** Moves a topic one place up (-1) or down (+1). */
export function moveTopic(db: DatabaseSync, { params, body }: Request) {
  const dir = (body as { dir?: number } | null)?.dir === -1 ? -1 : 1;
  return changed(db, () => {
    const ids = (db.prepare('SELECT id FROM grammar ORDER BY position, id').all() as { id: string }[]).map((r) => r.id);
    const i = ids.indexOf(params.id);
    if (i < 0) throw new HttpError(404, 'No such topic');
    const j = i + dir;
    if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
    const set = db.prepare('UPDATE grammar SET position = ? WHERE id = ?');
    ids.forEach((id, position) => set.run(position, id));
    return { ok: true };
  });
}
