import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { dayKey } from '../../lib/days';
import { haptic } from '../../lib/haptics';
import { recordLesson } from '../../lib/progress';
import { playSound } from '../../lib/sounds';
import { speak } from '../../lib/speech';
import { useProgress } from '../../state/ProgressContext';
import { GAMES } from './games';
import { makeRounds, type GameKind } from './gameRounds';
import { familyOf, type LetterStyle } from './letterStyles';

const GAME_XP = 5;

/** One letter game, full screen: eight quick rounds, then the score (and a little XP for finishing). */
export function LetterGame({ kind, style, onClose }: { kind: GameKind; style: LetterStyle; onClose: () => void }) {
  const { update } = useProgress();
  const game = GAMES.find((g) => g.id === kind)!;
  const [rounds, setRounds] = useState(() => makeRounds(kind));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const round = rounds[i];
  const done = i >= rounds.length;
  const family = `"${familyOf(style)}", var(--font)`;

  // Listening rounds say the letter as they appear.
  useEffect(() => {
    if (!done && kind === 'listen') speak(`${round.prompt}.`);
  }, [i, done, kind, round]);

  function choose(option: string) {
    if (picked) return;
    haptic();
    setPicked(option);
    const right = option === round.answer;
    playSound(right ? 'correct' : 'wrong');
    if (right) setScore((s) => s + 1);
    setTimeout(
      () => {
        setPicked(null);
        setI((n) => n + 1);
        if (i + 1 === rounds.length) {
          update((p) => recordLesson(p, null, GAME_XP, dayKey(), Math.round((Date.now() - startedAt) / 1000)));
          playSound('complete');
        }
      },
      right ? 650 : 1100,
    );
  }

  function again() {
    setRounds(makeRounds(kind));
    setI(0);
    setScore(0);
    setStartedAt(Date.now());
  }

  return createPortal(
    <div className="lg" role="dialog" aria-label={game.en}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close game">
          <Glyph name="close" size={16} />
        </button>
        <div className="lg-progress" aria-hidden="true">
          <span style={{ width: `${(100 * Math.min(i, rounds.length)) / rounds.length}%` }} />
        </div>
        <span className="lg-score" lang="bn">
          {toBanglaDigits(score)}
        </span>
      </header>

      {done ? (
        <div className="lg-done">
          <span className="lg-done-mark">
            <Glyph name={score === rounds.length ? 'trophy' : 'check'} size={40} />
          </span>
          <h1 lang="bn">{score === rounds.length ? 'সব ঠিক!' : 'খেলা শেষ!'}</h1>
          <p lang="bn">
            {toBanglaDigits(rounds.length)}টার মধ্যে {toBanglaDigits(score)}টা ঠিক · +{toBanglaDigits(GAME_XP)} XP
          </p>
          <div className="cta-stack">
            <button className="cta" onClick={again}>
              <span lang="bn">আবার খেলো</span>
            </button>
            <button className="cta-text" onClick={onClose}>
              <span lang="bn">অক্ষরে ফিরে যাও</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="lg-body" key={i}>
          <h1 className="lg-title" lang="bn">
            {game.prompt}
          </h1>

          <div className="lg-prompt" style={{ fontFamily: family }}>
            {kind === 'listen' ? (
              <button className="lg-listen" onClick={() => speak(`${round.prompt}.`)} aria-label="Hear the letter again">
                <Glyph name="speaker" size={44} />
              </button>
            ) : kind === 'order' ? (
              <span className="lg-seq">
                {round.sequence!.map((x, j) => (
                  <span key={j} className={x ? undefined : `is-gap${picked ? ' is-filled' : ''}`}>
                    {x ?? (picked ? round.answer : '?')}
                  </span>
                ))}
              </span>
            ) : (
              <span className="lg-letter">{round.prompt}</span>
            )}
          </div>

          <div className="lg-options">
            {round.options.map((option) => {
              const state = !picked ? '' : option === round.answer ? ' is-right' : option === picked ? ' is-wrong' : ' is-dim';
              return (
                <button key={option} className={`lg-option${state}`} style={{ fontFamily: family }} onClick={() => choose(option)}>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
