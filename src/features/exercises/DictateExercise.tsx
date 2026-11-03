import { SpeakButton } from '../../components/SpeakButton';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/** Dictation: hear a short English sentence and type it. */
export function DictateExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'dictate'>>) {
  return (
    <>
      <div className="listen-buttons hero">
        <SpeakButton text={ex.sentence.en} big auto />
        <SpeakButton text={ex.sentence.en} slow />
      </div>
      <textarea
        className="type-input"
        placeholder="Type what you hear…"
        rows={2}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.trim() ? e.target.value : null)}
      />
    </>
  );
}
