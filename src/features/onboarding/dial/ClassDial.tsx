import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { SCHOOL_CLASSES, STAGES, type ClassLevel } from '../../../data/classLevels';
import { LevelGlyph } from '../LevelGlyph';
import { useDialPointer } from './useDialPointer';

interface Props {
  level: ClassLevel | undefined;
  onPick: (id: string) => void;
}

const classId = (hour: number) => `class-${hour}`;

/** Classes 1–12 around a watch face; tap or drag and the hand springs to the chosen class. */
export function ClassDial({ level, onPick }: Props) {
  const hour = level?.short ? Number(level.id.replace('class-', '')) : null;
  const stage = level ? STAGES[level.stage] : null;

  // Keep a running angle so the hand always turns the short way (12 → 1 doesn't spin backwards).
  const angle = useRef(0);
  if (hour) {
    const target = (hour * 30) % 360;
    const delta = ((((target - angle.current) % 360) + 540) % 360) - 180;
    angle.current += delta;
  }

  const pointer = useDialPointer((h) => {
    if (h !== hour) onPick(classId(h));
  });

  function onKeyDown(e: KeyboardEvent) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    onPick(classId((((hour ?? 0) + step + 11) % 12) + 1));
  }

  const style = {
    '--hand': `${angle.current}deg`,
    ...(stage ? { '--g1': stage.colors[0], '--g2': stage.colors[1] } : {}),
  } as CSSProperties;

  return (
    <div
      className={`dial${hour ? ' has-hand' : ''}`}
      style={style}
      role="radiogroup"
      aria-label="Class"
      tabIndex={0}
      onKeyDown={onKeyDown}
      {...pointer}
    >
      <div className="dial-arcs" />
      <div className="dial-face">
        <div className="dial-ticks" />
      </div>

      <div className="dial-hand" />

      {SCHOOL_CLASSES.map((c, i) => (
        <span
          key={c.id}
          role="radio"
          aria-checked={c.id === level?.id}
          aria-label={c.en}
          className={`dial-num${c.id === level?.id ? ' is-on' : ''}`}
          style={{ '--a': `${(i + 1) * 30}deg` } as CSSProperties}
          lang="bn"
        >
          {c.short}
        </span>
      ))}

      <div className="dial-center" key={level?.id ?? 'empty'}>
        {level ? (
          <>
            {!level.short && (
              <span className="dial-center-icon">
                <LevelGlyph level={level} size={30} />
              </span>
            )}
            <strong lang="bn">{level.bn}</strong>
            {/* University and job are their own stage, so show the English name instead of repeating it. */}
            {stage && stage.bn !== level.bn ? <small lang="bn">{stage.bn}</small> : <small>{level.en}</small>}
          </>
        ) : (
          <>
            <strong className="dial-center-empty">?</strong>
            <small lang="bn">ঘুরিয়ে বেছে নাও</small>
          </>
        )}
      </div>
    </div>
  );
}
