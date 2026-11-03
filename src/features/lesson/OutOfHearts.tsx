import { toBanglaDigits } from '../../lib/bangla';
import { minutesUntil, nextHeartAt } from '../../lib/hearts';
import { useProgress } from '../../state/ProgressContext';
import { useNow } from '../home/useNow';
import { HeartRefill } from './HeartRefill';

/** No hearts left: the next heart refills like a clock; practice earns one right away. */
export function OutOfHearts({ onPractice, onQuit }: { onPractice: () => void; onQuit: () => void }) {
  const { progress } = useProgress();
  const now = useNow().getTime();
  const next = nextHeartAt(progress) ?? now;

  return (
    <div className="done-screen is-hearts">
      <div className="hearts-out">
        <HeartRefill msLeft={next - now} />
      </div>
      <h1 lang="bn">হার্ট শেষ</h1>
      <p className="done-sub" lang="bn">
        <strong>{toBanglaDigits(minutesUntil(next, now))} মিনিটে</strong> একটা হার্ট ফিরবে। এখনই অনুশীলন করলেও একটা পাবে।
      </p>
      <div className="cta-stack">
        <button className="cta" onClick={onPractice}>
          <span lang="bn">অনুশীলন করে হার্ট নাও</span>
        </button>
        <button className="cta-text" onClick={onQuit}>
          <span lang="bn">এখন না</span>
        </button>
      </div>
    </div>
  );
}
