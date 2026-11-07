import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { findClassLevel } from '../../data/classLevels';
import { haptic } from '../../lib/haptics';
import { setPolite, setPoliteChoice, wantsPolite } from '../../lib/polite';
import { useProgress } from '../../state/ProgressContext';

/** Settings: speak to me as আপনি (on by itself for job / other learners). Turning it off reloads the page in তুমি. */
export function PoliteRow() {
  const { progress } = useProgress();
  const [on, setOn] = useState(() => wantsPolite(findClassLevel(progress.profile?.classId)?.stage));
  return (
    <label className="pf-row">
      <span className="pf-icon" style={{ background: '#5856d6' }}>
        <Glyph name="person" size={17} />
      </span>
      <span className="pf-row-text">
        <span lang="bn">আপনি বলে ডাকো</span>
        <small lang="bn">বন্ধ থাকলে অ্যাপ তুমি বলে কথা বলে</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        className="pf-switch"
        checked={on}
        onChange={(e) => {
          haptic();
          const next = e.target.checked;
          setPoliteChoice(next ? 'on' : 'off');
          setOn(next);
          if (next) setPolite(true);
          else location.reload();
        }}
      />
    </label>
  );
}
