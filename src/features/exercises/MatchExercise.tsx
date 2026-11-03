import { useState } from 'react';
import { shuffle } from '../../lib/random';
import { playSound } from '../../lib/sounds';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

type Pick = { en?: string; bn?: string };

/** Two columns: tap an English word and its Bangla meaning. Finishes itself when all pairs match. */
export function MatchExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'match'>>) {
  const [left] = useState(() => shuffle(ex.pairs.map((p) => p.en)));
  const [right] = useState(() => shuffle(ex.pairs.map((p) => p.bn)));
  const [selected, setSelected] = useState<Pick>({});
  const [wrong, setWrong] = useState<Pick>({});
  const [matched, setMatched] = useState<string[]>([]);
  const matchedBn = ex.pairs.filter((p) => matched.includes(p.en)).map((p) => p.bn);

  function choose(side: 'en' | 'bn', value: string) {
    if (side === 'en') speak(value);
    const next = { ...selected, [side]: value };
    if (!next.en || !next.bn) {
      setSelected(next);
      return;
    }
    setSelected({});
    if (ex.pairs.some((p) => p.en === next.en && p.bn === next.bn)) {
      const all = [...matched, next.en];
      setMatched(all);
      playSound('tap');
      if (all.length === ex.pairs.length) onChange('done');
    } else {
      playSound('wrong');
      setWrong(next);
      setTimeout(() => setWrong({}), 600);
    }
  }

  const button = (side: 'en' | 'bn', value: string, done: boolean) => (
    <button
      key={value}
      type="button"
      lang={side === 'bn' ? 'bn' : undefined}
      className={`pair${done ? ' matched' : ''}${selected[side] === value ? ' selected' : ''}${wrong[side] === value ? ' wrong' : ''}`}
      disabled={disabled || done}
      onClick={() => choose(side, value)}
    >
      {value}
    </button>
  );

  return (
    <div className="match">
      <div className="match-col">{left.map((en) => button('en', en, matched.includes(en)))}</div>
      <div className="match-col">{right.map((bn) => button('bn', bn, matchedBn.includes(bn)))}</div>
    </div>
  );
}
