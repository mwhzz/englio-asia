import { useState, type CSSProperties, type FormEvent } from 'react';
import { NAME_MAX, isValidName } from '../../lib/profile';
import { LearnerCard } from '../../components/card/LearnerCard';
import { ObButton } from './ObButton';

interface Props {
  name: string;
  districtId: string | null;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function NameStep({ name, districtId, onChange, onNext }: Props) {
  const [focused, setFocused] = useState(true);
  const valid = isValidName(name);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid) onNext();
  }

  return (
    <form className="ob-screen ob-scroll" onSubmit={submit}>
      <header className="ob-head ob-rise">
        <h1 className="ob-title" lang="bn">
          তোমার নাম কী?
        </h1>
        <p className="ob-sub">Your Englio student pass is being made.</p>
      </header>

      <div className="ob-rise" style={{ '--i': 1 } as CSSProperties}>
        <LearnerCard name={name} districtId={districtId} typing={focused} />
      </div>

      <div className="ob-rise" style={{ '--i': 2 } as CSSProperties}>
        <label className="ob-field">
          <input
            autoFocus
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="নাম লেখো · Type your name"
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="next"
            aria-label="Your name"
          />
          {name && (
            <button type="button" className="ob-clear" onClick={() => onChange('')} aria-label="Clear name">
              <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </label>
        <p className="ob-footnote" lang="bn">
          বন্ধুরা তোমাকে যে নামে ডাকে, সেটাই লেখো।
        </p>
      </div>

      <div className="ob-grow" />

      <div className="ob-rise ob-sticky-cta" style={{ '--i': 3 } as CSSProperties}>
        <ObButton type="submit" disabled={!valid}>
          <span lang="bn">পরবর্তী</span>
        </ObButton>
      </div>
    </form>
  );
}
