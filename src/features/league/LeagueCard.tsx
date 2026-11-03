import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { findDistrict } from '../../data/districts';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { fetchLeague, type League } from '../../lib/league';
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
    fetchLeague(districtId).then((l) => live && setLeague(l));
    return () => {
      live = false;
    };
  }, [districtId, open]);

  const district = findDistrict(districtId);
  if (!league || !district) return null;

  return (
    <>
      <button
        className="rc lc home-rise"
        style={{ animationDelay: '210ms' }}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="rc-icon lc-icon" aria-hidden="true">
          <Glyph name="trophy" size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">জেলা লিগ</strong>
          <small lang="bn">
            {league.myDistrictRank ? `এই সপ্তাহে ${district.bn} ${toBanglaDigits(league.myDistrictRank)} নম্বরে` : `${district.bn}-এর হয়ে প্রথম পয়েন্ট আনো`}
            {league.me ? ` · তুমি ${toBanglaDigits(league.me.rank)} নম্বরে` : ''}
          </small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && <LeaguePage league={league} district={district} onClose={() => setOpen(false)} />}
    </>
  );
}
