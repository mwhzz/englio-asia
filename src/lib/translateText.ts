/** The text-swapping rules behind lib/uiText.ts (no browser needed, so the tests can run them). */
type Pattern = { re: RegExp; to: string };

let exact = new Map<string, string>();
let patterns: Pattern[] = [];

const BN_DIGITS = /[০-৯]/g;
const latinDigits = (s: string) => s.replace(BN_DIGITS, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const escape = (s: string) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');

/** Loads a language's translations (source Bangla → text). */
export function setUiText(map: Record<string, string>): void {
  exact = new Map();
  patterns = [];
  for (const [from, to] of Object.entries(map)) {
    if (/\{\d\}/.test(from)) {
      const re = new RegExp(`^${escape(squash(from)).replace(/\\\{(\d)\\\}|\{(\d)\}/g, '(.+?)')}$`);
      patterns.push({ re, to });
    } else exact.set(squash(from), to);
  }
  // Longer patterns first, so the most specific one wins.
  patterns.sort((a, b) => b.re.source.length - a.re.source.length);
}

/** One piece of text in the learner's language. */
export function translate(text: string): string {
  if (!/[ঀ-৿]/.test(text)) return text;
  const lead = /^\s*/.exec(text)![0];
  const tail = /\s*$/.exec(text)![0];
  const core = squash(text);
  const hit = exact.get(core);
  if (hit !== undefined) return lead + hit + tail;
  for (const { re, to } of patterns) {
    const m = re.exec(core);
    if (m) return lead + to.replace(/\{(\d)\}/g, (_, i) => latinDigits(translate(m[Number(i) + 1] ?? ''))) + tail;
  }
  return latinDigits(text);
}

