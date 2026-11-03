import type { CSSProperties } from 'react';
import { OTHER_LEVELS, STAGES } from '../../../data/classLevels';
import { LevelGlyph } from '../LevelGlyph';

/** University and job: the two choices that aren't on the class dial. */
export function OtherLevels({ selectedId, onPick }: { selectedId: string | null; onPick: (id: string) => void }) {
  return (
    <div className="ob-alt" role="radiogroup" aria-label="Other">
      {OTHER_LEVELS.map((level) => {
        const [g1, g2] = STAGES[level.stage].colors;
        const on = level.id === selectedId;
        return (
          <button
            key={level.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={level.en}
            className={`ob-alt-item${on ? ' is-on' : ''}`}
            style={{ '--g1': g1, '--g2': g2 } as CSSProperties}
            onClick={() => onPick(level.id)}
          >
            <LevelGlyph level={level} size={20} />
            <span lang="bn">{level.bn}</span>
          </button>
        );
      })}
    </div>
  );
}
