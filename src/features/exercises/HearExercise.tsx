import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** Listening only: hear an English sentence (no text), pick its Bangla meaning; the text shows after answering. */
export function HearExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'hear'>>) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      <div className="qcard hero hear-card">
        <span className="hear-buttons">
          <SpeakButton text={ex.sentence.en} big auto />
          <SpeakButton text={ex.sentence.en} slow />
        </span>
        <p className="hear-text">{disabled ? ex.sentence.en : <span lang="bn">মন দিয়ে শোনো, তারপর মানে বাছো</span>}</p>
      </div>
      <div className="list" role="radiogroup">
        {ex.options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={picked === option}
            className={`row${picked === option ? ' selected' : ''}`}
            disabled={disabled}
            onClick={() => {
              setPicked(option);
              onChange(option);
            }}
          >
            <span lang="bn">{option}</span>
            <span className="row-check">{picked === option && <Glyph name="check" size={18} />}</span>
          </button>
        ))}
      </div>
    </>
  );
}
