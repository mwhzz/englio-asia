import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { weekReport } from '../../lib/weekReport';
import { reportText, shareReport } from '../../lib/shareReport';
import { haptic } from '../../lib/haptics';

/** This week against last week: XP, lessons, minutes and active days, each with an up or down change. */
export function WeeklyReport() {
  const { progress } = useProgress();
  const { now, before } = weekReport(progress);
  const rows = [
    ['XP', now.xp, before.xp],
    ['লেসন', now.lessons, before.lessons],
    ['মিনিট', now.minutes, before.minutes],
    ['সক্রিয় দিন', now.activeDays, before.activeDays],
  ] as const;
  const better = now.xp >= before.xp;

  return (
    <section className="pf-section">
      <div className="pf-section-head">
        <h2>
          <span lang="bn">সাপ্তাহিক রিপোর্ট</span> <small>Weekly report</small>
        </h2>
        {now.xp > 0 && (
          <button
            className="wr-share"
            onClick={() => {
              haptic();
              shareReport(reportText(progress.profile?.name ?? 'আমি', now, before, progress.streak));
            }}
          >
            <span lang="bn">শেয়ার করো</span>
          </button>
        )}
      </div>
      <ul className="wr">
        {rows.map(([label, a, b]) => {
          const diff = a - b;
          return (
            <li key={label}>
              <strong lang="bn">{toBanglaDigits(a)}</strong>
              <small lang="bn">{label}</small>
              <span className={`wr-diff${diff > 0 ? ' is-up' : diff < 0 ? ' is-down' : ''}`} lang="bn">
                {diff === 0 ? 'একই' : `${diff > 0 ? '↑' : '↓'} ${toBanglaDigits(Math.abs(diff))}`}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="pf-note" lang="bn">
        {now.xp === 0 && before.xp === 0
          ? 'এই সপ্তাহে এখনো শুরু হয়নি। আজ একটা লেসন দিয়ে শুরু করো!'
          : better
            ? 'গত সপ্তাহের চেয়ে ভালো যাচ্ছে, এভাবেই চালিয়ে যাও!'
            : 'গত সপ্তাহের চেয়ে একটু কম। প্রতিদিন অল্প অল্প করলেই হবে।'}
      </p>
    </section>
  );
}
