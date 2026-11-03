import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { todayStats } from './todayStats';
import { useTween } from './useTween';

/** Today's XP goal as a slim bar, with a knob at its tip (indigo at night). */
export function GoalBar({ night }: { night: boolean }) {
  const { progress } = useProgress();
  const today = todayStats(progress);
  const t = useTween(today.fraction);
  const done = today.fraction >= 1;

  return (
    <div className={`goal${done ? ' is-done' : ''}`}>
      <p className="goal-caption">
        <span lang="bn">
          {done ? 'দারুণ! আজকের লক্ষ্য পূর্ণ' : 'আজকের লক্ষ্য'}{' '}
          <strong>
            {toBanglaDigits(today.xp)}/{toBanglaDigits(today.goal)}
          </strong>{' '}
          XP
        </span>
        <span className="goal-extra" lang="bn">
          {toBanglaDigits(today.minutes)} মিনিট · {toBanglaDigits(today.lessons)} লেসন
        </span>
      </p>
      <div className="goal-track" aria-hidden="true">
        <span className="goal-fill" style={{ width: `${t * 100}%` }} />
        <span className={`goal-body${night ? ' is-moon' : ''}`} style={{ left: `${t * 100}%` }} />
      </div>
    </div>
  );
}
