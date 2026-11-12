// The Bengali Unicode block.
const BANGLA = /[ঀ-৿]/;

// Runs of English inside Bangla text, e.g. "I", "am / is / are", "she's".
const LATIN = /([A-Za-z][A-Za-z'’]*(?:\s*[/→]?\s*[A-Za-z][A-Za-z'’]*)*)/;

// An Arabic vowel mark written on its own, like "( َ )", " ٍ = ইন" or "ًا" at the start: alone it sits on a
// space (or nothing) and can't be seen. Groups: the space before it, the mark (and Arabic letters after it).
const LONE_MARK = /(^|\s)\(?\s*([\u064B-\u0652\u0670][\u0600-\u06FF]*)\s*\)?/;

/** Bangla text with English (and English-font) runs marked. */
function Runs({ text }: { text: string }) {
  return (
    <>
      {text.split(LATIN).map((part, i) =>
        i % 2 ? (
          <span key={i} lang="en">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Each mark's own spacing form (Arabic Presentation Forms-B): drawn by the Arabic font with nothing under it.
const ISOLATED: Record<string, string> = {
  '\u064B': '\uFE70', // fathatan
  '\u064C': '\uFE72', // dammatan
  '\u064D': '\uFE74', // kasratan
  '\u064E': '\uFE76', // fatha (যবর)
  '\u064F': '\uFE78', // damma (পেশ)
  '\u0650': '\uFE7A', // kasra (যের)
  '\u0651': '\uFE7C', // shadda (তাশদীদ)
  '\u0652': '\uFE7E', // sukun
};
const alone = (mark: string) => (ISOLATED[mark[0]] ? ISOLATED[mark[0]] + mark.slice(1) : '\u0640' + mark);

/**
 * Bangla text with English words in it. The English runs get `lang="en"` so they use the
 * English font; in the Bangla font a capital "I" looks just like a danda (।). An Arabic mark
 * written alone ("( َ )") is shown big in its own spacing form, highlighted, so it can be seen.
 */
export function MixedText({ text }: { text: string }) {
  // All-English text (like a quiz sentence) needs no marking.
  if (!BANGLA.test(text)) return <>{text}</>;
  if (!LONE_MARK.test(text)) return <Runs text={text} />;
  const parts = text.split(LONE_MARK);
  return (
    <>
      {parts.map((part, i) =>
        i % 3 === 2 ? (
          <span key={i} className="ar-mark" lang="ar" dir="rtl">
            {alone(part)}
          </span>
        ) : (
          <Runs key={i} text={part} />
        ),
      )}
    </>
  );
}
