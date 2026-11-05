import { useState, type MouseEvent } from 'react';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { haptic } from '../../lib/haptics';
import { speak } from '../../lib/speech';
import { useFlip } from './useFlip';

interface Props {
  /** The English sentence, with ___ for each blank. */
  text: string;
  /** Its meaning, shown under it. */
  bn: string;
  /** The words to choose from. */
  bank: string[];
  disabled: boolean;
  /** The words in the blanks, in order, once every blank is filled (else null). */
  onChange: (words: string[] | null) => void;
}

/**
 * "Put the word in the sentence": the sentence large, a dashed slot for each blank, and word tiles
 * below. A tapped tile glides into the next empty slot (with one blank, it swaps out the word there);
 * tapping a filled slot sends its word back down. Used by fill-in-the-blank and fill-in-the-gaps.
 */
export function SentenceDrop({ text, bn, bank, disabled, onChange }: Props) {
  const parts = text.split('___');
  const slots = parts.length - 1;
  // For each slot, the index of the bank word in it (or null while empty).
  const [filled, setFilled] = useState<(number | null)[]>(() => Array.from({ length: slots }, () => null));
  const { track, fly } = useFlip();

  function update(next: (number | null)[], landing: string, from: DOMRect) {
    fly(landing, from);
    haptic();
    setFilled(next);
    onChange(next.every((i) => i !== null) ? next.map((i) => bank[i!]) : null);
  }

  function put(word: number, e: MouseEvent<HTMLButtonElement>) {
    const empty = filled.indexOf(null);
    const slot = empty >= 0 ? empty : slots === 1 ? 0 : -1;
    if (slot < 0) return;
    speak(bank[word]);
    update(
      filled.map((f, i) => (i === slot ? word : f)),
      `slot${slot}`,
      e.currentTarget.getBoundingClientRect(),
    );
  }

  function takeBack(slot: number, e: MouseEvent<HTMLButtonElement>) {
    const word = filled[slot];
    if (word === null) return;
    update(
      filled.map((f, i) => (i === slot ? null : f)),
      `tile${word}`,
      e.currentTarget.getBoundingClientRect(),
    );
  }

  const next = filled.indexOf(null);
  return (
    <>
      <div className="qcard hero drop-card">
        <p className="drop-sentence">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < slots && (
                <button
                  ref={track(`slot${i}`)}
                  type="button"
                  className={`slot${filled[i] !== null ? ' filled' : ''}${next === i ? ' is-next' : ''}`}
                  disabled={disabled || filled[i] === null}
                  onClick={(e) => takeBack(i, e)}
                  aria-label={filled[i] !== null ? `Remove ${bank[filled[i]!]}` : `Blank ${i + 1}`}
                >
                  {filled[i] !== null ? bank[filled[i]!] : ''}
                </button>
              )}
            </span>
          ))}
        </p>
        <p className="drop-meaning" lang="bn">
          <Glyph name="chat" size={16} />
          <span>
            <MixedText text={bn} />
          </span>
        </p>
      </div>
      <div className="drop-bank">
        {bank.map((word, i) =>
          filled.includes(i) ? (
            <span key={i} className="drop-tile is-used" aria-hidden="true">
              {word}
            </span>
          ) : (
            <button key={i} ref={track(`tile${i}`)} type="button" className="drop-tile" disabled={disabled} onClick={(e) => put(i, e)}>
              {word}
            </button>
          ),
        )}
      </div>
    </>
  );
}
