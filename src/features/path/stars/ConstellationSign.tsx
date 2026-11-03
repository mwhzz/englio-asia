import type { CSSProperties } from 'react';
import { Glyph } from '../../../components/Glyph';
import { toBanglaDigits } from '../../../lib/bangla';
import type { Unit } from '../../../types';

interface Props {
  unit: Unit;
  unitIndex: number;
  style: CSSProperties;
  done: (lessonId: string) => boolean;
  onGuide: () => void;
}

/** A unit's sign on the sky: its number, name, one little star per lesson, and the guidebook. */
export function ConstellationSign({ unit, unitIndex, style, done, onGuide }: Props) {
  const finished = unit.lessons.filter((l) => done(l.id)).length;
  const complete = finished === unit.lessons.length;

  return (
    <div className={`csign${complete ? ' is-complete' : ''}`} style={{ ...style, '--u': unit.color } as CSSProperties}>
      <span className="csign-num" lang="bn">
        {complete ? <Glyph name="check" size={18} /> : toBanglaDigits(unitIndex + 1)}
      </span>
      <span className="csign-text">
        <small>UNIT {unitIndex + 1}</small>
        <strong>{unit.title}</strong>
        <span className="csign-stars" aria-label={`${finished} of ${unit.lessons.length} lessons done`}>
          {unit.lessons.map((l) => (
            <Glyph key={l.id} name={done(l.id) ? 'star' : 'star-outline'} size={12} className={done(l.id) ? 'is-lit' : undefined} />
          ))}
          <span lang="bn">{unit.titleBn}</span>
        </span>
      </span>
      <button className="csign-guide" onClick={onGuide} aria-label={`${unit.title} guidebook`}>
        <Glyph name="book" size={17} />
      </button>
    </div>
  );
}
