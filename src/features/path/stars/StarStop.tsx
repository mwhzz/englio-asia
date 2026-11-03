import type { CSSProperties } from 'react';
import { Glyph, type GlyphName } from '../../../components/Glyph';
import { haptic } from '../../../lib/haptics';
import { StopPopover, type StopState } from '../StopPopover';
import { SKY_WIDTH, type Star } from './starLayout';

interface Props {
  star: Star;
  state: StopState;
  style: CSSProperties;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}

/**
 * One lesson as a star, with its name underneath like a star's name.
 * Finished stars glow in the unit's color; the next one shines with
 * turning rays and a one-tap start button; locked ones are faint outlines.
 */
export function StarStop({ star, state, style, open, onToggle, onStart }: Props) {
  // Keep the card on screen: nudge it toward the middle for stars near the edges.
  const shift = star.x < SKY_WIDTH * 0.4 ? 60 : star.x > SKY_WIDTH * 0.6 ? -60 : 0;
  const current = state === 'current';
  // The last lesson of a unit is its trophy star.
  const final = star.lessonIndex === star.unit.lessons.length - 1;
  const icon: GlyphName = current ? 'star' : final ? 'trophy' : state === 'locked' ? 'star-outline' : 'star';

  return (
    <div
      className={`star star-${state}${open ? ' is-open' : ''}${final ? ' is-final' : ''}`}
      style={{ ...style, '--u': star.unit.color, '--shift': `${shift}px`, '--tw': `${(star.index % 5) * 0.6}s` } as CSSProperties}
    >
      {current && <span className="star-rays" aria-hidden="true" />}
      <button
        className="star-btn"
        onClick={() => {
          haptic();
          onToggle();
        }}
        aria-label={`${star.lesson.title}, ${state}`}
        aria-expanded={open}
      >
        <Glyph name={icon} size={current ? 34 : state === 'done' ? 24 : 22} />
      </button>

      {!open &&
        (current ? (
          <button
            className="star-start"
            onClick={() => {
              haptic();
              onStart();
            }}
          >
            <span className="star-start-play">
              <Glyph name="play" size={14} />
            </span>
            <span className="star-start-text">
              <strong lang="bn">শুরু করো</strong>
              <small>{star.lesson.title}</small>
            </span>
          </button>
        ) : (
          <span className="star-name">
            {star.lesson.title}
            <small lang="bn">{star.lesson.titleBn}</small>
          </span>
        ))}

      {open && <StopPopover stop={star} state={state} onStart={onStart} />}
    </div>
  );
}
