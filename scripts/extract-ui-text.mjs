// Collects every piece of Bangla text the app shows (JSX text, string and template literals with Bangla in
// them) from src/, outside the admin, the course data and tests, into content/ui-strings.json. Translators
// translate these (admin → অ্যাপের লেখা); the app swaps them on screen (src/lib/uiText.ts).
// Template literals become patterns: `${n}টা প্রশ্ন` → "{0}টা প্রশ্ন".
//   node scripts/extract-ui-text.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BN = /[ঀ-৿]/;
// Data files whose words the app shows as its own text (class names, their focus).
const INCLUDE = /[\\/]data[\\/]classLevels\.ts$/;
const SKIP = /(^|[\\/])(admin|data|preview)([\\/]|$)|\.test\.|\.d\.ts$/;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name) && (!SKIP.test(p) || INCLUDE.test(p))) files.push(p);
  }
})('src');

const found = new Set();
const add = (t) => {
  const s = t.replace(/\s+/g, ' ').trim();
  // Regular expressions over Bangla letters aren't text.
  if (s && BN.test(s) && !/^\/|\[[^\]]*[ঀ-৿]-/.test(s)) found.add(s);
};

const SQ = /'((?:[^'\\\n]|\\.)*)'/g;
const DQ = /"((?:[^"\\\n]|\\.)*)"/g;
const TPL = /`((?:[^`\\]|\\.)*)`/g;
const EXPR = /\$\{(?:[^{}]|\{[^{}]*\})*\}/g;
const JSX = [/>([^<>{}]*[ঀ-৿][^<>{}]*)</g, /\}([^<>{}]*[ঀ-৿][^<>{}]*)[<{]/g, />([^<>{}]*[ঀ-৿][^<>{}]*)\{/g];

for (const file of files) {
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  for (const m of src.matchAll(SQ)) add(m[1].replace(/\\'/g, "'"));
  for (const m of src.matchAll(DQ)) add(m[1]);
  for (const m of src.matchAll(TPL)) {
    let i = 0;
    add(m[1].replace(EXPR, () => `{${i++}}`));
  }
  // JSX text: only what reads like text, not code that happens to sit between braces.
  for (const re of JSX) for (const m of src.matchAll(re)) if (!/[;=`'"()[\]]|=>|(const|return|export|import)/.test(m[1])) add(m[1]);
}
const list = [...found].sort();
const text = JSON.stringify(list, null, 1) + '\n';
// --check (the tests): only says whether the list is out of date.
if (process.argv.includes('--check')) {
  // Line endings don't count (git on Windows may check the file out with CRLF).
  const same = readFileSync('content/ui-strings.json', 'utf8').replace(/\r\n/g, '\n') === text;
  if (!same) console.error('content/ui-strings.json is out of date: run node scripts/extract-ui-text.mjs and translate the new texts');
  process.exit(same ? 0 : 1);
}
writeFileSync('content/ui-strings.json', text);
console.log(`${list.length} texts from ${files.length} files`);
