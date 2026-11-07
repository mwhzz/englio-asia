import { HttpError } from './http.ts';
import { MEDIA_FILE } from './media.ts';

export const ITEM_KINDS = ['vocab', 'sentence', 'fill', 'gaps', 'grammar', 'dialog'] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

type Obj = Record<string, unknown>;

function str(o: Obj, key: string, optional = false): string {
  const value = o[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (optional && (value === undefined || value === '')) return '';
  throw new HttpError(400, `"${key}" must be text`);
}

function list(o: Obj, key: string, min = 0): string[] {
  const value = o[key] ?? [];
  if (!Array.isArray(value) || value.some((x) => typeof x !== 'string')) throw new HttpError(400, `"${key}" must be a list of text`);
  const items = value.map((x: string) => x.trim()).filter(Boolean);
  if (items.length < min) throw new HttpError(400, `"${key}" needs at least ${min}`);
  return items;
}

const blanks = (s: string) => s.split('___').length - 1;

/** The optional "why it's right" note, kept only when written. */
const why = (o: Obj): Obj => {
  const w = str(o, 'why', true);
  return w ? { why: w } : {};
};

/** An optional uploaded file (see media.ts): kept only if it names one. */
function media(o: Obj, key: 'image' | 'audio'): Obj {
  const v = o[key];
  if (v == null || v === '') return {};
  if (typeof v !== 'string' || !MEDIA_FILE.test(v)) throw new HttpError(400, `"${key}" must be an uploaded file`);
  if (key === 'image' ? !/\.(png|jpg|webp)$/.test(v) : !/\.(mp3|m4a|webm|ogg)$/.test(v)) throw new HttpError(400, `"${key}" is the wrong kind of file`);
  return { [key]: v };
}

/**
 * Checks one content item and returns it cleaned up (trimmed, only known fields),
 * so everything in the database can be turned into exercises the app can solve.
 */
export function validateItem(kind: string, data: unknown): Obj {
  if (!ITEM_KINDS.includes(kind as ItemKind)) throw new HttpError(400, `Unknown kind "${kind}"`);
  if (!data || typeof data !== 'object') throw new HttpError(400, '"data" must be an object');
  const o = data as Obj;

  switch (kind as ItemKind) {
    case 'vocab':
      return { en: str(o, 'en'), bn: str(o, 'bn'), emoji: str(o, 'emoji', true), ...media(o, 'image'), ...media(o, 'audio') };
    case 'sentence':
      return { en: str(o, 'en'), bn: str(o, 'bn'), alt: list(o, 'alt'), ...media(o, 'audio') };
    case 'fill': {
      const out = { text: str(o, 'text'), answer: str(o, 'answer'), options: list(o, 'options', 2), bn: str(o, 'bn'), ...why(o) };
      if (blanks(out.text) !== 1) throw new HttpError(400, 'The text needs exactly one ___');
      if (!out.options.includes(out.answer)) throw new HttpError(400, 'The options must include the answer');
      return out;
    }
    case 'gaps': {
      const out = { text: str(o, 'text'), answers: list(o, 'answers', 1), extra: list(o, 'extra'), bn: str(o, 'bn'), ...why(o) };
      if (blanks(out.text) !== out.answers.length) throw new HttpError(400, 'Each ___ needs exactly one answer, in order');
      if (out.extra.some((w) => out.answers.includes(w))) throw new HttpError(400, 'Wrong words must not be answers');
      return out;
    }
    case 'grammar': {
      const out = { rule: str(o, 'rule'), correct: str(o, 'correct'), wrong: list(o, 'wrong', 1), why: str(o, 'why') };
      if (out.wrong.includes(out.correct)) throw new HttpError(400, 'A wrong sentence is the same as the correct one');
      return out;
    }
    case 'dialog': {
      const raw = o.lines;
      if (!Array.isArray(raw) || raw.length < 2) throw new HttpError(400, 'A dialogue needs at least 2 lines');
      const lines = raw.map((line: Obj) => {
        if (line?.who !== 'them' && line?.who !== 'you') throw new HttpError(400, 'Each line is said by "them" or "you"');
        return { who: line.who, en: str(line, 'en'), bn: str(line, 'bn') };
      });
      const reply = lines.length - 1;
      if (lines[reply].who !== 'you') throw new HttpError(400, 'The last line must be yours ("you")');
      const out = { with: str(o, 'with'), lines, reply, wrong: list(o, 'wrong', 1), ...why(o) };
      if (out.wrong.includes(lines[reply].en)) throw new HttpError(400, 'A wrong reply is the same as the right one');
      return out;
    }
  }
}
