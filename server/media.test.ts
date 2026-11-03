import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readMedia, saveMedia } from './media.ts';
import { validateItem } from './validate.ts';
import type { Request } from './http.ts';

const dir = mkdtempSync(join(tmpdir(), 'englio-media-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const upload = (type: string, body: Buffer) => ({ headers: { 'content-type': type }, body }) as unknown as Request;
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

describe('media', () => {
  it('stores an upload under its content hash, once', () => {
    const { file } = saveMedia(upload('image/png', PNG), dir);
    expect(file).toMatch(/^[a-f0-9]{64}\.png$/);
    expect(saveMedia(upload('image/png', PNG), dir).file).toBe(file);
    const reply = readMedia({ params: { file } } as unknown as Request, dir);
    expect(reply.type).toBe('image/png');
    expect(reply.data.equals(PNG)).toBe(true);
  });

  it('refuses other types, big files and odd names', () => {
    expect(() => saveMedia(upload('application/pdf', PNG), dir)).toThrow(/PNG/);
    expect(() => saveMedia(upload('image/png', Buffer.alloc(1_100_000)), dir)).toThrow(/1 MB/);
    expect(() => readMedia({ params: { file: '../secret.db' } } as unknown as Request, dir)).toThrow();
  });

  it('lets words and sentences point at uploads of the right kind', () => {
    const image = `${'a'.repeat(64)}.png`;
    const audio = `${'b'.repeat(64)}.mp3`;
    expect(validateItem('vocab', { en: 'cat', bn: 'বিড়াল', image, audio })).toMatchObject({ image, audio });
    expect(validateItem('sentence', { en: 'Hi.', bn: 'হাই।', audio })).toMatchObject({ audio });
    expect(() => validateItem('vocab', { en: 'cat', bn: 'বিড়াল', image: audio })).toThrow();
    expect(() => validateItem('vocab', { en: 'cat', bn: 'বিড়াল', image: 'http://evil/x.png' })).toThrow();
  });
});
