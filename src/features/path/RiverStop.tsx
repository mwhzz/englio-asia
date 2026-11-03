import type { CSSProperties } from 'react';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';
import { SCENE_WIDTH, type Stop } from './riverLayout';
import { StopPopover, type StopState } from './StopPopover';

export type { StopState };

interface Props {
  stop: Stop;
  state: StopState;
  style: CSSProperties;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}

/** A lesson: a round stop on the river bank, with its card when tapped. */
export function RiverStop({ stop, state, style, open, onToggle, onStart }: Props) {
  const last = stop.lessonIndex === stop.unit.lessons.length - 1;
  const icon: GlyphName = state === 'locked' ? 'lock' : state === 'done' ? 'check' : last ? 'trophy' : 'star';
  // Keep the card on screen: nudge it toward the middle for stops near the edges.
  const shift = stop.x < SCENE_WIDTH * 0.4 ? 52 : stop.x > SCENE_WIDTH * 0.6 ? -52 : 0;

  return (
    <div
      className={`rstop rstop-${state}${open ? ' is-open' : ''}`}
      style={{ ...style, '--u': stop.unit.color, '--shift': `${shift}px` } as CSSProperties}
    >
      {state === 'current' && !open && (
        <span className="rstop-tag" lang="bn">
          শুরু করো
        </span>
      )}
      <button
        className="rstop-btn"
        onClick={() => {
          haptic();
          onToggle();
        }}
        aria-label={`${stop.lesson.title}, ${state}`}
        aria-expanded={open}
      >
        <Glyph name={icon} size={state === 'current' ? 30 : 24} />
      </button>
      {open && <StopPopover stop={stop} state={state} onStart={onStart} />}
    </div>
  );
}
