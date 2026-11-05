import { Glyph } from '../../../components/Glyph';
import type { CourseQuestion } from './makeQuestions';
import { MixedText } from '../../../components/MixedText';

interface Props {
  q: CourseQuestion;
  /** What the learner chose: an option, or the index of a tapped word; null while answering. */
  picked: string | number | null;
  onPick: (choice: string | number) => void;
}

/** A word or sentence with one word underlined. */
function Card({ text, mark }: { text: string; mark?: string }) {
  if (!mark) return <>{text}</>;
  const i = text.indexOf(mark);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <u>{mark}</u>
      {text.slice(i + mark.length)}
    </>
  );
}

/** One course question: choose an answer, or tap the right word in a sentence. */
export function QuestionView({ q, picked, onPick }: Props) {
  if (q.kind === 'tap') {
    return (
      <div className="cq">
        <h1 className="cq-prompt" lang="bn">
          {q.prompt}
        </h1>
        <p className="cq-card cq-sentence">
          {q.words.map((w, i) =>
            w.pos ? (
              <button
                key={i}
                className={`cq-word${picked === null ? '' : w.pos === q.target ? ' is-right' : picked === i ? ' is-wrong' : ' is-dim'}`}
                disabled={picked !== null}
                onClick={() => onPick(i)}
              >
                {w.word}
              </button>
            ) : (
              <span key={i} className="cq-plain">
                {w.word}
              </span>
            ),
          )}
        </p>
        <p className="cq-hint" lang="bn">
          ধূসর শব্দগুলো (the, a, my…) এই খেলায় নেই
        </p>
      </div>
    );
  }

  const yesNo = q.options.length === 2 && q.options[0] === 'হ্যাঁ';
  return (
    <div className="cq">
      <h1 className="cq-prompt" lang="bn">
        <MixedText text={q.prompt} />
      </h1>
      {q.card && (
        <p className={`cq-card${q.card.includes(' ') ? ' cq-sentence' : ' cq-word-card'}`}>
          <Card text={q.card} mark={q.mark} />
        </p>
      )}
      <div className={`cq-options${yesNo ? ' is-pair' : ''}`}>
        {q.options.map((option) => {
          const state = picked === null ? '' : option === q.answer ? ' is-right' : option === picked ? ' is-wrong' : ' is-dim';
          return (
            <button key={option} className={`gq-option${state}`} disabled={picked !== null} onClick={() => onPick(option)}>
              {/* English answers in the English font, Bangla ones in the Bangla font. */}
              <span lang={/[ঀ-৿]/.test(option) ? 'bn' : 'en'}>{option}</span>
              {picked !== null && option === q.answer && <Glyph name="check" size={16} />}
              {picked === option && option !== q.answer && <Glyph name="close" size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
