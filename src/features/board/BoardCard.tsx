import { lazy, Suspense, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { boardToday, examFor } from '../../lib/board';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';

// The question bank only loads when the page opens.
const BoardPage = lazy(() => import('./BoardPage').then((m) => ({ default: m.BoardPage })));

/** "SSC/HSC বোর্ড প্রস্তুতি": opens board-exam practice (on the grammar page, and on home for classes 8–12). */
export function BoardCard({ delay = 0 }: { delay?: number }) {
  const { progress } = useProgress();
  const [open, setOpen] = useState(false);
  const exam = examFor(progress.profile?.classId) === 'hsc' ? 'HSC' : 'SSC';

  return (
    <>
      <button
        className="rc bdc home-rise"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="rc-icon bdc-icon" aria-hidden="true">
          <Glyph name="target" size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">{exam} বোর্ড প্রস্তুতি</strong>
          <small lang="bn">{boardToday(progress) ? 'আজকের রাউন্ড হয়ে গেছে · সব টপিক, মডেল টেস্ট' : 'আজকের ১০টা প্রশ্নের রাউন্ড বাকি'}</small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && (
        <Suspense fallback={null}>
          <BoardPage onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
