import type { CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import type { Unit } from '../../types';
import { unitGoal } from '../../data/unitGoals';

interface Props {
  mark: { unit: Unit; unitIndex: number };
  style: CSSProperties;
  done: number;
  onGuide: () => void;
}

/** A unit's glass sign on the path: number, name, progress and guidebook. */
export function UnitSign({ mark, style, done, onGuide }: Props) {
  const { unit, unitIndex } = mark;
  const total = unit.lessons.length;
  const complete = done === total;

  return (
    <div className={`usign${complete ? ' is-complete' : ''}`} style={{ ...style, '--u': unit.color } as CSSProperties}>
      <span className="usign-num" lang="bn">
        {complete ? <Glyph name="check" size={20} /> : toBanglaDigits(unitIndex + 1)}
      </span>
      <span className="usign-text">
        <small>UNIT {unitIndex + 1}</small>
        <strong>{unit.title}</strong>
        <span lang="bn">{unit.titleBn}</span>
        {unitGoal(unit.title) && (
          <span className="usign-goal" lang="bn">
            শেষে পারবে: {unitGoal(unit.title)}
          </span>
        )}
        <span className="usign-bar" aria-hidden="true">
          <span style={{ width: `${(100 * done) / total}%` }} />
        </span>
      </span>
      <span className="usign-count" lang="bn">
        {toBanglaDigits(done)}/{toBanglaDigits(total)}
      </span>
      <button className="usign-guide" onClick={onGuide} aria-label={`${unit.title} guidebook`}>
        <Glyph name="book" size={18} />
      </button>
    </div>
  );
}
