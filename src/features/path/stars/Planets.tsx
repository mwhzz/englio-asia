/** Two small planets drifting in the empty parts of the sky. */
export function Planets({ height }: { height: number }) {
  return (
    <g aria-hidden="true">
      <g transform={`translate(34 ${Math.round(height * 0.34)})`} className="sky-planet sky-planet-ringed">
        <circle r="9" className="sky-planet-body" />
        <ellipse rx="16" ry="4" transform="rotate(-18)" className="sky-planet-ring" />
      </g>
      <g transform={`translate(330 ${Math.round(height * 0.6)})`} className="sky-planet sky-planet-red">
        <circle r="6" className="sky-planet-body" />
        <circle r="2" cx="-1.5" cy="-1.5" className="sky-planet-spot" />
      </g>
    </g>
  );
}
