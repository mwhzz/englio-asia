import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { glossParts } from '../../lib/gloss';

/**
 * A sentence in the language being learned, where every taught word can be tapped (or hovered with a
 * mouse) to see its meaning, and the lesson's new words are highlighted (lib/gloss.ts).
 */
export function GlossText({ text }: { text: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const parts = glossParts(text);

  function toggle(i: number, e: MouseEvent | KeyboardEvent) {
    // Inside a tappable bubble (a conversation line), a tap on a word only shows its meaning.
    e.stopPropagation();
    setOpen((o) => (o === i ? null : i));
  }

  return (
    <>
      {parts.map((p, i) =>
        p.meaning ? (
          <span
            key={i}
            role="button"
            tabIndex={0}
            className={`gloss-word${p.fresh ? ' is-new' : ''}${open === i ? ' is-open' : ''}`}
            onClick={(e) => toggle(i, e)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(i, e)}
          >
            {p.text}
            <span className="gloss-pop" lang="bn" role="tooltip">
              {p.meaning}
            </span>
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}
