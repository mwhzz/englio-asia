import type { CSSProperties } from 'react';
import { Glyph } from '../../../components/Glyph';
import { toBanglaDigits } from '../../../lib/bangla';
import { haptic } from '../../../lib/haptics';
import type { Unit } from '../../../types';
import { unitLocked } from '../../../lib/appSettings';
import { PlusBadge } from '../../premium/PlusBadge';

/** A unit further ahead, folded into one row; tap to open its lessons. */
export function UnitRow({ unit, unitIndex, onOpen }: { unit: Unit; unitIndex: number; onOpen: () => void }) {
  return (
    <button
      className="urow"
      style={{ '--u': unit.color } as CSSProperties}
      onClick={() => {
        haptic();
        onOpen();
      }}
      aria-expanded={false}
      aria-label={`Unit ${unitIndex + 1}, ${unit.title}: show lessons`}
    >
      <span className="urow-num" lang="bn">
        {toBanglaDigits(unitIndex + 1)}
      </span>
      <span className="urow-text">
        <strong>
          {unit.title} {unitLocked(unit.id) && <PlusBadge />}
        </strong>
        <span lang="bn">
          {unit.titleBn} · {toBanglaDigits(unit.lessons.length)}টি লেসন
        </span>
      </span>
      <Glyph name="chevron" size={18} className="urow-chevron" />
    </button>
  );
}
