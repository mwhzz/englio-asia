import { Glyph } from '../../components/Glyph';

/** Top bar: a round glass back button and iOS-style page dots. */
export function NavBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <nav className="ob-nav">
      <button type="button" className="ob-back" onClick={onBack} aria-label="Back">
        <Glyph name="back" size={22} />
      </button>
      <div className="ob-dots" role="progressbar" aria-valuenow={step + 1} aria-valuemax={total} aria-label={`Step ${step + 1} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i === step ? 'is-current' : i < step ? 'is-done' : undefined} />
        ))}
      </div>
      <span aria-hidden="true" />
    </nav>
  );
}
