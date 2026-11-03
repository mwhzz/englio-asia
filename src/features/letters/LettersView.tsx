import { useState, type CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { findLetter, LETTERS } from '../../data/letters';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';
import { GAMES } from './games';
import type { GameKind } from './gameRounds';
import { LetterGame } from './LetterGame';
import { LetterPage } from './LetterPage';
import { CASES, familyOf, shown, STYLES, type LetterCase, type LetterStyle } from './letterStyles';
import { useHandwritingFonts } from './useHandwritingFonts';
import { useSavedChoice } from './useSavedChoice';

/** The alphabet page: A to Z in print, handwriting or cursive; tap a letter to hear and trace it; three games. */
export default function LettersView() {
  const { progress, update } = useProgress();
  const fontsReady = useHandwritingFonts();
  const [style, setStyle] = useSavedChoice<LetterStyle>('englio-letter-style', ['print', 'hand', 'cursive'], 'print');
  const [letterCase, setCase] = useSavedChoice<LetterCase>('englio-letter-case', ['both', 'upper', 'lower'], 'both');
  const [open, setOpen] = useState<string | null>(null);
  const [game, setGame] = useState<GameKind | null>(null);
  const practiced = progress.lettersPracticed ?? [];
  const openLetter = open ? findLetter(open) : undefined;

  const markPracticed = (upper: string) =>
    update((p) => (p.lettersPracticed?.includes(upper) ? p : { ...p, lettersPracticed: [...(p.lettersPracticed ?? []), upper] }));

  return (
    <div className="lt">
      <header className="pf-head">
        <h1 lang="bn">অক্ষর</h1>
        <small>Alphabet</small>
      </header>

      <div className="lt-controls">
        <div className="pf-segmented" role="radiogroup" aria-label="Writing style">
          {STYLES.map((s) => (
            <button key={s.id} role="radio" aria-checked={style === s.id} className={style === s.id ? 'is-on' : undefined} onClick={() => setStyle(s.id)}>
              <span lang="bn">{s.bn}</span>
            </button>
          ))}
        </div>
        <div className="pf-segmented lt-case" role="radiogroup" aria-label="Letter case">
          {CASES.map((c) => (
            <button key={c.id} role="radio" aria-checked={letterCase === c.id} className={letterCase === c.id ? 'is-on' : undefined} onClick={() => setCase(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <p className="lt-progress" lang="bn">
        <span className="lt-progress-bar" aria-hidden="true">
          <span style={{ width: `${(100 * practiced.length) / LETTERS.length}%` }} />
        </span>
        {toBanglaDigits(practiced.length)}/২৬ অক্ষর ট্রেস করেছ · <span className="lt-key" /> স্বরবর্ণ
      </p>

      <div className="lt-grid" style={{ '--lf': `"${familyOf(style)}", var(--font)` } as CSSProperties}>
        {LETTERS.map((l, i) => (
          <button
            key={l.upper}
            className={`lt-tile${l.vowel ? ' is-vowel' : ''}${practiced.includes(l.upper) ? ' is-done' : ''}`}
            style={{ animationDelay: `${i * 18}ms` }}
            onClick={() => {
              haptic();
              setOpen(l.upper);
            }}
            aria-label={`Letter ${l.upper}`}
          >
            <span className={`lt-glyph is-${letterCase}`}>{shown(l.upper, letterCase)}</span>
            <small lang="bn">{l.nameBn}</small>
            {practiced.includes(l.upper) && (
              <span className="lt-check" aria-hidden="true">
                <Glyph name="check" size={10} />
              </span>
            )}
          </button>
        ))}
      </div>

      <section className="pf-section is-plain">
        <h2 className="pf-list-title">
          <span lang="bn">খেলা</span> <small>Games</small>
        </h2>
        <div className="pf-list">
          {GAMES.map((g) => (
            <button key={g.id} className="pf-row" onClick={() => setGame(g.id)}>
              <span className="pf-icon" style={{ background: g.color }}>
                <Glyph name={g.icon} size={17} />
              </span>
              <span className="pf-row-text">
                <span lang="bn">{g.bn}</span>
                <small>{g.en} · +5 XP</small>
              </span>
              <Glyph name="chevron" size={16} className="pf-chevron" />
            </button>
          ))}
        </div>
      </section>

      {openLetter && (
        <LetterPage
          letter={openLetter}
          style={style}
          letterCase={letterCase}
          practiced={practiced.includes(openLetter.upper)}
          fontsReady={fontsReady}
          onPracticed={markPracticed}
          onGo={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
      {game && <LetterGame kind={game} style={style} onClose={() => setGame(null)} />}
    </div>
  );
}
