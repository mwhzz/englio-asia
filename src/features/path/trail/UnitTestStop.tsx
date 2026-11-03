import { Glyph } from '../../../components/Glyph';
import { toBanglaDigits } from '../../../lib/bangla';
import { haptic } from '../../../lib/haptics';

interface Props {
  /** All the unit's lessons are done. */
  ready: boolean;
  /** Best passing score, if passed. */
  passed?: number;
  onStart: () => void;
}

/** The unit test at the end of a unit on the path: locked until its lessons are done, a trophy once passed. */
export function UnitTestStop({ ready, passed, onStart }: Props) {
  return (
    <button
      className={`uts${passed ? ' is-passed' : ready ? ' is-ready' : ''}`}
      disabled={!ready}
      onClick={() => {
        haptic();
        onStart();
      }}
    >
      <span className="uts-icon" aria-hidden="true">
        <Glyph name={passed ? 'trophy' : ready ? 'target' : 'lock'} size={17} />
      </span>
      <span className="uts-text">
        <strong lang="bn">ইউনিট টেস্ট</strong>
        <small lang="bn">{passed ? `পাস · ${toBanglaDigits(passed)}% · সার্টিফিকেট পেয়েছ` : ready ? 'পাস করলে সার্টিফিকেট' : 'সব লেসন শেষ হলে খুলবে'}</small>
      </span>
      {ready && !passed && (
        <span className="uts-go" lang="bn">
          শুরু
        </span>
      )}
    </button>
  );
}
