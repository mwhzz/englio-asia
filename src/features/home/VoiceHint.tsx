import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { englishVoice } from '../../lib/speech';

const DISMISSED = 'englio-voice-hint-off';

/** Shown on the home page only when this phone has no English voice, with how to add one. */
export function VoiceHint() {
  const [missing, setMissing] = useState(false);
  const [off, setOff] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Voices load a moment after startup; look again then.
    const check = () => setMissing(englishVoice() === 'none');
    check();
    const timer = setTimeout(check, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!missing || off) return null;
  const iphone = /iphone|ipad/i.test(navigator.userAgent);

  return (
    <div className="rc vh home-rise" role="note">
      <span className="rc-icon vh-icon" aria-hidden="true">
        <Glyph name="speaker" size={20} />
      </span>
      <span className="rc-text">
        <strong lang="bn">ইংরেজি উচ্চারণ শোনা যাচ্ছে না?</strong>
        <small lang="bn">
          {iphone
            ? 'Settings → Accessibility → Spoken Content → Voices → English থেকে একটা ভয়েস নামিয়ে নাও।'
            : 'Play Store থেকে "Speech Services by Google" ইনস্টল করো, তারপর Settings → Text-to-speech-এ সেটা বেছে নাও।'}
        </small>
      </span>
      <button
        className="vh-close"
        aria-label="Hide"
        onClick={() => {
          setOff(true);
          try {
            localStorage.setItem(DISMISSED, '1');
          } catch {
            // Shown again next time; harmless.
          }
        }}
      >
        <Glyph name="close" size={14} />
      </button>
    </div>
  );
}
