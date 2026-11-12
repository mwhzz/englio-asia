import { useState, type CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { COURSE } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { dayKey } from '../../lib/days';
import { playSound } from '../../lib/sounds';
import { applyTest, buildUnitTest, PASS_SCORE, TEST_SIZE, TEST_XP, testScore } from '../../lib/unitTest';
import { useProgress } from '../../state/ProgressContext';
import { setGloss } from '../../lib/gloss';
import { LessonView } from '../lesson/LessonView';
import { CertificateView } from './CertificateView';
import { useBackButton } from '../../lib/backButton';

/** A unit's final test: an intro, fifteen questions (no hearts lost), then the score and, on a pass, the certificate. */
export function UnitTestRunner({ unitId, onExit }: { unitId: string; onExit: () => void }) {
  useBackButton(onExit);
  const { update } = useProgress();
  const unitIndex = COURSE.findIndex((u) => u.id === unitId);
  const unit = COURSE[unitIndex];
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [run, setRun] = useState(0);
  const [score, setScore] = useState(0);
  // Every word of the unit (and before) can be tapped for its meaning; nothing is marked new in a test.
  useState(() => setGloss(COURSE.find((u) => u.id === unitId)?.lessons.at(-1)?.id ?? null, false));
  const [exercises, setExercises] = useState(() => buildUnitTest(unitId));
  const passed = score >= PASS_SCORE;
  const style = { '--u': unit.color } as CSSProperties;

  if (phase === 'test') {
    return (
      <LessonView
        key={run}
        exercises={exercises}
        practice
        accent={unit.color}
        where={`unit-test:${unitId}`}
        onQuit={onExit}
        onPractice={onExit}
        onFinish={(stats) => {
          const s = testScore(TEST_SIZE, stats.mistakes);
          setScore(s);
          update((p) => applyTest(p, unitId, s, dayKey(), stats.seconds));
          playSound(s >= PASS_SCORE ? 'complete' : 'wrong');
          setPhase('result');
        }}
      />
    );
  }

  if (phase === 'intro') {
    return (
      <div className="done-screen pt" style={style}>
        <div className="done-main">
          <span className="done-mark" aria-hidden="true">
            <Glyph name="trophy" size={40} />
          </span>
          <h1 lang="bn">ইউনিট {toBanglaDigits(unitIndex + 1)} টেস্ট</h1>
          <p className="done-sub">
            {unit.title} · <span lang="bn">{unit.titleBn}</span>
          </p>
          <ul className="done-list">
            <li className="done-row">
              <span className="done-icon" style={{ background: 'var(--ios-blue)' }}>
                <Glyph name="target" size={16} />
              </span>
              <span lang="bn">প্রশ্ন</span>
              <strong lang="bn">{toBanglaDigits(TEST_SIZE)}টি, পুরো ইউনিট থেকে</strong>
            </li>
            <li className="done-row">
              <span className="done-icon" style={{ background: 'var(--ios-green)' }}>
                <Glyph name="check" size={16} />
              </span>
              <span lang="bn">পাস</span>
              <strong lang="bn">{toBanglaDigits(PASS_SCORE)}% ঠিক হলে · সার্টিফিকেট</strong>
            </li>
            <li className="done-row">
              <span className="done-icon" style={{ background: 'var(--ios-red)' }}>
                <Glyph name="heart" size={16} />
              </span>
              <span lang="bn">হার্ট</span>
              <strong lang="bn">টেস্টে হার্ট কমবে না</strong>
            </li>
          </ul>
        </div>
        <div className="cta-stack">
          <button className="cta" onClick={() => setPhase('test')}>
            <span lang="bn">টেস্ট শুরু করো</span>
          </button>
          <button className="cta-text" onClick={onExit}>
            <span lang="bn">পরে দেব</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="done-screen pt" style={style}>
      <div className="done-main">
        {passed ? (
          <>
            <h1 lang="bn">অভিনন্দন! টেস্টে পাস করেছ</h1>
            <p className="done-sub" lang="bn">
              {toBanglaDigits(score)}% ঠিক · +{toBanglaDigits(TEST_XP)} XP
            </p>
            <CertificateView unit={unit} unitNumber={unitIndex + 1} score={score} date={dayKey()} />
          </>
        ) : (
          <>
            <span className="done-mark" aria-hidden="true">
              <Glyph name="target" size={40} />
            </span>
            <h1 lang="bn">আরেকটু চর্চা দরকার</h1>
            <p className="done-sub" lang="bn">
              {toBanglaDigits(score)}% ঠিক হয়েছে, পাস করতে {toBanglaDigits(PASS_SCORE)}% লাগে। লেসনগুলো আবার ঝালাই করে আবার চেষ্টা করো।
            </p>
          </>
        )}
      </div>
      <div className="cta-stack">
        {!passed && (
          <button
            className="cta"
            onClick={() => {
              setExercises(buildUnitTest(unitId));
              setRun(run + 1);
              setPhase('test');
            }}
          >
            <span lang="bn">আবার চেষ্টা করো</span>
          </button>
        )}
        <button className={passed ? 'cta' : 'cta-text'} onClick={onExit}>
          <span lang="bn">ঠিক আছে</span>
        </button>
      </div>
    </div>
  );
}
