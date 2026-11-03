import { HEART_REGEN_MS } from '../../lib/hearts';

const HEART =
  'M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.1 8 21.6 11.6 19.5 16.4 12 21 12 21z';

/** An empty heart that fills from the bottom like a clock while the next heart comes back. */
export function HeartRefill({ msLeft }: { msLeft: number }) {
  const filled = Math.min(1, Math.max(0, 1 - msLeft / HEART_REGEN_MS));
  // The heart spans y = 4…21 in its 24-unit box.
  const top = 21 - 17 * filled;

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
