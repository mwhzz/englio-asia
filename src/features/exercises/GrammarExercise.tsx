import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** A grammar rule in Bangla on the card, then pick the one correct English sentence. */
export function GrammarExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'grammar'>>) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      <div className="qcard hero rule-card">
        <span className="rule-head">
          <Glyph name="book" size={16} />
          <span lang="bn">নিয়ম</span>
        </span>
        <p className="rule-text" lang="bn">
          <MixedText text={ex.grammar.rule} />
        </p>
      </div>
      <div className="list" role="radiogroup">
        {ex.options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={picked === option}
            className={`row${/[؀-ۿ]/.test(option) ? ' is-word' : ''}${picked === option ? ' selected' : ''}`}
            disabled={disabled}
            onClick={() => {
              setPicked(option);
              speak(option);
              onChange(option);
            }}
          >
            <span className="row-word">{option}</span>
            <span className="row-check">{picked === option && <Glyph name="check" size={18} />}</span>
          </button>
        ))}
      </div>
    </>
  );
}
