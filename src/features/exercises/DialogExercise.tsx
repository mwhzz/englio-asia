import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { initialOf } from '../../lib/profile';
import { speak } from '../../lib/speech';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';
import { GlossText } from '../gloss/GlossText';

/**
 * A short chat: the other person's lines on the left, yours on the right.
 * Your missing line waits as "…" and fills in with the reply you pick. Tap any line to hear it.
 */
export function DialogExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'dialog'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  const { dialog } = ex;
  // Only the conversation up to (and including) your line is shown.
  const lines = dialog.lines.slice(0, dialog.reply + 1);

  return (
    <>
      <div className="hero chat">
        {lines.map((line, i) => {
          const mine = line.who === 'you';
          const missing = i === dialog.reply;
          return (
            <div key={i} className={`chat-line${mine ? ' is-you' : ''}`}>
              {!mine && (
                <span className="chat-avatar" aria-hidden="true">
                  {initialOf(dialog.with)}
                </span>
              )}
              {missing ? (
                <span className={`chat-bubble is-reply${picked ? ' filled' : ''}`}>{picked ?? '…'}</span>
              ) : (
                <button type="button" className="chat-bubble" onClick={() => speak(line.en)}>
                  <span>
                    <GlossText text={line.en} />
                  </span>
                  <small lang="bn">{line.bn}</small>
                </button>
              )}
            </div>
          );
        })}
      </div>
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
