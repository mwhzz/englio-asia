import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import type { QuizQuestion } from '../../types';
import { QuizScreen } from '../quiz/QuizScreen';

interface Props {
  quiz: QuizQuestion[];
  title: string;
  /** For "this question is wrong" reports, e.g. "topic:articles". */
  where: string;
  color?: string;
  onPassed: () => void;
  passedText?: string;
}

/** The quiz at the end of a grammar topic or a story: a card that opens it full screen (answers at the bottom). */
export function TopicQuiz({ quiz, title, where, color, onPassed, passedText = 'দারুণ! টপিকটা শেখা হয়েছে হিসেবে চিহ্নিত হলো।' }: Props) {
  const [open, setOpen] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  return (
    <>
      <button
        className="qz-start"
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="qz-start-icon" aria-hidden="true">
          <Glyph name={best === quiz.length ? 'trophy' : 'target'} size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">{best === null ? 'কুইজ দাও' : 'আবার কুইজ দাও'}</strong>
          <small lang="bn">
            {toBanglaDigits(quiz.length)}টা প্রশ্ন
            {best !== null && ` · শেষবার ${toBanglaDigits(best)}টা ঠিক`}
          </small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && (
        <QuizScreen
          title={title}
          questions={quiz}
          color={color}
          where={where}
          passedText={passedText}
          onDone={(right, total) => {
            setBest(right);
            if (right === total) onPassed();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
