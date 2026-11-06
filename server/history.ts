import type { DatabaseSync } from 'node:sqlite';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';

/**
 * Content history and trash: before the admin changes or deletes a unit, lesson, item, grammar topic,
 * grammar course, story, writing task or board topic, its rows are copied here (with any lessons and items
 * under it). "ফিরিয়ে আনো" puts that copy back, also after a delete. Kept for 90 days.
 */

type Rows = Record<string, Record<string, unknown>[]>;

// Each table's key, and the order to put rows back in (parents before children).
const KEYS: Record<string, string> = {
  units: 'id',
  lessons: 'id',
  items: 'id',
  grammar: 'id',
  grammar_courses: 'topic_id',
  stories: 'id',
  writing_tasks: 'id',
  board_topics: 'id',
};
const ORDER = Object.keys(KEYS);

interface Spec {
  kind: string;
  path: RegExp;
  collect: (db: DatabaseSync, id: string) => Rows;
  label: (rows: Rows) => string;
}

const all = (db: DatabaseSync, sql: string, ...args: (string | number)[]) => db.prepare(sql).all(...args) as Record<string, unknown>[];
const dataTitle = (row?: Record<string, unknown>) => {
  try {
    const d = JSON.parse(String(row?.data ?? '{}')) as Record<string, unknown>;
    return String(d.title ?? d.en ?? d.sentence ?? d.rule ?? row?.id ?? '');
  } catch {
    return String(row?.id ?? '');
  }
};

const SPECS: Spec[] = [
  {
    kind: 'unit',
    path: /^\/api\/admin\/units\/([^/]+)$/,
    collect: (db, id) => ({
      units: all(db, 'SELECT * FROM units WHERE id = ?', id),
      lessons: all(db, 'SELECT * FROM lessons WHERE unit_id = ?', id),
      items: all(db, 'SELECT * FROM items WHERE lesson_id IN (SELECT id FROM lessons WHERE unit_id = ?)', id),
    }),
    label: (r) => String(r.units[0]?.title ?? ''),
  },
  {
    kind: 'lesson',
    path: /^\/api\/admin\/lessons\/([^/]+)$/,
    collect: (db, id) => ({ lessons: all(db, 'SELECT * FROM lessons WHERE id = ?', id), items: all(db, 'SELECT * FROM items WHERE lesson_id = ?', id) }),
    label: (r) => String(r.lessons[0]?.title ?? ''),
  },
  { kind: 'item', path: /^\/api\/admin\/items\/(\d+)$/, collect: (db, id) => ({ items: all(db, 'SELECT * FROM items WHERE id = ?', Number(id)) }), label: (r) => dataTitle(r.items[0]) },
  {
    kind: 'grammar',
    path: /^\/api\/admin\/grammar\/([^/]+)$/,
    collect: (db, id) => ({ grammar: all(db, 'SELECT * FROM grammar WHERE id = ?', id), grammar_courses: all(db, 'SELECT * FROM grammar_courses WHERE topic_id = ?', id) }),
    label: (r) => dataTitle(r.grammar[0]),
  },
  {
    kind: 'course',
    path: /^\/api\/admin\/courses\/([^/]+)$/,
    collect: (db, id) => ({ grammar_courses: all(db, 'SELECT * FROM grammar_courses WHERE topic_id = ?', id) }),
    label: (r) => `${r.grammar_courses[0]?.topic_id ?? ''} course`,
  },
  { kind: 'story', path: /^\/api\/admin\/stories\/([^/]+)$/, collect: (db, id) => ({ stories: all(db, 'SELECT * FROM stories WHERE id = ?', id) }), label: (r) => dataTitle(r.stories[0]) },
  {
    kind: 'writing',
    path: /^\/api\/admin\/writing\/([^/]+)$/,
    collect: (db, id) => ({ writing_tasks: all(db, 'SELECT * FROM writing_tasks WHERE id = ?', id) }),
    label: (r) => dataTitle(r.writing_tasks[0]),
  },
  {
    kind: 'board',
    path: /^\/api\/admin\/board\/([^/]+)$/,
    collect: (db, id) => ({ board_topics: all(db, 'SELECT * FROM board_topics WHERE id = ?', id) }),
    label: (r) => dataTitle(r.board_topics[0]),
  },
];

/**
 * For an admin change or delete about to run on `path`: the content as it is now, to be saved once the
 * change worked (`save`). null when the path isn't content or the thing doesn't exist yet.
 */
export function snapshotFor(db: DatabaseSync, path: string) {
  for (const spec of SPECS) {
    const m = spec.path.exec(path);
    if (!m) continue;
    const id = decodeURIComponent(m[1]);
    const rows = spec.collect(db, id);
    if (!Object.values(rows).some((r) => r.length)) return null;
    return {
      save(admin: string, method: string, now = new Date()) {
        db.prepare('INSERT INTO content_history (at, admin, action, kind, entity, label, rows) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          now.toISOString(),
          admin,
          method === 'DELETE' ? 'delete' : 'change',
          spec.kind,
          id,
          spec.label(rows).slice(0, 120),
          JSON.stringify(rows),
        );
        // Older than 90 days isn't needed.
        db.prepare('DELETE FROM content_history WHERE at < ?').run(new Date(now.getTime() - 90 * 86_400_000).toISOString());
      },
    };
  }
  return null;
}

/** The latest changes and deletes, newest first (`?action=delete` for the trash, `?q=` to search). */
export function listHistory(db: DatabaseSync, { query }: Pick<Request, 'query'>) {
  const where: string[] = [];
  const args: string[] = [];
  const action = query.get('action');
  if (action === 'delete' || action === 'change') (where.push('action = ?'), args.push(action));
  const q = query.get('q')?.trim();
  if (q) (where.push('(label LIKE ? OR entity LIKE ?)'), args.push(`%${q}%`, `%${q}%`));
  return db
    .prepare(`SELECT id, at, admin, action, kind, entity, label FROM content_history ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT 300`)
    .all(...args);
}

/**
 * Puts a saved copy back: each row is written as it was (added again if it was deleted, set back if it
 * was changed). A unit or lesson comes back with its lessons and items.
 */
export function restoreHistory(db: DatabaseSync, { params }: Pick<Request, 'params'>) {
  const row = db.prepare('SELECT rows, kind, entity FROM content_history WHERE id = ?').get(Number(params.id)) as { rows: string; kind: string; entity: string } | undefined;
  if (!row) throw new HttpError(404, 'Nothing saved with that id');
  const rows = JSON.parse(row.rows) as Rows;
  return transaction(db, () => {
    for (const table of ORDER) {
      for (const r of rows[table] ?? []) {
        const cols = Object.keys(r);
        const key = KEYS[table];
        db.prepare(
          `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
           ON CONFLICT(${key}) DO UPDATE SET ${cols.filter((c) => c !== key).map((c) => `${c} = excluded.${c}`).join(', ')}`,
        ).run(...cols.map((c) => r[c] as string | number | null));
      }
    }
    bumpContentVersion(db);
    return { ok: true, kind: row.kind, id: row.entity };
  });
}

const DRAFTABLE: Record<string, string> = { lesson: 'lessons', story: 'stories', grammar: 'grammar' };

/** খসড়া: `{ kind: 'lesson' | 'story' | 'grammar', id, draft: true }` hides it from learners; `draft: false` publishes it. */
export function setDraft(db: DatabaseSync, { body }: Pick<Request, 'body'>) {
  const b = (body ?? {}) as { kind?: string; id?: string; draft?: boolean };
  const table = DRAFTABLE[b.kind ?? ''];
  if (!table || typeof b.id !== 'string' || typeof b.draft !== 'boolean') throw new HttpError(400, 'Give kind (lesson, story, grammar), id and draft (true or false)');
  return transaction(db, () => {
    if (!db.prepare(`UPDATE ${table} SET draft = ? WHERE id = ?`).run(b.draft ? 1 : 0, b.id!).changes) throw new HttpError(404, `No such ${b.kind}`);
    bumpContentVersion(db);
    return { ok: true, draft: b.draft };
  });
}

/** Which lessons, stories and topics are drafts (for the admin's lists). */
export function draftIds(db: DatabaseSync): { lessons: string[]; stories: string[]; grammar: string[] } {
  const ids = (table: string) => (db.prepare(`SELECT id FROM ${table} WHERE draft = 1`).all() as { id: string }[]).map((r) => r.id);
  return { lessons: ids('lessons'), stories: ids('stories'), grammar: ids('grammar') };
}
