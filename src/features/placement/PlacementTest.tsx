import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { COURSE } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { grade } from '../../lib/grade';
import { haptic } from '../../lib/haptics';
import { buildPlacement, skipUnits } from '../../lib/placement';
import { playSound } from '../../lib/sounds';
import { useProgress } from '../../state/ProgressContext';
import { ExerciseView } from '../exercises/ExerciseView';
import { INSTRUCTIONS } from '../exercises/instructions';
import { useBackButton } from '../../lib/backButton';

/**
 * The level test: two questions per unit, easiest first, stopping at the first unit with a mistake.
 * It doesn't say right or wrong as it goes (it's a test, not a lesson), then suggests where to start.
 */
export function PlacementTest({ onDone }: { onDone: () => void }) {
  useBackButton(onDone);
  const { update } = useProgress();
  const [rounds] = useState(() => buildPlacement(COURSE));
  const [phase, setPhase] = useState<'intro' | 'ask' | 'result'>('intro');
  const [round, setRound] = useState(0);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const [startUnit, setStartUnit] = useState(0);
  const total = rounds.length * 2;
  const exercise = rounds[round]?.exercises[step];

  function check() {
    if (!answer || !exercise) return;
    haptic();
    playSound('tap');
    const wrong = grade(exercise, answer).result === 'wrong' || missed;
    setAnswer(null);
    if (step === 0) {
      setMissed(wrong);
      setStep(1);
      return;
    }
    // End of a unit's pair: one mistake means this is where to start.
    if (wrong) return finish(rounds[round].unitIndex);
    if (round + 1 >= rounds.length) return finish(COURSE.length - 1);
    setRound(round + 1);
    setStep(0);
    setMissed(false);
  }

  function finish(unit: number) {
    playSound('complete');
    setStartUnit(unit);
    setPhase('result');
  }

  if (phase === 'intro') {
    return (
      <div className="done-screen pt">
        <div className="done-main">
          <span className="done-mark" aria-hidden="true">
            <Glyph name="target" size={40} />
          </span>
          <h1 lang="bn">তোমার লেভেল যাচাই করো</h1>
          <p className="done-sub" lang="bn">
            প্রতি ইউনিট থেকে দুটো ছোট প্রশ্ন, সহজ থেকে কঠিন। যেখানে আটকাবে সেখান থেকেই তুমি শুরু করবে। ঠিক-ভুল পরীক্ষার শেষে জানবে।
          </p>
          <ul className="done-list">
            <li className="done-row">
              <span className="done-icon" style={{ background: 'var(--ios-blue)' }}>
                <Glyph name="clock" size={16} />
              </span>
              <span lang="bn">সময় লাগবে</span>
              <strong lang="bn">২–৫ মিনিট</strong>
            </li>
            <li className="done-row">
              <span className="done-icon" style={{ background: 'var(--ios-green)' }}>
                <Glyph name="check" size={16} />
              </span>
              <span lang="bn">সর্বোচ্চ প্রশ্ন</span>
              <strong lang="bn">{toBanglaDigits(total)}টি</strong>
            </li>
          </ul>
        </div>
        <div className="cta-stack">
          <button className="cta" onClick={() => setPhase('ask')}>
            <span lang="bn">টেস্ট শুরু করো</span>
          </button>
          <button className="cta-text" onClick={onDone}>
            <span lang="bn">এখন না</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const unit = COURSE[startUnit];
    const fresh = startUnit === 0;
    return (
      <div className="done-screen pt" style={{ '--u': unit.color } as React.CSSProperties}>
        <div className="done-main">
          <span className="done-mark" aria-hidden="true">
            <Glyph name={fresh ? 'star' : 'trophy'} size={40} />
          </span>
          <h1 lang="bn">{fresh ? 'শুরু থেকেই শুরু করো' : `ইউনিট ${toBanglaDigits(startUnit + 1)} থেকে শুরু করতে পারো`}</h1>
          <p className="done-sub" lang="bn">
            {fresh
              ? 'প্রথম ইউনিট থেকে শুরু করলে ভিত মজবুত হবে। চিন্তা নেই, দ্রুতই এগিয়ে যাবে।'
              : `তুমি আগের ${toBanglaDigits(startUnit)}টা ইউনিট জানো। এগুলো পার হয়েছে হিসেবে চিহ্নিত হবে (XP ছাড়া), চাইলে পরে আবার করতে পারবে।`}
          </p>
          <p className="pt-unit" lang="bn">
            <span className="pt-dot" />
            {unit.title} · {unit.titleBn}
          </p>
        </div>
        <div className="cta-stack">
          <button
            className="cta"
            onClick={() => {
              update((p) => (fresh ? { ...p, placementTaken: true } : skipUnits(p, COURSE, startUnit)));
              onDone();
            }}
          >
            <span lang="bn">{fresh ? 'শুরু করো' : `ইউনিট ${toBanglaDigits(startUnit + 1)} থেকে শুরু করো`}</span>
          </button>
          {!fresh && (
            <button
              className="cta-text"
              onClick={() => {
                update((p) => ({ ...p, placementTaken: true }));
                onDone();
              }}
            >
              <span lang="bn">না, শুরু থেকেই করব</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const asked = round * 2 + step;
  const instruction = INSTRUCTIONS[exercise.kind];
  return (
    <div className="lesson" style={{ '--u': '#007aff' } as React.CSSProperties}>
      <header className="lesson-top">
        <button className="lesson-close" onClick={onDone} aria-label="Stop the test">
          <Glyph name="close" size={13} />
        </button>
        <div className="lesson-progress" role="progressbar" aria-valuenow={asked} aria-valuemax={total}>
          <div className="lesson-progress-fill" style={{ width: `${(100 * asked) / total}%` }} />
        </div>
        <span className="lesson-pill" lang="bn">
          {toBanglaDigits(rounds[round].unitIndex + 1)}
        </span>
      </header>
      <main className="lesson-body" key={exercise.id}>
        <h1 className="instruction">
          <span lang="bn">{instruction.bn}</span>
          <small>{instruction.en}</small>
        </h1>
        <div className="lesson-stage">
          <ExerciseView ex={exercise} disabled={false} onChange={setAnswer} />
        </div>
      </main>
      <footer className="lesson-foot">
        <div className="lesson-foot-inner">
          <button className="cta" disabled={!answer} onClick={check}>
            <span lang="bn">পরবর্তী</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
