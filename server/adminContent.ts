import type { DatabaseSync } from 'node:sqlite';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, text, type Request } from './http.ts';
import { validateItem } from './validate.ts';

type Row = Record<string, unknown>;

const COLOR = /^#[0-9a-f]{6}$/i;

function color(body: unknown): string {
  const value = text(body, 'color');
  if (!COLOR.test(value)) throw new HttpError(400, 'Color must look like #34c759');
  return value;
}

/** Tips are a list of { title, body, examples[] }. */
function tips(body: unknown): string {
  const value = (body as Row | null)?.tips ?? [];
  if (!Array.isArray(value)) throw new HttpError(400, '"tips" must be a list');
  return JSON.stringify(
    value.map((t: Row) => ({
      title: text(t, 'title'),
      body: text(t, 'body'),
      examples: Array.isArray(t.examples) ? t.examples.filter((x) => typeof x === 'string' && x.trim()).map((x: string) => x.trim()) : [],
    })),
  );
}

function nextPosition(db: DatabaseSync, table: 'units' | 'lessons' | 'items', where = '', ...args: string[]): number {
  const row = db.prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS p FROM ${table} ${where}`).get(...args) as { p: number };
  return row.p;
}

function changed<T>(db: DatabaseSync, fn: () => T): T {
  return transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });
}

/** Every unit with its lessons and how many items of each kind they have. */
export function listUnits(db: DatabaseSync) {
  const units = db.prepare('SELECT id, title, title_bn, color, tips FROM units ORDER BY position').all() as Row[];
  const lessons = db.prepare('SELECT id, unit_id, title, title_bn FROM lessons ORDER BY position').all() as Row[];
  const counts = db.prepare('SELECT lesson_id, kind, COUNT(*) AS n FROM items GROUP BY lesson_id, kind').all() as Row[];
  return units.map((u) => ({
    id: u.id,
    title: u.title,
    titleBn: u.title_bn,
    color: u.color,
    tips: JSON.parse(u.tips as string),
    lessons: lessons
      .filter((l) => l.unit_id === u.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        titleBn: l.title_bn,
        counts: Object.fromEntries(counts.filter((c) => c.lesson_id === l.id).map((c) => [c.kind, c.n])),
      })),
  }));
}

export function createUnit(db: DatabaseSync, { body }: Request) {
  return changed(db, () => {
    const n = (db.prepare('SELECT COUNT(*) AS n FROM units').get() as { n: number }).n;
    let id = `u${n + 1}`;
    while (db.prepare('SELECT 1 FROM units WHERE id = ?').get(id)) id = `${id}x`;
    db.prepare('INSERT INTO units (id, position, title, title_bn, color, tips) VALUES (?, ?, ?, ?, ?, ?)').run(
      id,
      nextPosition(db, 'units'),
      text(body, 'title'),
      text(body, 'titleBn'),
      color(body),
      tips(body),
    );
    return { id };
  });
}

export function updateUnit(db: DatabaseSync, { params, body }: Request) {
  return changed(db, () => {
    const result = db
      .prepare('UPDATE units SET title = ?, title_bn = ?, color = ?, tips = ? WHERE id = ?')
      .run(text(body, 'title'), text(body, 'titleBn'), color(body), tips(body), params.id);
    if (!result.changes) throw new HttpError(404, 'No such unit');
    return { ok: true };
  });
}

export function deleteUnit(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM units WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such unit');
    return { ok: true };
  });
}

/** Moves a unit or lesson one place up (-1) or down (+1) among its siblings. */
export function moveRow(db: DatabaseSync, table: 'units' | 'lessons', { params, body }: Request) {
  const dir = (body as Row | null)?.dir === -1 ? -1 : 1;
  return changed(db, () => {
    const scope = table === 'lessons' ? 'WHERE unit_id = (SELECT unit_id FROM lessons WHERE id = ?)' : '';
    const ids = (db.prepare(`SELECT id FROM ${table} ${scope} ORDER BY position`).all(...(scope ? [params.id] : [])) as Row[]).map(
      (r) => r.id as string,
    );
    const i = ids.indexOf(params.id);
    if (i < 0) throw new HttpError(404, 'Not found');
    const j = i + dir;
    if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
    const set = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
    ids.forEach((id, position) => set.run(position, id));
    return { ok: true };
  });
}

export function createLesson(db: DatabaseSync, { params, body }: Request) {
  return changed(db, () => {
    if (!db.prepare('SELECT 1 FROM units WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such unit');
    let n = (db.prepare('SELECT COUNT(*) AS n FROM lessons WHERE unit_id = ?').get(params.id) as { n: number }).n + 1;
    while (db.prepare('SELECT 1 FROM lessons WHERE id = ?').get(`${params.id}-l${n}`)) n++;
    const id = `${params.id}-l${n}`;
    db.prepare('INSERT INTO lessons (id, unit_id, position, title, title_bn) VALUES (?, ?, ?, ?, ?)').run(
      id,
      params.id,
      nextPosition(db, 'lessons', 'WHERE unit_id = ?', params.id),
      text(body, 'title'),
      text(body, 'titleBn'),
    );
    return { id };
  });
}

export function getLesson(db: DatabaseSync, { params }: Request) {
  const lesson = db.prepare('SELECT id, unit_id, title, title_bn FROM lessons WHERE id = ?').get(params.id) as Row | undefined;
  if (!lesson) throw new HttpError(404, 'No such lesson');
  const items = db.prepare('SELECT id, kind, data FROM items WHERE lesson_id = ? ORDER BY position, id').all(params.id) as Row[];
  return {
    id: lesson.id,
    unitId: lesson.unit_id,
    title: lesson.title,
    titleBn: lesson.title_bn,
    items: items.map((i) => ({ id: i.id, kind: i.kind, data: JSON.parse(i.data as string) })),
  };
}

export function updateLesson(db: DatabaseSync, { params, body }: Request) {
  return changed(db, () => {
    const result = db.prepare('UPDATE lessons SET title = ?, title_bn = ? WHERE id = ?').run(text(body, 'title'), text(body, 'titleBn'), params.id);
    if (!result.changes) throw new HttpError(404, 'No such lesson');
    return { ok: true };
  });
}

export function deleteLesson(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM lessons WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such lesson');
    return { ok: true };
  });
}

export function createItem(db: DatabaseSync, { params, body }: Request) {
  const kind = text(body, 'kind');
  const data = validateItem(kind, (body as Row).data);
  return changed(db, () => {
    if (!db.prepare('SELECT 1 FROM lessons WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such lesson');
    const result = db
      .prepare('INSERT INTO items (lesson_id, kind, position, data) VALUES (?, ?, ?, ?)')
      .run(params.id, kind, nextPosition(db, 'items', 'WHERE lesson_id = ?', params.id), JSON.stringify(data));
    return { id: Number(result.lastInsertRowid) };
  });
}

export function updateItem(db: DatabaseSync, { params, body }: Request) {
  const row = db.prepare('SELECT kind FROM items WHERE id = ?').get(Number(params.id)) as { kind: string } | undefined;
  if (!row) throw new HttpError(404, 'No such item');
  const data = validateItem(row.kind, (body as Row | null)?.data);
  return changed(db, () => {
    db.prepare('UPDATE items SET data = ? WHERE id = ?').run(JSON.stringify(data), Number(params.id));
    return { ok: true };
  });
}

export function deleteItem(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM items WHERE id = ?').run(Number(params.id)).changes) throw new HttpError(404, 'No such item');
    return { ok: true };
  });
}
