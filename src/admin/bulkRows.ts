import type { ItemData, ItemKind } from './itemSchemas';

/** The kinds that can be added many at once, one row each, and the columns of a row. */
export const BULK: Partial<Record<ItemKind, { columns: string; example: string; toData: (cells: string[]) => ItemData }>> = {
  vocab: {
    columns: 'English | বাংলা',
    example: 'teacher | শিক্ষক',
    toData: ([en = '', bn = '']) => ({ en, bn }),
  },
  sentence: {
    columns: 'English | বাংলা | other correct answers (; between them)',
    example: 'I am a student. | আমি একজন ছাত্র। | I’m a student.',
    toData: ([en = '', bn = '', alt = '']) => ({ en, bn, alt: alt.split(';').map((a) => a.trim()).filter(Boolean) }),
  },
  fill: {
    columns: 'sentence with ___ | right word | choices (, between them) | বাংলা',
    example: 'She ___ a doctor. | is | is, am, are | সে একজন ডাক্তার।',
    toData: ([text = '', answer = '', options = '', bn = '']) => ({ text, answer, options: options.split(',').map((o) => o.trim()).filter(Boolean), bn }),
  },
};

/** Splits one row: a tab (pasted from Excel or Google Sheets), else "|", else a comma for two-column CSV. */
function cellsOf(line: string, columns: number): string[] {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  if (line.includes('|')) return line.split('|').map((c) => c.trim());
  // A CSV row: "a","b" quoted cells, or plain a,b when there are only two columns.
  if (/^\s*"/.test(line)) return [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((m) => m[1].replace(/""/g, '"').trim());
  return columns === 2 ? line.split(',').map((c) => c.trim()) : [line.trim()];
}

/** The rows of a pasted table or CSV file as item data; blank lines and a header row are skipped. */
export function parseRows(kind: ItemKind, text: string): ItemData[] {
  const bulk = BULK[kind];
  if (!bulk) return [];
  const columns = bulk.columns.split('|').length;
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .filter((line, i) => !(i === 0 && /^\W*(english|en|sentence)\b/i.test(line)))
    .map((line) => bulk.toData(cellsOf(line, columns)));
}
