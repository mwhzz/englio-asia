import { DISTRICT_SHAPES } from '../../features/onboarding/map/districtShapes';

/** The real outline of one district, drawn large and faint on the card. */
export function DistrictSilhouette({ districtId }: { districtId: string | null }) {
  const shape = DISTRICT_SHAPES.find((s) => s.id === districtId);
  if (!shape) return null;
  const [x, y, w, h] = shape.box;
  const pad = Math.max(w, h) * 0.06;
  return (
    <svg
      className="lc-silhouette"
      key={shape.id}
      viewBox={`${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path d={shape.d} />
    </svg>
  );
}
