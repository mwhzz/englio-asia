import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { findDistrict } from '../../data/districts';
import { toBanglaDigits, possessive } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { fetchLeague, withMyXp, type League } from '../../lib/league';
import { isLowData } from '../../lib/offline';
import { useProgress } from '../../state/ProgressContext';
import { LeaguePage } from './LeaguePage';

/** The home page's district league card: my district's place this week; opens the full league. Hidden offline. */
export function LeagueCard() {
  const { progress } = useProgress();
  const districtId = progress.profile?.districtId;
  const [league, setLeague] = useState<League | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    if (isLowData()) return;
    fetchLeague(districtId).then((l) => live && setLeague(l));
    return () => {
      live = false;
    };
  }, [districtId, open]);
  // This phone's XP of the week counts at once, before the server hears of it.
  const view = league ? withMyXp(league, progress.xpByDay, progress.profile?.name ?? '') : null;

  const district = findDistrict(districtId);
  if (!view || !district) return null;

  return (
    <>
      <button
        className="rc lgc home-rise"
        style={{ animationDelay: '210ms' }}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="rc-icon lgc-icon" aria-hidden="true">
          <Glyph name="trophy" size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">জেলা লিগ</strong>
          <small lang="bn">
            {view.myDistrictRank ? `এই সপ্তাহে ${district.bn} ${toBanglaDigits(view.myDistrictRank)} নম্বরে` : `${possessive(district.bn)} হয়ে প্রথম পয়েন্ট আনো`}
            {view.me ? ` · তুমি ${toBanglaDigits(view.me.rank)} নম্বরে` : ''}
          </small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && <LeaguePage league={view} district={district} onClose={() => setOpen(false)} />}
    </>
  );
}
