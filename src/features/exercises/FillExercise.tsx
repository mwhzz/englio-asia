import { useState } from 'react';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** Grammar practice: choose the word that completes the sentence, from a segmented control. */
export function FillExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'fill'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  const [before, after] = ex.fill.text.split('___');
  return (
    <>
      <div className="qcard hero fill-card">
        <p className="fill-sentence">
          {before}
          <span className={`blank${picked ? ' filled' : ''}`}>{picked ?? ' '}</span>
          {after}
        </p>
        <p className="hint" lang="bn">
          {ex.fill.bn}
        </p>
      </div>
      <div className="segmented" role="radiogroup">
        {ex.fill.options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={picked === option}
            className={`segment${picked === option ? ' selected' : ''}`}
            disabled={disabled}
            onClick={() => {
              setPicked(option);
              onChange(option);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
