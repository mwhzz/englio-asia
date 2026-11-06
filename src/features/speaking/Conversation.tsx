import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import { toBanglaDigits, possessive } from '../../lib/bangla';
import { useBackButton } from '../../lib/backButton';
import { dayKey } from '../../lib/days';
import { haptic } from '../../lib/haptics';
import { canListen, listenOnce } from '../../lib/listen';
import { compareSpoken } from '../../lib/pronounce';
import { recordLesson } from '../../lib/progress';
import { speak } from '../../lib/speech';
import { useProgress } from '../../state/ProgressContext';
import type { Dialog } from '../../types';
import { SpokenWords } from '../exercises/SpokenWords';

const COLOR = '#ff2d55';
const XP = 5;

/**
 * Act out a conversation: the app says the other person's lines aloud, the learner says their own into
 * the mic and sees which words came through. Lines can be skipped when speaking isn't possible.
 */
export function Conversation({ dialog, onClose }: { dialog: Dialog; onClose: () => void }) {
  useBackButton(onClose);
  const { update } = useProgress();
  const [at, setAt] = useState(0);
  const [heard, setHeard] = useState<Record<number, string>>({});
  const [listening, setListening] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const stop = useRef<(() => void) | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const line = dialog.lines[at];
  const done = at >= dialog.lines.length;

  // The other person's lines are read out, then it's the learner's turn.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (line?.who === 'them') speak(line.en, false, () => setTimeout(() => setAt((n) => n + 1), 400));
  }, [at, line]);

  useEffect(() => () => stop.current?.(), []);

  useEffect(() => {
    if (!done) return;
    const yours = dialog.lines.map((l, i) => (l.who === 'you' ? i : -1)).filter((i) => i >= 0);
    if (yours.length) update((p) => recordLesson(p, null, XP, dayKey(), Math.round((Date.now() - startedAt) / 1000)));
    // Once, when the conversation ends.
  }, [done]);

  function talk() {
    if (listening) return stop.current?.();
    haptic();
    setListening(true);
    stop.current = listenOnce(
      (text) => setHeard((h) => ({ ...h, [at]: text })),
      (text) => {
        setListening(false);
        stop.current = null;
        setHeard((h) => ({ ...h, [at]: text }));
      },
    );
  }

  const scores = Object.entries(heard)
    .filter(([i]) => dialog.lines[Number(i)]?.who === 'you')
    .map(([i, text]) => compareSpoken(dialog.lines[Number(i)].en, text).score);
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return createPortal(
    <div className="gt cv-page" role="dialog" aria-label={`Conversation with ${dialog.with}`} style={{ '--u': COLOR } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close">
          <Glyph name="close" size={16} />
        </button>
        <span className="lp-bar-title" lang="bn">
          {possessive(dialog.with)} সাথে কথা
        </span>
        <span className="lp-bar-space" />
      </header>

      <div className="gt-body cv-body">
        {dialog.lines.slice(0, Math.min(at + 1, dialog.lines.length)).map((l, i) => (
          <div key={i} className={`cv-line is-${l.who}`}>
            <span className="cv-who">{l.who === 'them' ? dialog.with : <span lang="bn">তুমি</span>}</span>
            <div className="cv-bubble">
              <span className="cv-en">
                {l.who === 'them' && <SpeakButton text={l.en} />}
                {l.en}
              </span>
              <small lang="bn">{l.bn}</small>
              {l.who === 'you' && heard[i] !== undefined && i !== at && <SpokenWords target={l.en} heard={heard[i]} />}
            </div>
          </div>
        ))}

        {!done && line?.who === 'you' && (
          <div className="cv-turn">
            {heard[at] !== undefined && !listening && <SpokenWords target={line.en} heard={heard[at]} />}
            {canListen() ? (
              <button className={`mic${listening ? ' is-on' : ''}`} onClick={talk} aria-label={listening ? 'Stop' : 'Speak'}>
                <span className="mic-waves" aria-hidden="true">
                  <i />
                  <i />
                </span>
                <Glyph name="mic" size={30} />
              </button>
            ) : (
              <p className="cv-note" lang="bn">
                এই ফোনে কথা শোনার সুবিধা নেই। বাক্যটা জোরে পড়ো, তারপর এগিয়ে যাও।
              </p>
            )}
            <p className="cv-note" lang="bn">
              {listening ? 'শুনছি… বলো' : heard[at] !== undefined ? 'আবার বলতে মাইকে চাপো' : 'মাইকে চাপ দিয়ে তোমার কথাটা বলো'}
            </p>
            <button
              className="cta"
              onClick={() => {
                stop.current?.();
                setAt(at + 1);
              }}
            >
              <span lang="bn">{heard[at] !== undefined ? 'পরের লাইন' : 'এখন বলতে পারছি না'}</span>
            </button>
          </div>
        )}

        {done && (
          <div className="cv-done">
            <span className="lg-done-mark">
              <Glyph name="trophy" size={36} />
            </span>
            <h2 lang="bn">কথোপকথন শেষ! +{toBanglaDigits(XP)} XP</h2>
            <p lang="bn">{average === null ? 'পরেরবার মাইকে বলে দেখো।' : `তোমার কথার ${toBanglaDigits(average)}% শব্দ পরিষ্কার শোনা গেছে।`}</p>
            <button className="cta" onClick={onClose}>
              <span lang="bn">শেষ</span>
            </button>
          </div>
        )}
        <div ref={end} />
      </div>
    </div>,
    document.body,
  );
}
