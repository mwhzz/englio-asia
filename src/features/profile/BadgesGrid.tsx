import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { BADGES, earned } from '../../lib/badges';
import { useProgress } from '../../state/ProgressContext';

/** Every badge as a medal: earned ones in color, the rest faded with how far along they are. */
export function BadgesGrid() {
  const { progress } = useProgress();
  const got = new Set(earned(progress).map((b) => b.id));

  return (
    <section className="pf-section">
      <div className="pf-section-head">
        <h2>
          <span lang="bn">ব্যাজ</span> <small>Badges</small>
        </h2>
        <span className="pf-section-aside" lang="bn">
          {toBanglaDigits(got.size)}/{toBanglaDigits(BADGES.length)}
        </span>
      </div>
      <ul className="bd-grid">
        {BADGES.map((b) => {
          const on = got.has(b.id);
          const value = Math.min(b.value(progress), b.target);
          return (
            <li key={b.id} className={`bd${on ? ' is-on' : ''}`} title={b.en}>
              <span className="bd-medal" style={{ background: on ? b.color : undefined }}>
                <Glyph name={b.icon} size={20} />
              </span>
              <span className="bd-name" lang="bn">
                {b.bn}
              </span>
              {!on && (
                <span className="bd-bar" aria-label={`${value} of ${b.target}`}>
                  <span style={{ width: `${(100 * value) / b.target}%`, background: b.color }} />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
