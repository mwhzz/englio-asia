import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { canDownload, downloadForOffline, isLowData, setLowData } from '../../lib/offline';

/** Settings for poor or costly internet: keep everything on the phone, and low-data mode. */
export function OfflineRows() {
  const [low, setLow] = useState(isLowData);
  const [state, setState] = useState<{ done: number; total: number } | 'done' | 'failed' | null>(null);

  async function download() {
    haptic();
    setState({ done: 0, total: 0 });
    try {
      await downloadForOffline((done, total) => setState({ done, total }));
      setState('done');
    } catch {
      setState('failed');
    }
  }

  const note =
    state === 'done'
      ? 'সব নামানো হয়েছে। এখন ইন্টারনেট ছাড়াও পুরো অ্যাপ চলবে।'
      : state === 'failed'
        ? 'নামানো গেল না। ইন্টারনেট চালু করে আবার চেষ্টা করো।'
        : state
          ? `নামাচ্ছে… ${toBanglaDigits(state.done)}/${toBanglaDigits(state.total || '…')}`
          : 'লেসন, ছবি আর রেকর্ডিং ফোনে রেখে দেবে';

  return (
    <>
      {canDownload() && (
        <button className="pf-row" onClick={download} disabled={!!state && state !== 'done' && state !== 'failed'}>
          <span className="pf-icon" style={{ background: 'var(--ios-indigo, #5856d6)' }}>
            <Glyph name="check" size={16} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">অফলাইনের জন্য সব নামাও</span>
            <small lang="bn">{note}</small>
          </span>
        </button>
      )}
      <label className="pf-row">
        <span className="pf-icon" style={{ background: 'var(--ios-teal, #30b0c7)' }}>
          <Glyph name="bolt" size={16} />
        </span>
        <span className="pf-row-text">
          <span lang="bn">কম ডেটা মোড</span>
          <small lang="bn">ছবি আর রেকর্ডিং নামাবে না, ফোনের ভয়েসে শোনাবে</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="pf-switch"
          checked={low}
          onChange={(e) => {
            haptic();
            setLow(e.target.checked);
            setLowData(e.target.checked);
          }}
        />
      </label>
    </>
  );
}
