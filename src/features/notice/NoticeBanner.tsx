import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { appSettings } from '../../lib/appSettings';

const KEY = 'englio-notice-seen';

/** The owner's notice (admin → সেটিংস → সবাইকে বার্তা) at the top of the home page, until the learner closes it. */
export function NoticeBanner() {
  const { text, tone } = appSettings().notice;
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });
  if (!text || seen === text) return null;
  const close = () => {
    try {
      localStorage.setItem(KEY, text);
    } catch {
      // Closed for now.
    }
    setSeen(text);
  };
  return (
    <div className={`nb home-rise${tone === 'warn' ? ' is-warn' : ''}`} role="status">
      <Glyph name={tone === 'warn' ? 'alert' : 'bell'} size={18} />
      <p lang="bn">{text}</p>
      <button className="nb-close" aria-label="Close" onClick={close}>
        <Glyph name="close" size={14} />
      </button>
    </div>
  );
}
