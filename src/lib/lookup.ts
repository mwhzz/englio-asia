import { ALL_LESSONS } from '../data/course';

type Dictionary = Record<string, string>;
let dictionary: Dictionary | null = null;

/** The dictionary (about 1,300 words) loads only when a word is first tapped. */
async function load(): Promise<Dictionary> {
  dictionary ??= (await import('../data/dictionary')).DICTIONARY;
  return dictionary;
}

/** Words from the lessons count too, with the meaning the course uses. */
const courseWords = () => {
  const map = new Map<string, string>();
  for (const { lesson } of ALL_LESSONS) for (const v of lesson.vocab) map.set(v.en.toLowerCase(), v.bn);
  return map;
};

/** The forms a word may be the base of: books → book, studied → study, running → run, making → make… */
export function baseForms(word: string): string[] {
  const w = word.toLowerCase();
  const out = [w];
  const add = (x: string) => x.length > 1 && !out.includes(x) && out.push(x);
  if (w.endsWith("'s") || w.endsWith('’s')) add(w.slice(0, -2));
  if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) add(w.slice(0, -2));
  if (w.endsWith('s')) add(w.slice(0, -1));
  if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    if (w.at(-3) === w.at(-4)) add(w.slice(0, -3));
  }
  if (w.endsWith('ing')) {
    add(w.slice(0, -3));
    add(w.slice(0, -3) + 'e');
    if (w.at(-4) === w.at(-5)) add(w.slice(0, -4));
  }
  if (w.endsWith('ly')) add(w.slice(0, -2));
  if (w.endsWith('er')) add(w.slice(0, -2));
  if (w.endsWith('est')) add(w.slice(0, -3));
  return out;
}

/** Strips what's around a word in a sentence: quotes, commas, full stops. */
export const bareWord = (token: string) => token.replace(/^[^A-Za-z0-9’']+|[^A-Za-z0-9’']+$/g, '');

/** A word's Bangla meaning and the form that was found, or null when it isn't known. */
export async function lookup(token: string): Promise<{ word: string; bn: string } | null> {
  const dict = await load();
  const course = courseWords();
  for (const form of baseForms(bareWord(token))) {
    const bn = Object.hasOwn(dict, form) ? dict[form] : course.get(form);
    if (typeof bn === 'string') return { word: form, bn };
  }
  return null;
}
