import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { dueKeys } from '../../lib/review';
import { ALL_LESSONS } from '../../data/course';
import { useProgress } from '../../state/ProgressContext';

/**
 * Shown when learned words or sentences are due again (every taught word comes back after 1, 2, 4 and 7
 * days, lib/review.ts): a few of them as chips, and one tap starts a short review.
 */
export function ReviewCard({ onStart }: { onStart: () => void }) {
  const { progress } = useProgress();
  const due = dueKeys(progress).length;
  if (!due) return null;
  const known = new Set(ALL_LESSONS.flatMap((x) => x.lesson.vocab.map((v) => v.en)));
  const words = dueKeys(progress)
    .filter((k) => k.startsWith('w:') && known.has(k.slice(2)))
    .slice(0, 4)
    .map((k) => k.slice(2));

  return (
    <button
      className="rc home-rise"
      style={{ animationDelay: '180ms' }}
      onClick={() => {
        haptic();
        onStart();
      }}
    >
      <span className="rc-icon" aria-hidden="true">
        <Glyph name="shuffle" size={20} />
      </span>
      <span className="rc-text">
        <strong lang="bn">আজ {toBanglaDigits(due)}টা জিনিস ফিরছে</strong>
        <small lang="bn">মনে পাকা করতে ২ মিনিটের ঝালাই</small>
        {words.length > 0 && (
          <span className="rc-words">
            {words.map((w) => (
              <span key={w} className="rc-word">
                {w}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="rc-go" lang="bn">
        শুরু
      </span>
    </button>
  );
}
