import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { buyPlus, isPlus, plusInfo, plusUntil, refreshPlus } from '../../lib/premium';

/** Settings: Englio Plus (unlimited hearts) through bKash, or until when it's on. Hidden until payments are set up. */
export function PlusRow() {
  const [info, setInfo] = useState<{ available: boolean; price: number; days: number } | null>(null);
  const [until, setUntil] = useState(plusUntil);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(false);

  useEffect(() => {
    plusInfo().then(setInfo);
    refreshPlus().then(setUntil);
  }, []);

  const on = isPlus();
  if (!on && !info?.available) return null;
  const date = until ? new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long' }).format(new Date(until)) : '';

  return (
    <button
      className="pf-row plus-row"
      disabled={busy || !info?.available}
      onClick={async () => {
        haptic();
        setBusy(true);
        setProblem(false);
        await buyPlus().catch(() => setProblem(true));
        setBusy(false);
      }}
    >
      <span className="pf-icon plus-icon">
        <Glyph name="heart" size={16} />
      </span>
      <span className="pf-row-text">
        <span lang="bn">Englio Plus {on && '· চালু আছে'}</span>
        <small lang="bn">
          {problem
            ? 'bKash খোলা গেল না। একটু পরে আবার চেষ্টা করো।'
            : on
              ? `অফুরন্ত হার্ট · ${date} পর্যন্ত${info?.available ? ' · আরও দিন যোগ করতে চাপো' : ''}`
              : `অফুরন্ত হার্ট, ভুল করলেও থামতে হবে না · ${toBanglaDigits(info!.price)} টাকায় ${toBanglaDigits(info!.days)} দিন, bKash দিয়ে`}
        </small>
      </span>
      <Glyph name="chevron" size={16} className="pf-chevron" />
    </button>
  );
}
