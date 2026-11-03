import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileReply, HttpError, type Request } from './http.ts';

/** Where uploaded pictures and recordings are kept; set MEDIA_DIR to keep them somewhere else (and back it up). */
export const MEDIA_DIR = process.env.MEDIA_DIR ?? fileURLToPath(new URL('./media', import.meta.url));

/** What can be uploaded, by type, with the largest size allowed. */
const TYPES: Record<string, { ext: string; max: number }> = {
  'image/png': { ext: 'png', max: 1_000_000 },
  'image/jpeg': { ext: 'jpg', max: 1_000_000 },
  'image/webp': { ext: 'webp', max: 1_000_000 },
  'audio/mpeg': { ext: 'mp3', max: 2_000_000 },
  'audio/mp4': { ext: 'm4a', max: 2_000_000 },
  'audio/webm': { ext: 'webm', max: 2_000_000 },
  'audio/ogg': { ext: 'ogg', max: 2_000_000 },
};
const BY_EXT = Object.fromEntries(Object.entries(TYPES).map(([type, { ext }]) => [ext, type]));

/** A stored file's name: its content hash, so the same upload twice is one file. */
export const MEDIA_FILE = /^[a-f0-9]{64}\.(png|jpg|webp|mp3|m4a|webm|ogg)$/;
export const MAX_UPLOAD = 2_000_000;

/** Saves an upload (the raw body) and returns its file name. */
export function saveMedia({ headers, body }: Request, dir = MEDIA_DIR) {
  const type = String(headers['content-type'] ?? '').split(';')[0].trim();
  const kind = TYPES[type];
  if (!kind) throw new HttpError(415, `Upload a PNG, JPG or WebP picture, or an MP3, M4A, WebM or OGG recording (not "${type || 'unknown'}")`);
  const data = body as Buffer;
  if (!data?.length) throw new HttpError(400, 'The file is empty');
  if (data.length > kind.max) throw new HttpError(413, `Too big: keep ${type.startsWith('image') ? 'pictures under 1 MB' : 'recordings under 2 MB'}`);
  const file = `${createHash('sha256').update(data).digest('hex')}.${kind.ext}`;
  mkdirSync(dir, { recursive: true });
  const path = join(dir, file);
  if (!existsSync(path)) writeFileSync(path, data);
  return { file };
}

/** Serves an uploaded file; its name never changes, so phones may keep it for good. */
export function readMedia({ params }: Request, dir = MEDIA_DIR): FileReply {
  if (!MEDIA_FILE.test(params.file)) throw new HttpError(404, 'Not found');
  const path = join(dir, params.file);
  if (!existsSync(path)) throw new HttpError(404, 'Not found');
  return new FileReply(readFileSync(path), BY_EXT[params.file.split('.')[1]]);
}
