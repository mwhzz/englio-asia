import { useState } from 'react';
import { savedTextSize, setTextSize, type TextSize } from '../../lib/textSize';

const NEXT: Record<TextSize, TextSize> = { normal: 'large', large: 'larger', larger: 'normal' };
const LABEL: Record<TextSize, string> = { normal: 'লেখা বড় করো', large: 'আরও বড়', larger: 'আগের মতো' };

/** On the first screen: make the text bigger before onboarding (same setting as Profile → লেখার সাইজ). */
export function TextSizeToggle() {
  const [size, setSize] = useState<TextSize>(savedTextSize);
  return (
    <button
      type="button"
      className="ob-textsize"
      aria-label="Text size"
      onClick={() => {
        const next = NEXT[size];
        setTextSize(next);
        setSize(next);
      }}
    >
      <span aria-hidden="true">অ</span>
      <span aria-hidden="true" className="ob-textsize-big">
        অ
      </span>
      <small lang="bn">{LABEL[size]}</small>
    </button>
  );
}
