import { Glyph } from '../../components/Glyph';
import { minutesUntil, nextHeartAt } from '../../lib/hearts';
import { currentStreak } from '../../lib/streak';
import { useProgress } from '../../state/ProgressContext';
import { isPlus } from '../../lib/premium';

/** Streak, XP and hearts as small glass pills. */
export function StatusPills() {
  const { progress } = useProgress();
  const streak = currentStreak(progress);
  const refill = nextHeartAt(progress);

  return (
    <div className="home-pills">
      <span className={`home-pill pill-streak${streak ? '' : ' is-off'}`} title="Day streak" aria-label={`${streak} day streak`}>
        <Glyph name="flame" size={15} />
        {streak}
      </span>
      <span className="home-pill pill-xp" title="Total XP" aria-label={`${progress.xp} XP`}>
        <Glyph name="gem" size={15} />
        {progress.xp}
      </span>
      <span
        className="home-pill pill-heart"
        title={refill ? `Next heart in ${minutesUntil(refill)} min` : 'Hearts full'}
        aria-label={`${progress.hearts} hearts`}
      >
        <Glyph name="heart" size={15} />
        {isPlus() ? '∞' : progress.hearts}
      </span>
    </div>
  );
}
