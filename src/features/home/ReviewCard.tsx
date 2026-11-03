import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { dueKeys } from '../../lib/review';
import { useProgress } from '../../state/ProgressContext';

/** Shown when missed words or sentences are due again: one tap starts a short review. */
export function ReviewCard({ onStart }: { onStart: () => void }) {
  const { progress } = useProgress();
  const due = dueKeys(progress).length;
  if (!due) return null;

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
        <strong lang="bn">ভুল ঝালাই</strong>
        <small lang="bn">
          আগে ভুল হওয়া {toBanglaDigits(due)}টা শব্দ ও বাক্য আজ আবার এসেছে
        </small>
      </span>
      <span className="rc-go" lang="bn">
        শুরু
      </span>
    </button>
  );
}
