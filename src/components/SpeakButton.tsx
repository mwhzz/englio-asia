import { useCallback, useEffect, useRef, useState } from 'react';
import { speak } from '../lib/speech';
import { Glyph } from './Glyph';

interface Props {
  text: string;
  /** Reads at about half speed. */
  slow?: boolean;
  /** The big round button of a listening exercise, with sound waves while it speaks. */
  big?: boolean;
  /** Plays once as soon as it appears. */
  auto?: boolean;
}

/** Plays English audio, and shows that it's playing. */
export function SpeakButton({ text, slow = false, big = false, auto = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const run = useRef(0);
  const timer = useRef(0);

  const play = useCallback(() => {
    const id = ++run.current;
    const stop = () => id === run.current && setPlaying(false);
    const utterance = speak(text, slow);
    setPlaying(true);
    // Some browsers never fire `end`, so stop the waves after a rough reading time too.
    clearTimeout(timer.current);
    timer.current = window.setTimeout(stop, 1200 + text.length * (slow ? 140 : 80));
    if (utterance) utterance.onend = utterance.onerror = stop;
  }, [text, slow]);

  useEffect(() => {
    if (auto) play();
    return () => clearTimeout(timer.current);
  }, [auto, play]);

  return (
    <button
      type="button"
      className={`speak${big ? ' speak-big' : ''}${slow ? ' speak-slow' : ''}${playing ? ' is-playing' : ''}`}
      onClick={play}
      aria-label={slow ? 'Play slowly' : 'Play audio'}
    >
      {big && (
        <span className="speak-waves" aria-hidden="true">
          <i />
          <i />
        </span>
      )}
      <Glyph name="speaker" size={big ? 40 : slow ? 20 : 20} />
      {slow && <small lang="bn">ধীরে</small>}
    </button>
  );
}
