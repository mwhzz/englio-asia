import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';
import { SentenceDrop } from './SentenceDrop';

/** Several blanks in a text, filled from one word bank (see SentenceDrop); the answer is the words joined by "|". */
export function GapsExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'gaps'>>) {
  return (
    <SentenceDrop
      text={ex.gaps.text}
      bn={ex.gaps.bn}
      bank={ex.bank}
      disabled={disabled}
      onChange={(words) => onChange(words ? words.join('|') : null)}
    />
  );
}
