import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { dayKey } from '../../lib/days';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';
import { nextLesson } from './nextLesson';
import { useNow } from './useNow';

/** From 5 pm on a day nothing's been learned yet: "one lesson keeps your streak", with a button to do it now. */
export function StreakNudge({ onStart }: { onStart: (lessonId: string) => void }) {
  const { progress } = useProgress();
  const now = useNow();
  const next = nextLesson(progress.completed);
  const learnedToday = (progress.xpByDay[dayKey(now)] ?? 0) > 0;
  if (progress.streak < 1 || learnedToday || now.getHours() < 17 || !next) return null;

  return (
    <button
      className="rc sn home-rise"
      onClick={() => {
        haptic();
        onStart(next.lesson.id);
      }}
    >
      <span className="rc-icon sn-icon" aria-hidden="true">
        <Glyph name="flame" size={20} />
      </span>
      <span className="rc-text">
        <strong lang="bn">{toBanglaDigits(progress.streak)} দিনের স্ট্রিক বাঁচাও</strong>
        <small lang="bn">
          আজ এখনো শেখা হয়নি। একটা লেসন করলেই স্ট্রিক থাকবে
          {progress.streakFreezes > 0 ? ` (না করলে একটা ফ্রিজ খরচ হবে)।` : '।'}
        </small>
      </span>
      <span className="rc-go sn-go" lang="bn">
        এখনই
      </span>
    </button>
  );
}
