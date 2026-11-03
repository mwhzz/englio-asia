import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';
import { install, installState, onInstallChange } from '../../lib/install';

/** "Install the app" in settings: Chrome's install dialog, or how to add it on an iPhone. Hidden once installed. */
export function InstallRow() {
  const [state, setState] = useState(installState);
  const [hint, setHint] = useState(false);
  useEffect(() => onInstallChange(() => setState(installState())), []);

  if (state === 'installed' || state === 'none') return null;

  return (
    <button
      className="pf-row"
      onClick={() => {
        haptic();
        if (state === 'ready') install();
        else setHint(!hint);
      }}
    >
      <span className="pf-icon" style={{ background: 'var(--ios-green)' }}>
        <Glyph name="home" size={17} />
      </span>
      <span className="pf-row-text">
        <span lang="bn">অ্যাপটা ইনস্টল করো</span>
        <small lang="bn">{hint ? 'Safari-র Share বোতাম চাপো, তারপর "Add to Home Screen"।' : 'হোম স্ক্রিন থেকে এক চাপে খোলো, ইন্টারনেট ছাড়াও চলে'}</small>
      </span>
      <Glyph name="chevron" size={16} className="pf-chevron" />
    </button>
  );
}
