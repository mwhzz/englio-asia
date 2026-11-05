import { useState } from 'react';
import { haptic } from '../../lib/haptics';
import { savedTextSize, setTextSize, type TextSize } from '../../lib/textSize';

const SIZES: [TextSize, string][] = [
  ['normal', 'সাধারণ'],
  ['large', 'বড়'],
  ['larger', 'আরও বড়'],
];

/** Bigger text for learners who find it small (older people, young children, small phones). */
export function TextSizeRow() {
  const [size, choose] = useState<TextSize>(savedTextSize);
  return (
    <div className="pf-row is-tall">
      <span className="pf-icon" style={{ background: 'var(--ios-gray, #8e8e93)' }} aria-hidden="true">
        <span className="ts-glyph">অ</span>
      </span>
      <span className="pf-row-main">
        <span className="pf-row-text">
          <span lang="bn">লেখার সাইজ</span>
          <small lang="bn">পড়তে কষ্ট হলে বড় করো</small>
        </span>
        <span className="pf-segmented" role="radiogroup" aria-label="Text size">
          {SIZES.map(([id, bn]) => (
            <button
              key={id}
              role="radio"
              aria-checked={size === id}
              className={size === id ? 'is-on' : undefined}
              onClick={() => {
                haptic();
                setTextSize(id);
                choose(id);
              }}
            >
              <span lang="bn">{bn}</span>
            </button>
          ))}
        </span>
      </span>
    </div>
  );
}
