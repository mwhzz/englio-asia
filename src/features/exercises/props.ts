/** Every exercise reports the learner's current answer, or null when there is none yet. */
export interface ExerciseProps<E> {
  ex: E;
  disabled: boolean;
  onChange: (answer: string | null) => void;
}
