import { useState, type CSSProperties, type FormEvent } from 'react';
import { NAME_MAX, isValidName } from '../../lib/profile';
import { LearnerCard } from '../../components/card/LearnerCard';
import { ObButton } from './ObButton';
import { Glyph } from '../../components/Glyph';
import { arabicName } from '../../lib/arabicName';
import { target } from '../../lib/target';

interface Props {
  name: string;
  districtId: string | null;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function NameStep({ name, districtId, onChange, onNext }: Props) {
  const [focused, setFocused] = useState(true);
  const valid = isValidName(name);
  // In the Arabic course, the name in Arabic letters as it's typed: the first thing written in Arabic.
  const inArabic = target() === 'ar' && valid ? arabicName(name) : '';

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
        <p className="ob-sub" lang="bn">তোমার কার্ড তৈরি হচ্ছে।</p>
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
              <Glyph name="close" size={13} />
            </button>
          )}
        </label>
        <p className="ob-footnote" lang="bn">
          বন্ধুরা তোমাকে যে নামে ডাকে, সেটাই লেখো।
        </p>
        {inArabic && (
          <p className="ob-name-ar">
            <span lang="bn">আরবিতে তোমার নাম প্রায় এভাবে লেখা হয়</span>
            <strong lang="ar" dir="rtl">{inArabic}</strong>
          </p>
        )}
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
