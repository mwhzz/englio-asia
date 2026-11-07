import { toBanglaDigits } from '../../lib/bangla';
import type { League } from '../../lib/league';

const MEDALS = ['#c47f45', '#9aa4b1', '#ffb800', '#33c4f0'];

/** ধাপের লিগ: learners of my tier this week, and what moves me up or down when the week ends (server/tiers.ts). */
export function TierLeague({ tier }: { tier: NonNullable<League['tier']> }) {
  return (
    <>
      <div className="gt-hero lgp-hero" lang="bn">
        <span className="lgp-rank" style={{ background: MEDALS[tier.index] }}>
          {tier.bn}
        </span>
        <h1>{tier.bn} লিগ</h1>
        <p className="gt-summary">
          এই সপ্তাহে {toBanglaDigits(tier.promote)}+ XP আনলে পরের ধাপে উঠবে, {toBanglaDigits(tier.keep)} XP-র কম হলে এক ধাপ নামবে।
          {tier.rank ? ` এখন তুমি ${toBanglaDigits(tier.rank)} নম্বরে।` : ' একটা লেসন করলেই তালিকায় আসবে।'}
        </p>
        <p className="lgp-tiers">ব্রোঞ্জ → সিলভার → গোল্ড → ডায়মন্ড</p>
      </div>
      {tier.learners.length > 0 && (
        <section className="gt-card">
          <ol className="lgp-people">
            {tier.learners.map((l, i) => (
              <li key={i} className={l.isMe ? 'is-me' : undefined}>
                <span className="lgp-pos">{toBanglaDigits(i + 1)}</span>
                <span className="lgp-avatar" aria-hidden="true">
                  {l.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="lgp-name">
                  {l.name}
                  {l.isMe && <small lang="bn"> (তুমি)</small>}
                </span>
                <span className="lgp-xp">{toBanglaDigits(l.xp)} XP</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
