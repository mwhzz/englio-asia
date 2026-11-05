import { useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { toBanglaDigits } from '../../lib/bangla';
import { useBackButton } from '../../lib/backButton';
import { haptic } from '../../lib/haptics';
import { playSound } from '../../lib/sounds';
import type { QuizQuestion } from '../../types';
import { fromWritten, type CourseQuestion } from '../grammar/course/makeQuestions';
import { QuestionView } from '../grammar/course/QuestionView';
import { ReportButton } from '../report/ReportButton';

const LATIN = /[A-Za-z]/;
const BANGLA = /[ঀ-৿]/;

/** "শূন্যস্থানে article বসাও: He is ___ man." → the Bangla instruction as the prompt, the English sentence on the card. */
export function asQuestion(q: QuizQuestion): CourseQuestion {
  const at = q.question.indexOf(': ');
  const head = at > 0 ? q.question.slice(0, at) : '';
  const tail = at > 0 ? q.question.slice(at + 2) : '';
  const split = BANGLA.test(head) && LATIN.test(tail) && !BANGLA.test(tail);
  return fromWritten({ prompt: split ? head : q.question, card: split ? tail : undefined, correct: q.correct, wrong: q.wrong, why: q.why });
}

interface Props {
  title: string;
  questions: QuizQuestion[];
  /** The page's color (CTA, progress). */
  color?: string;
  /** Share of right answers that counts as a pass (default: all). */
  passAt?: number;
  passedText: string;
  /** Where a "this question is wrong" report says it came from, e.g. "story:rainy-day". */
  where: string;
  onDone: (right: number, total: number) => void;
  onClose: () => void;
}

/**
 * A quiz full screen, one question at a time: the question on top, the answers at the bottom where the
 * thumb is, and the reason coming up from the bottom after each answer (the course-lesson layout).
 */
export function QuizScreen({ title, questions, color = 'var(--ios-green)', passAt = 1, passedText, where, onDone, onClose }: Props) {
  useBackButton(onClose);
  const [run, setRun] = useState(0);
  const asked = useMemo(() => questions.map(asQuestion), [questions, run]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const total = asked.length;
  const q = asked[i] as Extract<CourseQuestion, { kind: 'choice' }> | undefined;
  const done = i >= total;
  const passed = done && right >= Math.ceil(total * passAt);

  function pick(choice: string | number) {
    if (!q) return;
    haptic();
    setPicked(String(choice));
    const ok = choice === q.answer;
    playSound(ok ? 'correct' : 'wrong');
    if (ok) setRight((n) => n + 1);
  }

  function next() {
    const last = i + 1 >= total;
    setPicked(null);
    setI(i + 1);
    if (last) {
      playSound('complete');
      onDone(right, total);
    }
  }

  return createPortal(
    <div className="lg cl qz" role="dialog" aria-label={title} style={{ '--u': color } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close quiz">
          <Glyph name="close" size={16} />
        </button>
        <div className="lg-progress" aria-hidden="true">
          <span style={{ width: `${(100 * Math.min(i, total)) / Math.max(1, total)}%` }} />
        </div>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(Math.min(i + 1, total))}/{toBanglaDigits(total)}
        </span>
      </header>

      {q && !done && (
        <div className={`lg-body cl-ask${picked !== null ? ' is-answered' : ''}`} key={`${run}-${i}`}>
          <QuestionView q={q} picked={picked} onPick={pick} />
          {picked !== null && (
            <div className={`gq-why${picked === q.answer ? ' is-right' : ' is-wrong'}`}>
              <p lang="bn">
                <strong>{picked === q.answer ? 'ঠিক! ' : 'ভুল। '}</strong>
                {picked !== q.answer && (
                  <>
                    সঠিক উত্তর: <strong>{q.answer}</strong>।{' '}
                  </>
                )}
                <MixedText text={q.why} />
              </p>
              <div className="qz-actions">
                <ReportButton where={where} question={`${q.prompt} ${q.card}`.trim()} answer={picked} />
                <button className="cta" onClick={next}>
                  <span lang="bn">{i + 1 < total ? 'পরের প্রশ্ন' : 'ফলাফল দেখো'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="lg-done">
          <span className="lg-done-mark">
            <Glyph name={passed ? 'trophy' : 'target'} size={40} />
          </span>
          <h1 lang="bn">
            {toBanglaDigits(total)}টার মধ্যে {toBanglaDigits(right)}টা ঠিক
          </h1>
          <p lang="bn">{passed ? passedText : 'আরেকবার চেষ্টা করো, এবার আরও ভালো হবে।'}</p>
          <div className="cta-stack">
            <button className={passed ? 'cta-text' : 'cta'} onClick={() => (setRun(run + 1), setI(0), setRight(0))}>
              <span lang="bn">আবার করো</span>
            </button>
            <button className={passed ? 'cta' : 'cta-text'} onClick={onClose}>
              <span lang="bn">শেষ</span>
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
