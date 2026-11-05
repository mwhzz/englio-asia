import { useState } from 'react';
import { bareWord, lookup } from '../lib/lookup';
import { Modal } from './Modal';
import { SpeakButton } from './SpeakButton';

/**
 * English text where every word can be tapped to hear it and see its Bangla meaning
 * (stories, grammar examples). Spaces and punctuation stay as they were.
 */
export function TapText({ text }: { text: string }) {
  const [open, setOpen] = useState<{ token: string; found: { word: string; bn: string } | null } | null>(null);

  async function tap(token: string, e: React.MouseEvent) {
    // A tap on a word inside a tappable line shouldn't also trigger the line.
    e.stopPropagation();
    setOpen({ token, found: await lookup(token) });
  }

  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /[A-Za-z]/.test(part) ? (
          <span key={i} role="button" tabIndex={0} className="tap-word" onClick={(e) => tap(part, e)} onKeyDown={(e) => e.key === 'Enter' && tap(part, e as unknown as React.MouseEvent)}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="tap-sheet">
            <div className="tap-sheet-word">
              <SpeakButton text={bareWord(open.token)} auto />
              <strong>{bareWord(open.token)}</strong>
            </div>
            {open.found ? (
              <p lang="bn">
                {open.found.word !== bareWord(open.token).toLowerCase() && <small>{open.found.word} → </small>}
                {open.found.bn}
              </p>
            ) : (
              <p className="tap-unknown" lang="bn">
                এই শব্দের মানে এখনো অভিধানে নেই। শুনে নাও, আর বাক্যের বাংলা মানে দেখে বোঝার চেষ্টা করো।
              </p>
            )}
            <button className="cta-text" onClick={() => setOpen(null)}>
              <span lang="bn">বন্ধ করো</span>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
