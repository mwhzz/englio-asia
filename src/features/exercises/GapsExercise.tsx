import { useState } from 'react';
import { haptic } from '../../lib/haptics';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

/**
 * Several blanks in a sentence, filled from one word bank: a tapped word goes into the
 * first empty blank, and tapping a filled blank sends its word back.
 */
export function GapsExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'gaps'>>) {
  const parts = ex.gaps.text.split('___');
  // For each blank, the index of the bank word in it (or null while empty).
  const [filled, setFilled] = useState<(number | null)[]>(() => ex.gaps.answers.map(() => null));

  function update(next: (number | null)[]) {
    haptic();
    setFilled(next);
    onChange(next.every((i) => i !== null) ? next.map((i) => ex.bank[i!]).join('|') : null);
  }

  function put(word: number) {
    const slot = filled.indexOf(null);
    if (slot < 0) return;
    speak(ex.bank[word]);
    update(filled.map((f, i) => (i === slot ? word : f)));
  }

  return (
    <>
      <div className="qcard hero gaps-card">
        <p className="gaps-text">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < filled.length && (
                <button
                  type="button"
                  className={`gap${filled[i] !== null ? ' filled' : ''}${filled.indexOf(null) === i ? ' is-next' : ''}`}
                  disabled={disabled || filled[i] === null}
                  onClick={() => update(filled.map((f, j) => (j === i ? null : f)))}
                  aria-label={filled[i] !== null ? `Remove ${ex.bank[filled[i]!]}` : `Blank ${i + 1}`}
                >
                  {filled[i] !== null ? ex.bank[filled[i]!] : ' '}
                </button>
              )}
            </span>
          ))}
        </p>
        <p className="hint" lang="bn">
          {ex.gaps.bn}
        </p>
      </div>
      <div className="bank">
        {ex.bank.map((word, i) => (
          <button
            key={i}
            type="button"
            className={`tile${filled.includes(i) ? ' tile-ghost' : ''}`}
            disabled={disabled || filled.includes(i)}
            onClick={() => put(i)}
          >
            {word}
          </button>
        ))}
      </div>
    </>
  );
}
