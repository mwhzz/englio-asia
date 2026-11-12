import type { CSSProperties } from 'react';
import type { Unit } from '../../../types';
import type { StopState } from '../StopPopover';
import { UnitSign } from '../UnitSign';
import { TrailMark } from './TrailMark';
import { TrailLine } from './TrailLine';
import { trailLayout } from './trailLayout';
import { TrailStop } from './TrailStop';
import { UnitTestStop } from './UnitTestStop';
import { useProgress } from '../../../state/ProgressContext';
import { unitLocked } from '../../../lib/appSettings';
import { PlusBadge } from '../../premium/PlusBadge';

interface Props {
  unit: Unit;
  unitIndex: number;
  /** Position of the unit's first lesson in the whole course. */
  firstIndex: number;
  stateOf: (lessonId: string) => StopState;
  justDone?: string | null;
  openId: string | null;
  onToggle: (lessonId: string) => void;
  onStart: (lessonId: string) => void;
  onGuide: () => void;
  onTest: () => void;
}

/** A unit on the path: its card, then its lessons on a curve. */
export function TrailUnit({ unit, unitIndex, firstIndex, stateOf, justDone, openId, onToggle, onStart, onGuide, onTest }: Props) {
  const { progress } = useProgress();
  const states = unit.lessons.map((l) => stateOf(l.id));
  const { points, height } = trailLayout(unit.lessons.length, unitIndex, states.indexOf('current'));
  const done = states.filter((s) => s === 'done').length;

  return (
    <section className="trail-unit" style={{ '--u': unit.color } as CSSProperties}>
      <UnitSign mark={{ unit, unitIndex }} style={{}} done={done} onGuide={onGuide} />
      {unitLocked(unit.id) && <PlusBadge />}
      <div className="trail-stops" style={{ height }}>
        <TrailMark unit={unit} />
        <TrailLine points={points} states={states} height={height} />
        {unit.lessons.map((lesson, lessonIndex) => (
          <TrailStop
            key={lesson.id}
            place={{ lesson, unit, lessonIndex, unitIndex }}
            point={points[lessonIndex]}
            state={states[lessonIndex]}
            order={firstIndex + lessonIndex}
            open={openId === lesson.id}
            justDone={justDone === lesson.id}
            onToggle={() => onToggle(lesson.id)}
            onStart={() => onStart(lesson.id)}
          />
        ))}
      </div>
      <UnitTestStop ready={done === unit.lessons.length} passed={progress.unitTests?.[unit.id]?.score} onStart={onTest} />
    </section>
  );
}
