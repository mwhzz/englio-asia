import { useEffect } from 'react';
import { playSound } from '../../lib/sounds';

/** A short "all set" moment before the dashboard opens. */
export function DoneStep({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    playSound('complete');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(onDone, reduced ? 600 : 1700);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="ob-screen ob-done" role="status">
      <div className="ob-done-check">
        <svg viewBox="0 0 52 52" width="96" height="96" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-16" />
        </svg>
      </div>
      <h1 className="ob-title ob-rise" style={{ textAlign: 'center' }}>
        <span lang="bn">সব প্রস্তুত,</span> {name}!
      </h1>
      <p className="ob-sub ob-rise" style={{ textAlign: 'center' }}>
        <span lang="bn">তোমার ইংরেজি শেখা শুরু হলো।</span>
      </p>
    </div>
  );
}
