import { BOARD } from '../../data/board';
import type { Exam } from '../../data/board/types';
import { toBanglaDigits } from '../../lib/bangla';
import { boardToday, boardTrend, dailyKey, dailyRound } from '../../lib/board';
import { useProgress } from '../../state/ProgressContext';
import type { QuizQuestion } from '../../types';

/**
 * The exam plan at the top of board practice: today's mixed round (10 questions from every topic) and the
 * last 14 days' scores as bars, so a learner sees whether they're getting better before the exam.
 */
export function ExamPlan({ exam, onStart }: { exam: Exam; onStart: (key: string, title: string, questions: QuizQuestion[]) => void }) {
  const { progress } = useProgress();
  const trend = boardTrend(progress);
  const done = boardToday(progress);
  const scored = trend.filter((d) => d.percent !== null) as { day: string; percent: number }[];
  const first = scored[0]?.percent;
  const last = scored.at(-1)?.percent;

  return (
    <section className="gt-card ep" lang="bn">
      <h2>পরীক্ষার প্ল্যান</h2>
      <p className="ep-note">
        {done ? 'আজকের রাউন্ড হয়ে গেছে। চাইলে আরেকটা দাও।' : 'রোজ ১০টা মিশ্র প্রশ্ন: সব টপিক থেকে একটু একটু।'}
        {scored.length >= 2 && first !== undefined && last !== undefined && (
          <> {last >= first ? `২ সপ্তাহে ${toBanglaDigits(first)}% থেকে ${toBanglaDigits(last)}%।` : `শেষ রাউন্ডে ${toBanglaDigits(last)}%। ঝালাই চালিয়ে যাও।`}</>
        )}
      </p>
      <div className="ep-chart" role="img" aria-label="Board scores, last 14 days">
        {trend.map((d) => (
          <span key={d.day} className="ep-day" title={`${d.day}: ${d.percent ?? '-'}%`}>
            <i style={{ height: `${d.percent ?? 0}%` }} className={d.percent === null ? 'is-empty' : d.percent >= 80 ? 'is-good' : undefined} />
          </span>
        ))}
      </div>
      <button className="cta" onClick={() => onStart(dailyKey(exam), 'আজকের বোর্ড রাউন্ড', dailyRound(BOARD, exam))}>
        <span>{done ? 'আরেকটা রাউন্ড' : 'আজকের রাউন্ড শুরু করো'} · ১০টা প্রশ্ন</span>
      </button>
    </section>
  );
}
