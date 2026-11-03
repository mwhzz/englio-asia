import type { Exercise } from '../../types';
import { ChoiceExercise } from './ChoiceExercise';
import { DialogExercise } from './DialogExercise';
import { DictateExercise } from './DictateExercise';
import { FillExercise } from './FillExercise';
import { GapsExercise } from './GapsExercise';
import { GrammarExercise } from './GrammarExercise';
import { MatchExercise } from './MatchExercise';
import type { ExerciseProps } from './props';
import { SelectExercise } from './SelectExercise';
import { SpeakExercise } from './SpeakExercise';
import { TilesExercise } from './TilesExercise';
import { TypeExercise } from './TypeExercise';

/** Picks the right component for an exercise kind. */
export function ExerciseView({ ex, disabled, onChange }: ExerciseProps<Exercise>) {
  switch (ex.kind) {
    case 'select':
      return <SelectExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'match':
      return <MatchExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'translate':
    case 'listen':
      return <TilesExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'choice':
      return <ChoiceExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'type':
      return <TypeExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'fill':
      return <FillExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'gaps':
      return <GapsExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'grammar':
      return <GrammarExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'dialog':
      return <DialogExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'dictate':
      return <DictateExercise ex={ex} disabled={disabled} onChange={onChange} />;
    case 'speak':
      return <SpeakExercise ex={ex} disabled={disabled} onChange={onChange} />;
  }
}
