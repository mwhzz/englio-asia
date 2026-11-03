import type { CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { COURSE } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';

/** How far through the course: overall, then each unit as a row with a thin bar. */
export function CourseProgress() {
  const { progress } = useProgress();
  const units = COURSE.map((unit) => ({ unit, done: unit.lessons.filter((l) => progress.completed[l.id]).length }));
  const total = units.reduce((n, u) => n + u.unit.lessons.length, 0);
  const done = units.reduce((n, u) => n + u.done, 0);
  const percent = total ? Math.round((100 * done) / total) : 0;

  return (
    <section className="pf-section">
      <div className="pf-section-head">
        <h2>
          <span lang="bn">কোর্সের অগ্রগতি</span> <small>Course</small>
        </h2>
        <span className="pf-section-aside" lang="bn">
          {toBanglaDigits(percent)}%
        </span>
      </div>
      <span className="pf-total" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>

      <ul className="pf-units">
        {units.map(({ unit, done: n }, i) => {
          const complete = n === unit.lessons.length;
          return (
            <li key={unit.id} className={`pf-unit${complete ? ' is-complete' : n ? '' : ' is-fresh'}`} style={{ '--u': unit.color } as CSSProperties}>
              <span className="pf-unit-num" lang="bn">
                {complete ? <Glyph name="check" size={14} /> : toBanglaDigits(i + 1)}
              </span>
              <span className="pf-unit-text">
                <strong>{unit.title}</strong>
                <span className="pf-unit-bar" aria-hidden="true">
                  <span style={{ width: `${(100 * n) / unit.lessons.length}%` }} />
                </span>
              </span>
              <span className="pf-unit-count" lang="bn">
                {toBanglaDigits(n)}/{toBanglaDigits(unit.lessons.length)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
