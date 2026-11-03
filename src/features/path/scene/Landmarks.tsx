import type { ReactNode } from 'react';
import type { UnitMark } from '../riverLayout';

const shadow = (rx: number) => <ellipse cx="0" cy="2" rx={rx} ry={rx * 0.22} className="sc-shadow" />;

/** Unit 1 · First Steps: a little village with huts and a haystack. */
function Village() {
  return (
    <>
      {shadow(34)}
      <g transform="translate(-16 -2)">
        <rect x="-11" y="-13" width="22" height="14" rx="1" className="sc-wall" />
        <path d="M-15 -12 L0 -26 L15 -12 Z" className="sc-roof-thatch" />
        <path d="M-10 -16.5h20M-6 -20.5h12" className="sc-thatch-line" />
        <rect x="-3" y="-8" width="6" height="9" rx="1" className="sc-door" />
      </g>
      <g transform="translate(14 4) scale(0.85)">
        <rect x="-11" y="-13" width="22" height="14" rx="1" className="sc-wall" />
        <path d="M-15 -12 L0 -25 L15 -12 Z" className="sc-roof-tin" />
        <rect x="-3" y="-8" width="6" height="9" rx="1" className="sc-door" />
      </g>
      <g transform="translate(30 -8) scale(0.8)">
        <path d="M-8 1 Q-9 -10 0 -15 Q9 -10 8 1 Z" className="sc-hay" />
      </g>
    </>
  );
}

/** Unit 2 · Family: a home with a garden fence and a clothesline. */
function Home() {
  return (
    <>
      {shadow(32)}
      <rect x="-20" y="-22" width="34" height="22" rx="1.5" className="sc-wall-white" />
      <path d="M-25 -21 L-3 -38 L19 -21 Z" className="sc-roof-red" />
      <rect x="-15" y="-16" width="7" height="7" rx="1" className="sc-window" />
      <rect x="2" y="-16" width="7" height="7" rx="1" className="sc-window" />
      <rect x="-6" y="-11" width="7" height="11" rx="1" className="sc-door" />
      <path d="M-30 0v-7M-26 0v-7M-22 0v-7M-30 -4h8" className="sc-fence" />
      <path d="M17 -9v9M31 -9v9M17 -8q7 4 14 0" className="sc-fence" />
      <rect x="20" y="-6" width="3" height="4" className="sc-cloth-a" />
      <rect x="25" y="-5" width="3" height="4" className="sc-cloth-b" />
    </>
  );
}

/** Unit 3 · Food & Drink: a market stall with a striped awning and fruit. */
function Market() {
  return (
    <>
      {shadow(30)}
      <path d="M-22 -14v15M22 -14v15" className="sc-stall-pole" />
      <rect x="-20" y="-6" width="40" height="7" rx="1" className="sc-stall-table" />
      <path d="M-26 -14 L-22 -24 H22 L26 -14 Z" className="sc-awning" />
      <path d="M-18 -24 L-19.5 -14 M-10 -24 L-10.5 -14 M-2 -24 L-2 -14 M6 -24 L6.5 -14 M14 -24 L15 -14" className="sc-awning-stripe" />
      <circle cx="-13" cy="-8" r="3" className="sc-fruit-orange" />
      <circle cx="-7" cy="-8.5" r="3" className="sc-fruit-green" />
      <circle cx="0" cy="-8" r="3" className="sc-fruit-red" />
      <circle cx="7" cy="-8.5" r="3" className="sc-fruit-orange" />
      <circle cx="13" cy="-8" r="3" className="sc-fruit-yellow" />
      <path d="M26 1q4 -7 8 0z" className="sc-basket" />
    </>
  );
}

/** Unit 4 · Numbers & Time: a clock tower. */
function ClockTower() {
  return (
    <>
      {shadow(20)}
      <rect x="-9" y="-46" width="18" height="47" rx="1.5" className="sc-tower" />
      <rect x="-9" y="-46" width="4" height="47" className="sc-tower-shade" />
      <path d="M-12 -45 L0 -58 L12 -45 Z" className="sc-roof-red" />
      <circle cx="0" cy="-35" r="6.5" className="sc-clock" />
      <path d="M0 -35v-4.5M0 -35l3 2" className="sc-clock-hand" />
      <rect x="-3" y="-8" width="6" height="9" rx="3" className="sc-door" />
      <rect x="-4" y="-22" width="3" height="5" rx="1" className="sc-window" />
      <rect x="1" y="-22" width="3" height="5" rx="1" className="sc-window" />
    </>
  );
}

/** Unit 5 · Daily Life: a school with the Bangladesh flag. */
function School() {
  return (
    <>
      {shadow(36)}
      <rect x="-28" y="-20" width="48" height="21" rx="1.5" className="sc-wall-cream" />
      <path d="M-31 -20 H23 L19 -26 H-27 Z" className="sc-roof-tin" />
      {[-23, -15, -7, 1, 9].map((x) => (
        <rect key={x} x={x} y="-15" width="5" height="6" rx="0.8" className="sc-window" />
      ))}
      <rect x="-4" y="-7" width="6" height="8" rx="1" className="sc-door" />
      <path d="M30 1V-34" className="sc-flagpole" />
      <rect x="30" y="-34" width="14" height="9" className="sc-flag-green" />
      <circle cx="36" cy="-29.5" r="2.8" className="sc-flag-red" />
    </>
  );
}

/** Unit 6 · Travel: a small station with a train. */
function Station() {
  return (
    <>
      {shadow(38)}
      <path d="M-40 4H40M-40 7H40" className="sc-rail" />
      {[-36, -28, -20, -12, -4, 4, 12, 20, 28, 36].map((x) => (
        <path key={x} d={`M${x} 2.5v6`} className="sc-sleeper" />
      ))}
      <rect x="-34" y="-11" width="22" height="13" rx="2.5" className="sc-train" />
      <rect x="-10" y="-11" width="20" height="13" rx="2.5" className="sc-train" />
      <rect x="12" y="-13" width="18" height="15" rx="3" className="sc-engine" />
      <rect x="22" y="-19" width="4" height="6" className="sc-engine" />
      {[-31, -24, -7, 0].map((x) => (
        <rect key={x} x={x} y="-8" width="5" height="4" rx="0.8" className="sc-window" />
      ))}
      <rect x="15" y="-10" width="6" height="5" rx="1" className="sc-window" />
      <path d="M-34 -1.5H30" className="sc-train-stripe" />
      {[-28, -18, -4, 6, 17, 26].map((x) => (
        <circle key={x} cx={x} cy="3" r="2" className="sc-wheel" />
      ))}
    </>
  );
}

const LANDMARKS: (() => ReactNode)[] = [Village, Home, Market, ClockTower, School, Station];

/** The landmark beside each unit's bridge, matching the unit's topic. */
export function Landmark({ mark }: { mark: UnitMark }) {
  const Draw = LANDMARKS[mark.unitIndex % LANDMARKS.length];
  return (
    <g className="sc-landmark" transform={`translate(${mark.landmark.x} ${mark.landmark.y})`}>
      <Draw />
    </g>
  );
}
