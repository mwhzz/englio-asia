import { useEffect, useState } from 'react';
import { toBanglaDigits } from '../../lib/bangla';
import { buyPlus, plusInfo } from '../../lib/premium';

/** On the out-of-hearts screen: unlimited hearts with Englio Plus, when payments are set up. */
export function PlusOffer() {
  const [info, setInfo] = useState<{ available: boolean; price: number; days: number } | null>(null);
  useEffect(() => {
    plusInfo().then(setInfo);
  }, []);
  if (!info?.available) return null;
  return (
    <button className="cta plus-cta" onClick={() => buyPlus().catch(() => undefined)}>
      <span lang="bn">
        অফুরন্ত হার্ট নাও · {toBanglaDigits(info.price)} টাকা / {toBanglaDigits(info.days)} দিন
      </span>
    </button>
  );
}
