/** One word of the sentence to say, and whether the learner was heard saying it. */
export interface SaidWord {
  word: string;
  ok: boolean;
}

const clean = (w: string) =>
  w
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9']/g, '');

/** Speech engines write numbers as digits and drop apostrophes; count those as the same word. */
const NUMBERS: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
const same = (a: string, b: string) => a === b || a.replace(/'/g, '') === b.replace(/'/g, '') || NUMBERS[a] === b || NUMBERS[b] === a;

/**
 * Lines up what the speech engine heard with the sentence (longest common subsequence), so each word of
 * the sentence is marked heard or missed even when the learner adds, skips or swaps a word.
 */
export function compareSpoken(target: string, heard: string): { words: SaidWord[]; score: number } {
  const want = target.split(/\s+/).filter(Boolean);
  const wantKeys = want.map(clean);
  const got = heard.split(/\s+/).map(clean).filter(Boolean);
  const m = want.length;
  const n = got.length;
  const table = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      table[i][j] = wantKeys[i] && same(wantKeys[i], got[j]) ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const ok = new Array<boolean>(m).fill(false);
  for (let i = 0, j = 0; i < m && j < n; ) {
    if (wantKeys[i] && same(wantKeys[i], got[j])) {
      ok[i] = true;
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  // Punctuation-only "words" (a lone dash) don't count either way.
  const words = want.map((word, i) => ({ word, ok: ok[i] || !wantKeys[i] }));
  const counted = wantKeys.filter(Boolean).length;
  const right = wantKeys.filter((k, i) => k && ok[i]).length;
  return { words, score: counted ? Math.round((100 * right) / counted) : 0 };
}
