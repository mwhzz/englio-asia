import type { CSSProperties } from 'react';
import { Glyph, type GlyphName } from '../../../components/Glyph';
import { haptic } from '../../../lib/haptics';
import { StopPopover, type LessonPlace, type StopState } from '../StopPopover';
import type { TrailPoint } from './trailLayout';

interface Props {
  place: LessonPlace;
  point: TrailPoint;
  state: StopState;
  order: number;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}

/**
 * One lesson as a round button in the unit's color: a check once finished,
 * a play button with a soft ripple for the next one, a lock for the rest.
 * The unit's last lesson is its trophy.
 */
export function TrailStop({ place, point, state, order, open, onToggle, onStart }: Props) {
  const { lesson, unit, lessonIndex } = place;
  const final = lessonIndex === unit.lessons.length - 1;
  const current = state === 'current';
  const icon: GlyphName = current ? 'play' : final ? 'trophy' : state === 'done' ? 'check' : 'lock';
  // Keep the card on screen: nudge it back toward the middle.
  const shift = point.dx > 0 ? -44 : point.dx < 0 ? 44 : 0;

  return (
    <div
      className={`tstop tstop-${state}${final ? ' is-final' : ''}${open ? ' is-open' : ''}`}
      style={
        {
          top: point.y,
          left: `calc(50% + ${point.dx}px)`,
          '--u': unit.color,
          '--shift': `${shift}px`,
          animationDelay: `${120 + order * 50}ms`,
        } as CSSProperties
      }
    >
      <button
        className="tstop-btn"
        onClick={() => {
          haptic();
          onToggle();
        }}
        aria-label={`${lesson.title}, ${state}`}
        aria-expanded={open}
      >
        <Glyph name={icon} size={current ? 30 : final ? 24 : 22} />
      </button>

      {!open &&
        (current ? (
          <button
            className="tstop-start"
            onClick={() => {
              haptic();
              onStart();
            }}
          >
            <strong lang="bn">শুরু করো</strong>
            <small>{lesson.title}</small>
          </button>
        ) : (
          <span className="tstop-name">
            {lesson.title}
            <small lang="bn">{lesson.titleBn}</small>
          </span>
        ))}

      {open && <StopPopover stop={place} state={state} onStart={onStart} />}
    </div>
  );
}
