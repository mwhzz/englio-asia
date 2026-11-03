import { useState, type MouseEvent } from 'react';
import { PromptCard } from '../../components/PromptCard';
import { SpeakButton } from '../../components/SpeakButton';
import { haptic } from '../../lib/haptics';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';
import { useFlip } from './useFlip';

/**
 * Word bank: build the English sentence from tiles, which glide between the bank and the answer.
 * "translate" shows the Bangla sentence; "listen" only plays the English audio.
 */
export function TilesExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'translate'> | ExerciseOf<'listen'>>) {
  const [picked, setPicked] = useState<number[]>([]);
  const { track, fly } = useFlip();
  const listen = ex.kind === 'listen';

  function toggle(i: number, e: MouseEvent<HTMLButtonElement>) {
    const adding = !picked.includes(i);
    const next = adding ? [...picked, i] : picked.filter((p) => p !== i);
    fly(adding ? `a${i}` : `b${i}`, e.currentTarget.getBoundingClientRect());
    if (adding) speak(ex.tiles[i]);
    haptic();
    setPicked(next);
    onChange(next.length ? next.map((p) => ex.tiles[p]).join(' ') : null);
  }

  return (
    <>
      {listen ? (
        <div className="listen-buttons hero">
          <SpeakButton text={ex.sentence.en} big auto />
          <SpeakButton text={ex.sentence.en} slow />
        </div>
      ) : (
        <PromptCard>
          <span lang="bn">{ex.sentence.bn}</span>
        </PromptCard>
      )}
      <div className={`answer-line${picked.length ? '' : ' is-empty'}`}>
        {picked.length === 0 && (
          <span className="answer-hint" lang="bn">
            নিচের শব্দগুলো চাপো
          </span>
        )}
        {picked.map((i) => (
          <button key={i} ref={track(`a${i}`)} type="button" className="tile" disabled={disabled} onClick={(e) => toggle(i, e)}>
            {ex.tiles[i]}
          </button>
        ))}
      </div>
      <div className="bank">
        {ex.tiles.map((tile, i) => (
          <button
            key={i}
            ref={track(`b${i}`)}
            type="button"
            className={`tile${picked.includes(i) ? ' tile-ghost' : ''}`}
            disabled={disabled || picked.includes(i)}
            onClick={(e) => toggle(i, e)}
          >
            {tile}
          </button>
        ))}
      </div>
    </>
  );
}
