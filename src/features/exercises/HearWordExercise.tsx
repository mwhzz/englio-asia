import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/**
 * Hear a word or letter (nothing written), pick which one it was. The ear learns the sound on its own;
 * the choices aren't read aloud, so the sound isn't given away.
 */
export function HearWordExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'hearWord'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => speak(ex.word.en), 350);
    return () => clearTimeout(timer);
  }, [ex.word.en]);

  return (
    <>
      <div className="prompt-card hero hw-card">
        <button type="button" className="hw-play" onClick={() => speak(ex.word.en)} aria-label="আবার শোনো">
          <Glyph name="speaker" size={34} />
        </button>
        <button type="button" className="hw-slow" onClick={() => speak(ex.word.en, true)} lang="bn">
          ধীরে শোনো
        </button>
      </div>
      <div className="list" role="radiogroup">
        {ex.choices.map((choice) => (
          <button
            key={choice.en}
            type="button"
            role="radio"
            aria-checked={picked === choice.en}
            className={`row is-word${picked === choice.en ? ' selected' : ''}`}
            disabled={disabled}
            onClick={() => {
              setPicked(choice.en);
              onChange(choice.en);
            }}
          >
            <span className="row-word">{choice.en}</span>
            <span className="row-check">{picked === choice.en && <Glyph name="check" size={18} />}</span>
          </button>
        ))}
      </div>
    </>
  );
}
