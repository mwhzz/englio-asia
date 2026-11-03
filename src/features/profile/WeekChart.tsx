import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { weekDays } from '../home/weekDays';

/** XP earned on each of the last 7 days as bars, with the daily goal as a dashed line. */
export function WeekChart() {
  const { progress } = useProgress();
  const days = weekDays(progress).map((d) => ({ ...d, xp: progress.xpByDay[d.key] ?? 0 }));
  const goal = progress.dailyGoal;
  const max = Math.max(goal * 1.25, ...days.map((d) => d.xp));
  const total = days.reduce((sum, d) => sum + d.xp, 0);
  const met = days.filter((d) => d.xp >= goal).length;

  return (
    <section className="pf-section">
      <div className="pf-section-head">
        <h2>
          <span lang="bn">এই সপ্তাহ</span> <small>This week</small>
        </h2>
        <span className="pf-section-aside" lang="bn">
          মোট {toBanglaDigits(total)} XP
        </span>
      </div>

      <div className="pf-chart" role="img" aria-label={`${total} XP in the last 7 days; goal met on ${met} days`}>
        <div className="pf-plot">
          {/* The bars fill the plot below its 16px top padding, so the line is measured the same way. */}
          <span className="pf-goal" style={{ bottom: `calc((100% - 16px) * ${goal / max})` }} />
          {days.map((d, i) => (
            <div key={d.key} className="pf-bar-area">
              <span
                className={`pf-bar${d.xp >= goal ? ' is-met' : ''}`}
                style={{ height: `${(100 * d.xp) / max}%`, animationDelay: `${200 + i * 50}ms` }}
              >
                {d.xp > 0 && <em lang="bn">{toBanglaDigits(d.xp)}</em>}
              </span>
            </div>
          ))}
        </div>
        <div className="pf-days">
          {days.map((d) => (
            <span key={d.key} className={`pf-day${d.today ? ' is-today' : ''}`} lang="bn">
              {d.letter}
            </span>
          ))}
        </div>
      </div>

      <p className="pf-note" lang="bn">
        <span className="pf-goal-key" aria-hidden="true" /> দিনের লক্ষ্য {toBanglaDigits(goal)} XP · ৭ দিনের {toBanglaDigits(met)} দিন পূর্ণ
      </p>
    </section>
  );
}
