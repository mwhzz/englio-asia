import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { PromptCard } from '../../components/PromptCard';
import { SpeakButton } from '../../components/SpeakButton';
import type { ExerciseOf } from '../../types';
import { GlossText } from '../gloss/GlossText';
import type { ExerciseProps } from './props';

/** Hear and read an English sentence, pick its Bangla meaning from an iOS-style list. */
export function ChoiceExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'choice'>>) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      <PromptCard>
        <SpeakButton text={ex.sentence.en} auto /> <GlossText text={ex.sentence.en} />
      </PromptCard>
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
