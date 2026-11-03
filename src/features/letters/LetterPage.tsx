import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import { LETTERS } from '../../data/letters';
import { speak } from '../../lib/speech';
import type { Letter } from '../../types';
import { familyOf, type LetterCase, type LetterStyle } from './letterStyles';
import { TraceCanvas } from './TraceCanvas';

interface Props {
  letter: Letter;
  style: LetterStyle;
  letterCase: LetterCase;
  practiced: boolean;
  fontsReady: boolean;
  onPracticed: (upper: string) => void;
  onGo: (upper: string) => void;
  onClose: () => void;
}

/** A word with its first copy of the letter highlighted: "b·o·x" → bo[x]. */
function Highlighted({ word, letter }: { word: string; letter: string }) {
  const i = word.toLowerCase().indexOf(letter);
  if (i < 0) return <>{word}</>;
  return (
    <>
      {word.slice(0, i)}
      <mark>{word[i]}</mark>
      {word.slice(i + 1)}
    </>
  );
}

/** One letter, full screen: both forms large, its name and sound, example words, and a tracing strip. */
export function LetterPage({ letter, style, letterCase, practiced, fontsReady, onPracticed, onGo, onClose }: Props) {
  const index = LETTERS.indexOf(letter);
  const prev = LETTERS[index - 1];
  const next = LETTERS[index + 1];
  const family = familyOf(style);
  const traceText = letterCase === 'lower' ? letter.lower : letterCase === 'upper' ? letter.upper : `${letter.upper}${letter.lower}`;

  return createPortal(
    <div className={`lp${letter.vowel ? ' is-vowel' : ''}`} role="dialog" aria-label={`Letter ${letter.upper}`}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back to all letters">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          {index + 1} / 26 {letter.vowel ? '· স্বরবর্ণ' : '· ব্যঞ্জনবর্ণ'}
        </span>
        <span className={`lp-done${practiced ? ' is-on' : ''}`} aria-label={practiced ? 'Practiced' : 'Not practiced yet'}>
          <Glyph name="check" size={14} />
        </span>
      </header>

      <div className="lp-body" key={letter.upper}>
        <div className="lp-hero" style={{ fontFamily: `"${family}", var(--font)` }}>
          <span className="lp-big">{letter.upper}</span>
          <span className="lp-big is-small">{letter.lower}</span>
        </div>

        <div className="lp-say">
          <button className="lp-say-btn" onClick={() => speak(`${letter.upper}.`)}>
            <Glyph name="speaker" size={18} />
            <span>
              <small lang="bn">নাম</small>
              <strong lang="bn">{letter.nameBn}</strong>
            </span>
          </button>
          <button className="lp-say-btn" onClick={() => speak(letter.words[0].en, true)}>
            <Glyph name="speaker" size={18} />
            <span>
              <small lang="bn">উচ্চারণ</small>
              <strong lang="bn">{letter.soundBn}</strong>
            </span>
          </button>
        </div>

        <section className="lp-section">
          <h2 lang="bn">শব্দ</h2>
          <ul className="lp-words">
            {letter.words.map((w) => (
              <li key={w.en}>
                <SpeakButton text={w.en} />
                <span className="lp-word">
                  <strong>
                    <Highlighted word={w.en} letter={letter.lower} />
                  </strong>
                  <small lang="bn">{w.bn}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lp-section">
          <h2 lang="bn">ট্রেস করো</h2>
          <TraceCanvas text={traceText} family={family} fontsReady={fontsReady} onTraced={() => onPracticed(letter.upper)} />
        </section>

        <nav className="lp-nav">
          <button className="lp-nav-btn" disabled={!prev} onClick={() => prev && onGo(prev.upper)}>
            <Glyph name="back" size={16} />
            {prev ? prev.upper : ''}
          </button>
          <button className="lp-nav-btn is-next" disabled={!next} onClick={() => next && onGo(next.upper)}>
            {next ? next.upper : ''}
            <Glyph name="back" size={16} />
          </button>
        </nav>
      </div>
    </div>,
    document.body,
  );
}
