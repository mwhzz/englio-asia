/**
 * The app in the learner's language. The app is written in Bangla; for another language every Bangla text on
 * screen is swapped for its translation (content/ui/<lang>.json, editable in admin → অ্যাপের লেখা), sent
 * with the course as `ui`. Texts made from a template ("{0}টা প্রশ্ন") match with their numbers or names in
 * place. Bangla digits become 0–9. Text without a translation stays as it is (the admin lists what's missing).
 */
import { translate } from './translateText';

export { setUiText, translate } from './translateText';

let observer: MutationObserver | null = null;

const skip = (node: Node) => !node.parentElement || !!node.parentElement.closest('input, textarea, [contenteditable], [data-no-translate], script, style');
const ATTRS = ['placeholder', 'aria-label', 'title'];

function fix(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const before = node.nodeValue ?? '';
    if (!/[ঀ-৿]/.test(before) || skip(node)) return;
    const after = translate(before);
    if (after !== before) node.nodeValue = after;
    return;
  }
  if (node instanceof Element) {
    for (const a of ATTRS) {
      const v = node.getAttribute(a);
      if (v && /[ঀ-৿]/.test(v)) node.setAttribute(a, translate(v));
    }
    node.querySelectorAll('[placeholder], [aria-label], [title]').forEach((el) => fix(el));
  }
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n);
}

/** Shows everything on screen, now and later, in the loaded language; `dir` turns the layout right-to-left. */
export function applyUiText(lang: string, dir: 'ltr' | 'rtl'): void {
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  if (observer || typeof MutationObserver === 'undefined') return;
  fix(document.body);
  observer = new MutationObserver((changes) => {
    for (const c of changes) {
      if (c.type === 'characterData') fix(c.target);
      else if (c.type === 'attributes') fix(c.target);
      else c.addedNodes.forEach(fix);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
