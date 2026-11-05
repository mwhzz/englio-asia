import { HEART_REGEN_MS } from '../../lib/hearts';
import { HEART_PATH } from '../../components/Glyph';

const HEART = HEART_PATH;

/** An empty heart that fills from the bottom like a clock while the next heart comes back. */
export function HeartRefill({ msLeft }: { msLeft: number }) {
  const filled = Math.min(1, Math.max(0, 1 - msLeft / HEART_REGEN_MS));
  // The heart spans y = 5…20 in its 24-unit box.
  const top = 20 - 15 * filled;

  return (
    <svg className="refill" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id="refill-level">
          <rect x="0" y={top} width="24" height={24 - top} className="refill-level" />
        </clipPath>
      </defs>
      <path d={HEART} className="refill-empty" />
      <path d={HEART} className="refill-full" clipPath="url(#refill-level)" />
    </svg>
  );
}
