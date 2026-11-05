import { useEffect, useState } from 'react';
import { toBanglaDigits } from '../../lib/bangla';
import { buyPlus, plusInfo } from '../../lib/premium';

/** On the out-of-hearts screen: Englio Plus (unlimited hearts and every unit), when payments are set up. */
export function PlusOffer() {
  const [info, setInfo] = useState<{ available: boolean; price: number; days: number } | null>(null);
  useEffect(() => {
    plusInfo().then(setInfo);
  }, []);
  if (!info?.available) return null;
  return (
    <button className="cta plus-cta" onClick={() => buyPlus().catch(() => undefined)}>
      <span lang="bn">
        Englio Plus নাও · {toBanglaDigits(info.price)} টাকা / {toBanglaDigits(info.days)} দিন
      </span>
    </button>
  );
}
