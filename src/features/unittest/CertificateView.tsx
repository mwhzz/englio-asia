import { useRef, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { findDistrict } from '../../data/districts';
import type { Unit } from '../../types';
import { useProgress } from '../../state/ProgressContext';
import { Certificate } from './Certificate';
import { saveCertificate } from './saveCertificate';

/** A unit's certificate with a button to save or share it as a picture. */
export function CertificateView({ unit, unitNumber, score, date }: { unit: Unit; unitNumber: number; score: number; date: string }) {
  const { progress } = useProgress();
  const svg = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  const name = progress.profile?.name ?? 'Learner';

  return (
    <div className="cv">
      <Certificate
        ref={svg}
        name={name}
        unitNumber={unitNumber}
        unitTitle={unit.title}
        unitTitleBn={unit.titleBn}
        color={unit.color}
        score={score}
        date={date}
        place={findDistrict(progress.profile?.districtId)?.en}
      />
      <button
        className="cv-save"
        onClick={() =>
          svg.current &&
          saveCertificate(svg.current, `englio-unit-${unitNumber}-certificate.png`).catch((e: Error) => setError(e.message))
        }
      >
        <Glyph name="bookmark" size={15} />
        <span lang="bn">ছবি হিসেবে সেভ / শেয়ার করো</span>
      </button>
      {error && <p className="cv-error">{error}</p>}
    </div>
  );
}
