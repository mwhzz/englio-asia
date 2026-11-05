import type { DatabaseSync } from 'node:sqlite';
import { audioKey } from '../src/lib/audioKey.ts';
import { readGrammar, readStories } from './course.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { MEDIA_FILE } from './media.ts';

type Obj = Record<string, unknown>;

/**
 * Recordings of English text, made or uploaded on the admin's Words and Audio pages. Kept by the text (see
 * src/lib/audioKey.ts), not by the item, so one recording plays everywhere that text is spoken, in every
 * language's course. The app gets them with the course and plays them instead of the phone's voice.
 */
export function readClips(db: DatabaseSync): Record<string, string> {
  const rows = db.prepare('SELECT key, file FROM audio_clips').all() as { key: string; file: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.file]));
}

interface ItemRow {
  id: number;
  kind: string;
  data: string;
  lesson_id: string;
  lesson: string;
  unit_id: string;
  unit: string;
}

const itemsOf = (db: DatabaseSync, lang: string, kind?: string) =>
  db
    .prepare(
      `SELECT i.id, i.kind, i.data, l.id AS lesson_id, l.title AS lesson, u.id AS unit_id, u.title AS unit
       FROM items i JOIN lessons l ON l.id = i.lesson_id JOIN units u ON u.id = l.unit_id
       WHERE u.lang = ? ${kind ? 'AND i.kind = ?' : ''}
       ORDER BY u.position, l.position, i.position, i.id`,
    )
    .all(...(kind ? [lang, kind] : [lang])) as unknown as ItemRow[];

/** Every word of a language's course, in course order, with where it is and its recording (if any). */
export function listWords(db: DatabaseSync, lang: string) {
  const clips = readClips(db);
  return itemsOf(db, lang, 'vocab').map((r) => {
    const d = JSON.parse(r.data) as Obj;
    return {
      id: r.id,
      en: d.en,
      bn: d.bn,
      emoji: d.emoji ?? '',
      image: d.image ?? null,
      audio: clips[audioKey(String(d.en))] ?? d.audio ?? null,
      lessonId: r.lesson_id,
      lesson: r.lesson,
      unitId: r.unit_id,
      unit: r.unit,
    };
  });
}

const fill = (text: string, answers: string[]) => answers.reduce((t, a) => t.replace('___', a), text);

/**
 * Everything the app says aloud in a language's course: words, sentences, completed blanks, grammar points,
 * dialogue lines, story lines and grammar examples, each once, with where it first appears and its recording.
 */
export function listSpoken(db: DatabaseSync, lang: string) {
  const clips = readClips(db);
  const out = new Map<string, { key: string; text: string; kinds: string[]; where: string; audio: string | null }>();
  const add = (text: unknown, kind: string, where: string, itemAudio?: unknown) => {
    if (typeof text !== 'string' || !text.trim()) return;
    const key = audioKey(text);
    const seen = out.get(key);
    if (seen) {
      if (!seen.kinds.includes(kind)) seen.kinds.push(kind);
      if (!seen.audio && typeof itemAudio === 'string') seen.audio = itemAudio;
      return;
    }
    out.set(key, { key, text: text.trim(), kinds: [kind], where, audio: clips[key] ?? (typeof itemAudio === 'string' ? itemAudio : null) });
  };

  for (const r of itemsOf(db, lang)) {
    const d = JSON.parse(r.data) as Obj;
    const where = `${r.unit} · ${r.lesson}`;
    if (r.kind === 'vocab') add(d.en, 'word', where, d.audio);
    if (r.kind === 'sentence') add(d.en, 'sentence', where, d.audio);
    if (r.kind === 'fill') add(fill(String(d.text), [String(d.answer)]), 'fill', where);
    if (r.kind === 'gaps') add(fill(String(d.text), d.answers as string[]), 'fill', where);
    if (r.kind === 'grammar') add(d.correct, 'grammar', where);
    if (r.kind === 'dialog') for (const line of d.lines as Obj[]) add(line.en, 'dialog', where);
  }
  for (const s of readStories(db, lang)) for (const line of s.lines) add(line.en, 'story', s.title);
  for (const t of readGrammar(db, lang)) for (const e of t.examples) add(e.en, 'example', t.title);
  return [...out.values()];
}

/** Sets the recording for a text (a file already uploaded to /api/admin/media). */
export function setClip(db: DatabaseSync, { body }: Request) {
  const b = (body ?? {}) as Obj;
  const text = typeof b.text === 'string' ? b.text.trim() : '';
  if (!text || text.length > 300) throw new HttpError(400, '"text" is required');
  if (typeof b.file !== 'string' || !MEDIA_FILE.test(b.file) || !/\.(mp3|m4a|webm|ogg)$/.test(b.file)) throw new HttpError(400, '"file" must be an uploaded recording');
  const key = audioKey(text);
  return transaction(db, () => {
    db.prepare('INSERT INTO audio_clips (key, text, file, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET text = excluded.text, file = excluded.file, updated_at = excluded.updated_at').run(
      key,
      text,
      b.file as string,
      new Date().toISOString(),
    );
    bumpContentVersion(db);
    return { key, file: b.file };
  });
}

/** Removes a text's recording (the phone's voice reads it again; a recording on the item itself still plays). */
export function deleteClip(db: DatabaseSync, { query }: Request) {
  const key = audioKey(query.get('text') ?? '');
  return transaction(db, () => {
    if (!db.prepare('DELETE FROM audio_clips WHERE key = ?').run(key).changes) throw new HttpError(404, 'No recording for that text');
    bumpContentVersion(db);
    return { ok: true };
  });
}
