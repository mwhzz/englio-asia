import { useState } from 'react';
import { Glyph, type GlyphName } from '../../components/Glyph';

const KEY = 'englio-how-it-works-off';

const POINTS: [GlyphName, string, string, string][] = [
  ['bolt', '#ffb800', 'XP', 'প্রতিটা লেসন আর অনুশীলনে পয়েন্ট পাবে। দিনের লক্ষ্য পূরণ করো।'],
  ['flame', '#ff9500', 'স্ট্রিক', 'প্রতিদিন অন্তত একটা লেসন করলে স্ট্রিক বাড়ে। ৭ দিনে একটা ফ্রিজ পাবে, একদিন বাদ গেলে সেটা বাঁচায়।'],
  ['heart', '#ff3b30', 'হার্ট', 'লেসনে ভুল করলে একটা কমে। অনুশীলন করলে বা সময় গেলে আবার ফেরে।'],
  ['shuffle', '#ff2d55', 'ঝালাই', 'যেগুলো ভুল করো, সেগুলো পরে আবার আসে, যতক্ষণ না মনে থাকে।'],
];

/** For a learner's first days: what XP, streaks, hearts and review are, once. */
export function HowItWorks() {
  const [off, setOff] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  if (off) return null;

  const close = () => {
    setOff(true);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // Shown again next time; harmless.
    }
  };

  return (
    <section className="hw home-rise" aria-label="How Englio works">
      <header className="hw-head">
        <strong lang="bn">Englio কীভাবে চলে</strong>
        <button className="vh-close" onClick={close} aria-label="Hide">
          <Glyph name="close" size={14} />
        </button>
      </header>
      <ul className="hw-list">
        {POINTS.map(([icon, color, title, text]) => (
          <li key={title}>
            <span className="hw-icon" style={{ background: color }} aria-hidden="true">
              <Glyph name={icon} size={15} />
            </span>
            <span lang="bn">
              <b>{title}:</b> {text}
            </span>
          </li>
        ))}
      </ul>
      <button className="cta-text hw-ok" onClick={close}>
        <span lang="bn">বুঝেছি</span>
      </button>
    </section>
  );
}
