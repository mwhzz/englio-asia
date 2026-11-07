import { useState, type CSSProperties } from 'react';
import { DIVISIONS, findDistrict } from '../../data/districts';
import { DistrictSearch } from './DistrictSearch';
import { DIVISION_COLORS } from './map/divisionColors';
import { ObButton } from './ObButton';

interface Props {
  mapSlot: (el: HTMLDivElement | null) => void;
  districtId: string | null;
  onPick: (id: string) => void;
  onNext: () => void;
}

export function DistrictStep({ mapSlot, districtId, onPick, onNext }: Props) {
  const [searching, setSearching] = useState(false);
  const district = findDistrict(districtId);

  return (
    <div className="ob-screen">
      <header className="ob-head ob-rise">
        <h1 className="ob-title" lang="bn">
          তুমি কোন জেলার?
        </h1>
        <p className="ob-sub" lang="bn">ম্যাপে তোমার জেলায় চাপ দাও।</p>
      </header>

      <div ref={mapSlot} className="ob-map-slot" />

      <div className="ob-picked ob-rise" style={{ '--i': 1 } as CSSProperties}>
        {district ? (
          <div className="ob-chip" key={district.id}>
            <span className="ob-chip-dot" style={{ '--dot': DIVISION_COLORS[district.division] } as CSSProperties} />
            <span>
              <strong lang="bn">{district.bn}</strong> {district.en}
              <small lang="bn">{DIVISIONS[district.division].bn} বিভাগ</small>
            </span>
          </div>
        ) : (
          <p className="ob-hint">
            <strong lang="bn">জেলা বেছে নাও</strong>
            <small lang="bn">ম্যাপে চাপ দাও বা খুঁজো</small>
          </p>
        )}
        <button type="button" className="ob-search-btn" onClick={() => setSearching(true)}>
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span lang="bn">খুঁজো</span>
        </button>
      </div>

      <div className="ob-rise" style={{ '--i': 2 } as CSSProperties}>
        <ObButton disabled={!district} onClick={onNext}>
          <span lang="bn">পরবর্তী</span>
        </ObButton>
      </div>
      <p className="ob-credit">Map: BBS, OCHA ROAP via geoBoundaries (CC BY 3.0 IGO)</p>

      {searching && (
        <DistrictSearch
          selectedId={districtId}
          onClose={() => setSearching(false)}
          onPick={(id) => {
            onPick(id);
            setSearching(false);
          }}
        />
      )}
    </div>
  );
}
