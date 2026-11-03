/** The bottom of the sky: a village at night in silhouette, with warm lit windows. */
export function VillageHorizon({ y }: { y: number }) {
  const frond = (x: number, top: number) =>
    `M${x} ${top}q-12 -2 -20 6M${x} ${top}q12 -3 20 4M${x} ${top}q-6 -10 -16 -10M${x} ${top}q6 -10 16 -9M${x} ${top}q0 -8 2 -13`;

  return (
    <g transform={`translate(0 ${y})`} className="sky-village" aria-hidden="true">
      {/* palms */}
      <path d="M40 60Q44 36 50 18" className="sky-village-trunk" />
      <path d={frond(50, 18)} className="sky-village-frond" />
      <path d="M302 60Q298 38 292 24" className="sky-village-trunk" />
      <path d={frond(292, 24)} className="sky-village-frond" />
      <path d="M326 62Q324 48 330 36" className="sky-village-trunk" />
      <path d={frond(330, 36)} className="sky-village-frond" />
      {/* huts */}
      <path d="M84 47L100 34L116 47V60H86V47Z" className="sky-village-land" />
      <rect x="97" y="50" width="5" height="5" rx="1" className="sky-village-window" />
      <path d="M232 51L245 41L258 51V62H234V51Z" className="sky-village-land" />
      <rect x="242" y="54" width="4.5" height="4.5" rx="1" className="sky-village-window" />
      <path d="M150 54L160 46L170 54V62H152V54Z" className="sky-village-land" />
      {/* the ground */}
      <path d="M0 62Q50 44 110 58T230 54T360 60V100H0Z" className="sky-village-land" />
    </g>
  );
}
