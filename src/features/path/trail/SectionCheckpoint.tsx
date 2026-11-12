import { Glyph } from '../../../components/Glyph';
import { toBanglaDigits } from '../../../lib/bangla';
import { haptic } from '../../../lib/haptics';

/** The end of a section: one bigger test over all its units, open when they're all done. */
export function SectionCheckpoint({ number, ready, passed, onStart }: { number: number; ready: boolean; passed?: number; onStart: () => void }) {
  return (
    <button
      type="button"
      className={`sec-check${ready ? ' is-ready' : ''}${passed ? ' is-passed' : ''}`}
      disabled={!ready}
      onClick={() => {
        haptic();
        onStart();
      }}
    >
      <span className="sec-check-icon" aria-hidden="true">
        <Glyph name={passed ? 'trophy' : ready ? 'target' : 'lock'} size={24} />
      </span>
      <span className="sec-check-text">
        <strong lang="bn">সেকশন {toBanglaDigits(number)} এর পরীক্ষা</strong>
        <small lang="bn">
          {passed ? `পাস করেছ · ${toBanglaDigits(passed)}%` : ready ? 'সব ইউনিট শেষ, এবার বড় পরীক্ষা দাও' : 'সেকশনের সব ইউনিট শেষ হলে খুলবে'}
        </small>
      </span>
    </button>
  );
}
