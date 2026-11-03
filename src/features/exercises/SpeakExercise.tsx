import { useEffect, useRef, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import { SKIP_SPEAKING } from '../../lib/grade';
import { haptic } from '../../lib/haptics';
import { listenOnce } from '../../lib/listen';
import type { ExerciseOf } from '../../types';
import type { ExerciseProps } from './props';

const MIC_BLOCKED: Record<string, string> = {
  'not-allowed': 'মাইক্রোফোনের অনুমতি দাও (ব্রাউজারের ঠিকানার পাশের চিহ্নে চাপ দাও)।',
  'audio-capture': 'মাইক্রোফোন পাওয়া যায়নি।',
  network: 'ইন্টারনেট লাগবে, আবার চেষ্টা করো।',
};

/** Say an English sentence into the mic; the words heard show as you speak. "Can't speak now" passes it. */
export function SpeakExercise({ ex, disabled, onChange }: ExerciseProps<ExerciseOf<'speak'>>) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  function toggle() {
    if (listening) return stop.current?.();
    haptic();
    setError(null);
    setHeard('');
    setListening(true);
    stop.current = listenOnce(setHeard, (text, err) => {
      setListening(false);
      stop.current = null;
      if (err) setError(MIC_BLOCKED[err] ?? 'শোনা যায়নি, আবার চেষ্টা করো।');
      else if (!text) setError('কিছু শোনা যায়নি, আবার বলো।');
      onChange(text || null);
    });
  }

  return (
    <>
      <div className="qcard hero speak-card">
        <SpeakButton text={ex.sentence.en} />
        <span className="speak-text">
          <strong>{ex.sentence.en}</strong>
          <small lang="bn">{ex.sentence.bn}</small>
        </span>
      </div>

      <div className="mic-area">
        <button className={`mic${listening ? ' is-on' : ''}`} onClick={toggle} disabled={disabled} aria-label={listening ? 'Stop' : 'Speak'}>
          <span className="mic-waves" aria-hidden="true">
            <i />
            <i />
          </span>
          <Glyph name="mic" size={34} />
        </button>
        <p className={`mic-heard${heard ? ' has-text' : ''}`} aria-live="polite">
          {heard || (listening ? <span lang="bn">শুনছি… বলো</span> : <span lang="bn">মাইকে চাপ দিয়ে বাক্যটা বলো</span>)}
        </p>
        {error && (
          <p className="mic-error" lang="bn">
            {error}
          </p>
        )}
        {!disabled && (
          <button
            className="mic-skip"
            onClick={() => {
              stop.current?.();
              onChange(SKIP_SPEAKING);
            }}
          >
            <span lang="bn">এখন বলতে পারছি না</span>
          </button>
        )}
      </div>
    </>
  );
}
