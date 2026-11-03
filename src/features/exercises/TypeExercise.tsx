import { PromptCard } from '../../components/PromptCard';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** Free typing: translate a Bangla sentence into English. */
export function TypeExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'type'>>) {
  return (
    <>
      <PromptCard>
        <span lang="bn">{ex.sentence.bn}</span>
      </PromptCard>
      <textarea
        className="type-input"
        placeholder="Type in English…"
        rows={3}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.trim() ? e.target.value : null)}
      />
    </>
  );
}
