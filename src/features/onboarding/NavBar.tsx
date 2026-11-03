/** Top bar: a round glass back button and iOS-style page dots. */
export function NavBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <nav className="ob-nav">
      <button type="button" className="ob-back" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 12 20" width="11" height="18" aria-hidden="true">
          <path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
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
