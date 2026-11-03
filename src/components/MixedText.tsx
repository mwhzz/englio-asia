// The Bengali Unicode block.
const BANGLA = /[ঀ-৿]/;

// Runs of English inside Bangla text, e.g. "I", "am / is / are", "she's".
const LATIN = /([A-Za-z][A-Za-z'’]*(?:\s*[/→]?\s*[A-Za-z][A-Za-z'’]*)*)/;

/**
 * Bangla text with English words in it. The English runs get `lang="en"` so they use the
 * English font; in the Bangla font a capital "I" looks just like a danda (।).
 */
export function MixedText({ text }: { text: string }) {
  // All-English text (like a quiz sentence) needs no marking.
  if (!BANGLA.test(text)) return <>{text}</>;
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
