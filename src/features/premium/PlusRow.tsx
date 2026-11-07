import { useEffect, useState } from 'react';
import { dateLocale } from '../../lib/learnerLang';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { isPlus, plusInfo, plusUntil, refreshPlus, type PlusInfo } from '../../lib/premium';
import { feature } from '../../lib/appSettings';
import { PlusSheet } from './PlusSheet';

/**
 * Settings: Englio Plus. Opens the Plus sheet (free trial, bKash plans on the website, promo code), or says
 * until when it's on. Hidden only when the owner switched Plus off.
 */
export function PlusRow() {
  const [info, setInfo] = useState<PlusInfo | null>(null);
  const [until, setUntil] = useState(plusUntil);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    plusInfo().then(setInfo);
    refreshPlus().then(setUntil);
  }, []);

  const on = isPlus();
  if (!on && !feature('plus')) return null;
  const date = until ? new Intl.DateTimeFormat(dateLocale(), { day: 'numeric', month: 'long' }).format(new Date(until)) : '';
  const offer = info?.available
    ? `অফুরন্ত হার্ট আর সব ইউনিট · ${toBanglaDigits(info.price)} টাকায় ${toBanglaDigits(info.days)} দিন`
    : info && info.trialDays > 0
      ? `অফুরন্ত হার্ট আর সব ইউনিট · ${toBanglaDigits(info.trialDays)} দিন ফ্রি`
      : 'অফুরন্ত হার্ট আর সব ইউনিট · প্রোমো কোড থাকলে এখানে দাও';

  return (
    <>
      <button
        className="pf-row plus-row"
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="pf-icon plus-icon">
          <Glyph name="heart" size={16} />
        </span>
        <span className="pf-row-text">
          <span lang="bn">Englio Plus {on && '· চালু আছে'}</span>
          <small lang="bn">{on ? `${date} পর্যন্ত চালু` : offer}</small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && <PlusSheet onClose={() => setOpen(false)} onChange={setUntil} />}
    </>
  );
}
