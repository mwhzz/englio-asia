import { Glyph } from '../../components/Glyph';

interface Props {
  done: number;
  total: number;
  hearts: number | null;
  onQuit: () => void;
}

/** Close button, a thin progress bar in the unit's color, and hearts (or a practice badge when `hearts` is null). */
export function LessonHeader({ done, total, hearts, onQuit }: Props) {
  const percent = (100 * Math.min(done, total)) / total;
  return (
    <header className="lesson-top">
      <button className="lesson-close" onClick={onQuit} aria-label="Quit lesson">
        <Glyph name="close" size={13} />
      </button>
      <div className="lesson-progress" role="progressbar" aria-valuenow={done} aria-valuemax={total}>
        <div className="lesson-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {hearts === null ? (
        <span className="lesson-pill is-practice" aria-label="Practice">
          <Glyph name="dumbbell" size={16} />
        </span>
      ) : (
        <span className="lesson-pill" key={hearts} aria-label={`${hearts} hearts`}>
          <Glyph name="heart" size={15} />
          {hearts === Infinity ? '∞' : hearts}
        </span>
      )}
    </header>
  );
}
