import { forwardRef } from 'react';
import { toBanglaDigits } from '../../lib/bangla';

interface Props {
  name: string;
  unitNumber: number;
  unitTitle: string;
  unitTitleBn: string;
  color: string;
  score: number;
  date: string;
  place?: string;
  /** A section's checkpoint (all its units) rather than one unit. */
  section?: boolean;
}

const W = 600;
const H = 420;

/**
 * The unit certificate as one SVG, so the same drawing shows on screen and saves as a picture.
 * It uses plain SVG text with system font fallbacks, since a saved image can't load web fonts.
 */
export const Certificate = forwardRef<SVGSVGElement, Props>(function Certificate(
  { name, unitNumber, unitTitle, unitTitleBn, color, score, date, place, section = false },
  ref,
) {
  const when = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const sans = "Inter, 'Segoe UI', Roboto, Arial, sans-serif";
  const bangla = "'Anek Bangla Variable', 'Anek Bangla', 'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', sans-serif";

  return (
    <svg ref={ref} className="cert" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Certificate for ${name}`}>
      <rect width={W} height={H} rx="28" fill="#ffffff" />
      <rect x="14" y="14" width={W - 28} height={H - 28} rx="20" fill="none" stroke={color} strokeWidth="3" />
      <rect x="24" y="24" width={W - 48} height={H - 48} rx="14" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 6" />
      {/* Fine rings in a corner, like a banknote. */}
      {[60, 90, 120, 150].map((r) => (
        <circle key={r} cx={W - 30} cy={H - 30} r={r} fill="none" stroke={color} strokeOpacity="0.12" />
      ))}

      <rect x={W / 2 - 22} y="44" width="44" height="44" rx="12" fill="#34c759" />
      <text x={W / 2} y="74" textAnchor="middle" fontFamily={sans} fontSize="24" fontWeight="800" fill="#fff">
        E
      </text>
      <text x={W / 2} y="118" textAnchor="middle" fontFamily={sans} fontSize="13" fontWeight="700" letterSpacing="3" fill={color}>
        ENGLIO · CERTIFICATE
      </text>
      <text x={W / 2} y="146" textAnchor="middle" fontFamily={bangla} fontSize="20" fontWeight="600" fill="#1c1c1e">
        সনদপত্র
      </text>

      <text x={W / 2} y="184" textAnchor="middle" fontFamily={sans} fontSize="14" fill="#6e6e73">
        This certifies that
      </text>
      <text x={W / 2} y="224" textAnchor="middle" fontFamily={`${sans}, ${bangla}`} fontSize="34" fontWeight="700" fill="#000">
        {name}
      </text>
      <line x1="150" y1="238" x2={W - 150} y2="238" stroke={color} strokeOpacity="0.5" />
      <text x={W / 2} y="266" textAnchor="middle" fontFamily={sans} fontSize="15" fill="#3a3a3c">
        has completed {section ? 'Section' : 'Unit'} {unitNumber}: {section ? unitTitleBn : unitTitle}
      </text>
      <text x={W / 2} y="290" textAnchor="middle" fontFamily={bangla} fontSize="15" fill="#6e6e73">
        {section ? 'সেকশন' : 'ইউনিট'} {toBanglaDigits(unitNumber)}: {unitTitleBn} সফলভাবে শেষ করেছে
      </text>

      <g fontFamily={sans} fill="#3a3a3c">
        <text x="130" y="346" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#8e8e93">
          SCORE
        </text>
        <text x="130" y="370" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>
          {score}%
        </text>
        <text x={W / 2} y="346" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#8e8e93">
          DATE
        </text>
        <text x={W / 2} y="370" textAnchor="middle" fontSize="16" fontWeight="600">
          {when}
        </text>
        <text x={W - 130} y="346" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#8e8e93">
          FROM
        </text>
        <text x={W - 130} y="370" textAnchor="middle" fontSize="16" fontWeight="600" fontFamily={`${sans}, ${bangla}`}>
          {place || 'Bangladesh'}
        </text>
      </g>
    </svg>
  );
});
