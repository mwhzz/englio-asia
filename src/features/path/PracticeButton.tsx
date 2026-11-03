import { Glyph } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';

/** A small glass button for a practice session (earns a heart). */
export function PracticeButton({ onPractice }: { onPractice: () => void }) {
  return (
    <button
      className="practice-btn"
      onClick={() => {
        haptic();
        onPractice();
      }}
    >
      <Glyph name="dumbbell" size={17} />
      <span lang="bn">অনুশীলন</span>
    </button>
  );
}
