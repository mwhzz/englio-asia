import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** A Bangla word on the card; pick its English word from the list (each one is read aloud when picked). */
export function SelectExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'select'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <h2 className="prompt-card hero">
        <small>Which one is</small>
        <strong lang="bn">{ex.word.bn}</strong>
      </h2>
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
              speak(choice.en);
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
