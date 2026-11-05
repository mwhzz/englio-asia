import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';
import { SentenceDrop } from './SentenceDrop';

/** One blank in a sentence: put the right word into it (see SentenceDrop). */
export function FillExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'fill'>>) {
  return (
    <SentenceDrop
      text={ex.fill.text}
      bn={ex.fill.bn}
      bank={ex.fill.options}
      disabled={disabled}
      onChange={(words) => onChange(words ? words[0] : null)}
    />
  );
}
