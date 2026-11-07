/**
 * Small word swaps on the Bangla text on screen, now and as it's drawn: আপনি for adults (lib/polite.ts), and
 * "ইংরেজি" → "আরবি" in a course that teaches Arabic. Each swap is a function from text to text; one observer runs them all.
 */
type Swap = (text: string) => string;

const swaps: Swap[] = [];
let observer: MutationObserver | null = null;

const skip = (node: Node) => !node.parentElement || !!node.parentElement.closest('input, textarea, [contenteditable], [data-no-polite], script, style');

function fix(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const before = node.nodeValue ?? '';
    if (!/[ঀ-৿]/.test(before) || skip(node)) return;
    const after = swaps.reduce((t, swap) => swap(t), before);
    if (after !== before) node.nodeValue = after;
    return;
  }
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n);
}

export function addTextSwap(swap: Swap): void {
  if (swaps.includes(swap)) return;
  swaps.push(swap);
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
  fix(document.body);
  if (observer) return;
  observer = new MutationObserver((changes) => {
    for (const c of changes) {
      if (c.type === 'characterData') fix(c.target);
      else c.addedNodes.forEach(fix);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
}

export function removeTextSwap(swap: Swap): void {
  const i = swaps.indexOf(swap);
  if (i >= 0) swaps.splice(i, 1);
}

const BN = '\\u0980-\\u09FF';
/** A swap that changes whole Bangla words by a table. */
export function wordSwap(words: Record<string, string>): Swap {
  const re = new RegExp(`(?<![${BN}])(${Object.keys(words).join('|')})(?![${BN}])`, 'g');
  return (text) => text.replace(re, (w) => words[w] ?? w);
}
