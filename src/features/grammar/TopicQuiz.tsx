import { useMemo, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { shuffle } from '../../lib/random';
import { playSound } from '../../lib/sounds';
import type { QuizQuestion } from '../../types';

/** A few questions (after a grammar topic or a story), one at a time, with the reason shown after each answer. */
export function TopicQuiz({ quiz, onPassed, passedText }: { quiz: QuizQuestion[]; onPassed: () => void; passedText?: string }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [run, setRun] = useState(0);
  const q = quiz[i];
  const options = useMemo(() => (q ? shuffle([q.correct, ...q.wrong]) : []), [q, run]);
  const done = i >= quiz.length;

  function pick(option: string) {
    if (picked) return;
    haptic();
    setPicked(option);
    const right = option === q.correct;
    playSound(right ? 'correct' : 'wrong');
    if (right) setScore((s) => s + 1);
  }

  function next() {
    const last = i + 1 >= quiz.length;
    if (last && score === quiz.length) onPassed();
    setPicked(null);
    setI(i + 1);
  }

  if (done) {
    const all = score === quiz.length;
    return (
      <div className={`gq-done${all ? ' is-all' : ''}`}>
        <span className="gq-done-mark">
          <Glyph name={all ? 'trophy' : 'target'} size={26} />
        </span>
        <strong lang="bn">
          {toBanglaDigits(quiz.length)}টার মধ্যে {toBanglaDigits(score)}টা ঠিক
        </strong>
        <small lang="bn">{all ? (passedText ?? 'দারুণ! টপিকটা শেখা হয়েছে হিসেবে চিহ্নিত হলো।') : 'আরেকবার চেষ্টা করো, সব ঠিক হলে শেষ হবে।'}</small>
        <button
          className="gq-again"
          onClick={() => {
            setI(0);
            setScore(0);
            setRun(run + 1);
          }}
        >
          <span lang="bn">আবার করো</span>
        </button>
      </div>
    );
  }

  return (
    <div className="gq" key={`${run}-${i}`}>
      <p className="gq-count" lang="bn">
        প্রশ্ন {toBanglaDigits(i + 1)}/{toBanglaDigits(quiz.length)}
      </p>
      <p className="gq-question" lang="bn">
        <MixedText text={q.question} />
      </p>
      <div className="gq-options">
        {options.map((option) => {
          const state = !picked ? '' : option === q.correct ? ' is-right' : option === picked ? ' is-wrong' : ' is-dim';
          return (
            <button key={option} className={`gq-option${state}`} onClick={() => pick(option)} disabled={!!picked}>
              <span>{option}</span>
              {picked && option === q.correct && <Glyph name="check" size={16} />}
              {picked === option && option !== q.correct && <Glyph name="close" size={14} />}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={`gq-why${picked === q.correct ? ' is-right' : ' is-wrong'}`}>
          <p lang="bn">
            <strong>{picked === q.correct ? 'ঠিক! ' : 'ভুল। '}</strong>
            <MixedText text={q.why} />
          </p>
          <button className="cta" onClick={next}>
            <span lang="bn">{i + 1 < quiz.length ? 'পরের প্রশ্ন' : 'ফলাফল দেখো'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
