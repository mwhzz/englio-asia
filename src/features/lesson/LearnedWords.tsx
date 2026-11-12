import type { Vocab } from '../../types';
import { toBanglaDigits } from '../../lib/bangla';
import { INTERVALS } from '../../lib/review';

/** When a word comes back, in plain words (days after today, lib/review.ts INTERVALS). */
const WHEN = ['কাল', 'পরশু', '৪ দিন পর', '৭ দিন পর'];

/**
 * End of a lesson: the words just learned, and when they will come back (docs/LEARNING_DESIGN.md), so the
 * learner sees that learning keeps going after today.
 */
export function LearnedWords({ words }: { words: Vocab[] }) {
  if (!words.length) return null;
  return (
    <section className="lw" aria-label="আজ যা শিখলে">
      <p className="lw-title" lang="bn">
        আজ শিখলে {toBanglaDigits(words.length)}টা নতুন
      </p>
      <div className="lw-chips">
        {words.map((w) => (
          <span key={w.en} className="lw-chip" title={w.bn}>
            <span className="lw-en">{w.en}</span>
            <small lang="bn">{w.bn}</small>
          </span>
        ))}
      </div>
      <p className="lw-title" lang="bn">
        মনে পাকা করতে, এরা আবার আসবে
      </p>
      <ol className="lw-line" aria-label="কবে ফিরবে">
        {INTERVALS.map((_, i) => (
          <li key={i} className={i === 0 ? 'is-next' : ''}>
            <span className="lw-dot" aria-hidden="true" />
            <span lang="bn">{WHEN[i]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
