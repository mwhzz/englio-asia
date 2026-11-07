import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { Modal } from '../../components/Modal';
import { BOARD } from '../../data/board';
import type { BoardTopic, Exam } from '../../data/board/types';
import { toBanglaDigits } from '../../lib/bangla';
import { useBackButton } from '../../lib/backButton';
import { applyBoardRound, examFor, modelKey, modelTest, roundOf, ROUND, MODEL_TEST, topicsFor } from '../../lib/board';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';
import type { QuizQuestion } from '../../types';
import { QuizScreen } from '../quiz/QuizScreen';
import { ExamPlan } from './ExamPlan';

const COLOR = '#ff9500';
const EXAMS: [Exam, string][] = [
  ['ssc', 'SSC'],
  ['hsc', 'HSC'],
];

interface Round {
  key: string;
  title: string;
  questions: QuizQuestion[];
  startedAt: number;
}

/** SSC/HSC English 2nd Paper practice: every board topic with its best score, and mixed model tests. */
export function BoardPage({ onClose }: { onClose: () => void }) {
  useBackButton(onClose);
  const { progress, update } = useProgress();
  const [exam, setExam] = useState<Exam>(() => examFor(progress.profile?.classId));
  const [topic, setTopic] = useState<BoardTopic | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const topics = topicsFor(BOARD, exam);
  const scores = progress.boardScores ?? {};
  const practised = topics.filter((t) => scores[t.id] !== undefined);
  const average = practised.length ? Math.round(practised.reduce((n, t) => n + scores[t.id], 0) / practised.length) : null;

  const start = (key: string, title: string, questions: QuizQuestion[]) => {
    haptic();
    setTopic(null);
    setRound({ key, title, questions, startedAt: Date.now() });
  };

  return createPortal(
    <div className="gt bd-page" role="dialog" aria-label="Board exam practice" style={{ '--u': COLOR } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          বোর্ড প্রস্তুতি
        </span>
        <span className="lp-bar-space" />
      </header>

      <div className="gt-body">
        <div className="pf-segmented bd-exams" role="tablist">
          {EXAMS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={exam === id} className={exam === id ? 'is-on' : undefined} onClick={() => setExam(id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="gt-hero bd-hero">
          <h1 lang="bn">{exam === 'ssc' ? 'SSC' : 'HSC'} ইংরেজি ২য় পত্র</h1>
          <p className="gt-summary" lang="bn">
            {average === null
              ? `বোর্ড পরীক্ষার ধরনে ${toBanglaDigits(topics.length)}টা টপিক। যেকোনোটা দিয়ে শুরু করো।`
              : `${toBanglaDigits(practised.length)}/${toBanglaDigits(topics.length)} টপিক অনুশীলন হয়েছে · গড় ${toBanglaDigits(average)}%`}
          </p>
          <button className="cta bd-model" onClick={() => start(modelKey(exam), 'Model test', modelTest(BOARD, exam))}>
            <span lang="bn">
              মডেল টেস্ট · {toBanglaDigits(MODEL_TEST)}টা প্রশ্ন
              {scores[modelKey(exam)] !== undefined && ` · সেরা ${toBanglaDigits(scores[modelKey(exam)])}%`}
            </span>
          </button>
        </div>

        <ExamPlan exam={exam} onStart={start} />

        <div className="pf-list">
          {topics.map((t, i) => {
            const best = scores[t.id];
            return (
              <button key={t.id} className="pf-row bd-row" onClick={() => setTopic(t)}>
                <span className="bd-num" lang="bn">
                  {toBanglaDigits(i + 1)}
                </span>
                <span className="pf-row-text">
                  <span>{t.title}</span>
                  <small lang="bn">
                    {t.titleBn} · {toBanglaDigits(t.questions.length)}টা প্রশ্ন
                  </small>
                  <span className="bd-bar" aria-hidden="true">
                    <i style={{ width: `${best ?? 0}%` }} className={best !== undefined && best >= 80 ? 'is-good' : undefined} />
                  </span>
                </span>
                <span className="bd-best" lang="bn">
                  {best === undefined ? 'নতুন' : `${toBanglaDigits(best)}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {topic && (
        <Modal onClose={() => setTopic(null)}>
          <div className="bd-sheet">
            <h2>
              {topic.title} <small lang="bn">{topic.titleBn}</small>
            </h2>
            <p className="bd-tip" lang="bn">
              <strong>মনে রাখো: </strong>
              <MixedText text={topic.tip} />
            </p>
            <div className="cta-stack">
              <button className="cta" onClick={() => start(topic.id, topic.title, roundOf(topic))}>
                <span lang="bn">
                  অনুশীলন শুরু ·{' '}
                  {topic.questions.length > ROUND
                    ? `${toBanglaDigits(topic.questions.length)}টা থেকে ${toBanglaDigits(ROUND)}টা প্রশ্ন`
                    : `${toBanglaDigits(topic.questions.length)}টা প্রশ্ন`}
                </span>
              </button>
              <button className="cta-text" onClick={() => setTopic(null)}>
                <span lang="bn">পরে</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {round && (
        <QuizScreen
          key={round.startedAt}
          title={round.title}
          questions={round.questions}
          color={COLOR}
          passAt={0.8}
          where={`board:${round.key}`}
          passedText="দারুণ! বোর্ডে এমন হলে A+ নিশ্চিত।"
          onDone={(right, total) => update((p) => applyBoardRound(p, round.key, right, total, Math.round((Date.now() - round.startedAt) / 1000)))}
          onClose={() => setRound(null)}
        />
      )}
    </div>,
    document.body,
  );
}
