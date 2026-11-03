import type { Stop } from '../riverLayout';

/** A wooden jetty (ঘাট) reaching from the bank into the river. */
export function Dock({ stop }: { stop: Stop }) {
  const { x, y, side } = stop;
  // The jetty runs from the land (behind the stop) into the water (in front of it).
  const land = x + side * 26;
  const water = x - side * 30;
  const from = Math.min(land, water);
  const width = Math.abs(land - water);
  const posts = [water, (water + x) / 2, x];

  return (
    <g className="sc-dock">
      <rect x={from} y={y + 5} width={width} height="5" rx="2" className="sc-dock-shadow" />
      {posts.map((px) => (
        <rect key={px} x={px - 1.4} y={y - 1} width="2.8" height="11" rx="1" className="sc-dock-post" />
      ))}
      <rect x={from} y={y - 5} width={width} height="10" rx="2" className="sc-dock-deck" />
      {Array.from({ length: Math.floor(width / 5) }, (_, i) => (
        <path key={i} d={`M${(from + 5 + i * 5).toFixed(1)} ${y - 5}v10`} className="sc-dock-plank" />
      ))}
      {/* A lantern at the water end (it glows at night). */}
      <path d={`M${water} ${y - 4}v-14`} className="sc-lamp-post" />
      <circle cx={water} cy={y - 19} r="6" className="sc-lamp-glow" />
      <rect x={water - 2.2} y={y - 22} width="4.4" height="5" rx="1.2" className="sc-lamp" />
    </g>
  );
}
