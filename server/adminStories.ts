import type { DatabaseSync } from 'node:sqlite';
import { readStories } from './course.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { validateStory } from './validateStory.ts';
import { idIn, langOf } from './languages.ts';

const changed = <T,>(db: DatabaseSync, fn: () => T): T =>
  transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });

/** Every story with the few fields the admin list shows. */
export function listStories(db: DatabaseSync, lang = 'bn') {
  return readStories(db, lang).map((s) => ({ id: s.id, title: s.title, titleBn: s.titleBn, color: s.color, lines: s.lines.length, quiz: s.quiz.length }));
}

export function getStory(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT data FROM stories WHERE id = ?').get(params.id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'No such story');
  return JSON.parse(row.data);
}

export function createStory(db: DatabaseSync, { body }: Request) {
  const lang = langOf(db, (body as { lang?: string } | null)?.lang);
  const given = validateStory(body);
  const story = { ...given, id: idIn(lang, given.id) };
  return changed(db, () => {
    if (db.prepare('SELECT 1 FROM stories WHERE id = ?').get(story.id)) throw new HttpError(409, `A story with id "${story.id}" already exists`);
    const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM stories').get() as { p: number };
    db.prepare('INSERT INTO stories (id, lang, position, data) VALUES (?, ?, ?, ?)').run(story.id, lang, p, JSON.stringify(story));
    return { id: story.id };
  });
}

/** Saves a story; its id can't change (learners' progress remembers which stories they read). */
export function updateStory(db: DatabaseSync, { params, body }: Request) {
  const story = validateStory({ ...(body as object), id: params.id });
  return changed(db, () => {
    if (!db.prepare('UPDATE stories SET data = ? WHERE id = ?').run(JSON.stringify(story), params.id).changes) throw new HttpError(404, 'No such story');
    return { ok: true };
  });
}

export function deleteStory(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM stories WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such story');
    return { ok: true };
  });
}

/** Moves a story one place up (-1) or down (+1). */
export function moveStory(db: DatabaseSync, { params, body }: Request) {
  const dir = (body as { dir?: number } | null)?.dir === -1 ? -1 : 1;
  return changed(db, () => {
    const ids = (db.prepare('SELECT id FROM stories WHERE lang = (SELECT lang FROM stories WHERE id = ?) ORDER BY position, id').all(params.id) as { id: string }[]).map((r) => r.id);
    const i = ids.indexOf(params.id);
    if (i < 0) throw new HttpError(404, 'No such story');
    const j = i + dir;
    if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
    const set = db.prepare('UPDATE stories SET position = ? WHERE id = ?');
    ids.forEach((id, position) => set.run(position, id));
    return { ok: true };
  });
}
