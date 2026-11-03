import { Glyph } from '../../components/Glyph';
import { useProgress } from '../../state/ProgressContext';
import { weekDays } from './weekDays';

/** The last seven days as small circles: a flame on each day you learned, a ring on today. */
export function WeekStrip() {
  const { progress } = useProgress();

  return (
    <ol className="week" aria-label="Last 7 days">
      {weekDays(progress).map((d, i) => (
        <li
          key={d.key}
          className={`week-day${d.active ? ' is-active' : ''}${d.today ? ' is-today' : ''}`}
          style={{ animationDelay: `${200 + i * 40}ms` }}
        >
          <span className="week-dot">{d.active && <Glyph name="flame" size={15} />}</span>
          <span className="week-letter" lang="bn">
            {d.letter}
          </span>
        </li>
      ))}
    </ol>
  );
}
