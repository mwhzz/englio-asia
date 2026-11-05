import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { Modal } from '../../components/Modal';
import { toBanglaDigits } from '../../lib/bangla';
import { buyPlus, plusInfo } from '../../lib/premium';
import type { Unit } from '../../types';

/** Tapping a lesson (or test) of a Plus-only unit: what it is, and the way to get Plus when it's on sale. */
export function LockedUnitSheet({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const [info, setInfo] = useState<{ available: boolean; price: number; days: number } | null>(null);
  useEffect(() => {
    plusInfo().then(setInfo);
  }, []);

  return (
    <Modal onClose={onClose}>
      <span className="locked-icon" aria-hidden="true">
        <Glyph name="lock" size={32} />
      </span>
      <h2 lang="bn">এই ইউনিট Englio Plus-এ</h2>
      <p className="muted" lang="bn">
        <strong>{unit.title}</strong> · {unit.titleBn}। এই ইউনিটের লেসন আর টেস্ট খুলতে Englio Plus লাগবে। Plus-এ অফুরন্ত হার্টও পাবে।
      </p>
      <div className="cta-stack">
        {info?.available ? (
          <button className="cta" onClick={() => buyPlus().catch(() => undefined)}>
            <span lang="bn">
              Plus নাও · {toBanglaDigits(info.price)} টাকা / {toBanglaDigits(info.days)} দিন
            </span>
          </button>
        ) : (
          <p className="locked-soon" lang="bn">
            Plus কেনা শিগগিরই চালু হবে।
          </p>
        )}
        <button className="cta-text" onClick={onClose}>
          <span lang="bn">এখন না</span>
        </button>
      </div>
    </Modal>
  );
}
