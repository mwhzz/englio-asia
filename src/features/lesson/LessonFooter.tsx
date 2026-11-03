import { useMemo } from 'react';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { SpeakButton } from '../../components/SpeakButton';
import type { Exercise, Grade } from '../../types';
import { answerOf } from './answerOf';
import { ComboPill } from './ComboPill';

const PRAISE = [
  ['দারুণ!', 'Excellent!'],
  ['চমৎকার!', 'Nice job!'],
  ['খুব ভালো!', 'Great!'],
  ['একদম ঠিক!', 'Correct!'],
  ['অসাধারণ!', 'Amazing!'],
];

interface Props {
  exercise: Exercise;
  canCheck: boolean;
  feedback: Grade | null;
  /** Right answers in a row, shown above the result from three on. */
  combo: number;
  onCheck: () => void;
  onNext: () => void;
}

/** The bottom bar: a check button, then a panel with the result, the right answer (to hear again) and a continue button. */
export function LessonFooter({ exercise, canCheck, feedback, combo, onCheck, onNext }: Props) {
  // A new phrase for each exercise, stable across re-renders.
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [exercise.id]);
  const wrong = feedback?.result === 'wrong';
  const tone = feedback ? (wrong ? ' is-wrong' : ' is-right') : '';
  const right = answerOf(exercise);

  return (
    <footer className={`lesson-foot${tone}`}>
      <div className="lesson-foot-inner">
        {feedback && (
          <div className="feedback" role="status">
            <span className="feedback-icon">
              <Glyph name={wrong ? 'close' : 'check'} size={22} />
            </span>
            <div className="feedback-text">
              {!wrong && combo >= 3 && <ComboPill combo={combo} />}
              {feedback.result === 'correct' && (
                <h3>
                  <span lang="bn">{praise[0]}</span> <small>{praise[1]}</small>
                </h3>
              )}
              {feedback.result === 'typo' && <h3 lang="bn">বানানটা খেয়াল করো</h3>}
              {wrong && <h3 lang="bn">ঠিক উত্তরটা হলো</h3>}
              {right && (
                <div className="feedback-answer">
                  <SpeakButton text={right.en} />
                  <span>
                    <span className="feedback-en">{right.en}</span>
                    <span className="feedback-meaning" lang="bn">
                      <MixedText text={right.bn} />
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {feedback ? (
          <button className={`cta ${wrong ? 'cta-red' : 'cta-green'}`} onClick={onNext} autoFocus>
            <span lang="bn">পরবর্তী</span>
          </button>
        ) : (
          <button className="cta" disabled={!canCheck} onClick={onCheck}>
            <span lang="bn">যাচাই করো</span>
          </button>
        )}
      </div>
    </footer>
  );
}
