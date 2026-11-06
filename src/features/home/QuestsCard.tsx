import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { allDone, canClaim, claimQuests, todaysQuests } from '../../lib/quests';
import { playSound } from '../../lib/sounds';
import { MAX_FREEZES } from '../../lib/streak';
import { useProgress } from '../../state/ProgressContext';

/** আজকের কাজ: three small goals for today with their bars; all three done gives a streak freeze. */
export function QuestsCard() {
  const { progress, update } = useProgress();
  const quests = todaysQuests(progress);
  const done = allDone(quests);
  const claimable = canClaim(progress);
  const full = (progress.streakFreezes ?? 0) >= MAX_FREEZES;

  return (
    <section className="qc home-rise" aria-label="Today's quests">
      <h2 className="qc-title" lang="bn">
        আজকের কাজ
        <small>{done ? 'সব শেষ!' : `${toBanglaDigits(quests.filter((q) => q.done >= q.target).length)}/৩`}</small>
      </h2>
      <ul className="qc-list">
        {quests.map((q) => {
          const finished = q.done >= q.target;
          return (
            <li key={q.id} className={finished ? 'is-done' : undefined}>
              <span className="qc-check" aria-hidden="true">
                {finished && <Glyph name="check" size={14} />}
              </span>
              <span className="qc-text" lang="bn">
                {q.bn}
                <span className="qc-bar">
                  <i style={{ width: `${Math.min(100, (100 * q.done) / q.target)}%` }} />
                </span>
              </span>
              <small className="qc-num">
                {toBanglaDigits(Math.min(q.done, q.target))}/{toBanglaDigits(q.target)}
              </small>
            </li>
          );
        })}
      </ul>
      {claimable ? (
        <button
          className="cta qc-claim"
          onClick={() => {
            haptic();
            playSound('correct');
            update((p) => claimQuests(p));
          }}
        >
          <span lang="bn">{full ? 'দারুণ! আজকের সব কাজ শেষ' : 'পুরস্কার নাও: ১টা স্ট্রিক ফ্রিজ'}</span>
        </button>
      ) : (
        !done && (
          <p className="qc-hint" lang="bn">
            তিনটাই শেষ করলে একটা স্ট্রিক ফ্রিজ পাবে।
          </p>
        )
      )}
    </section>
  );
}
