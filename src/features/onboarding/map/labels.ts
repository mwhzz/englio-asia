import type { DistrictShape } from './districtShapes';

// Bangla vowel signs and the hasanta don't take their own width.
const COMBINING = /[ঁ-ঃ়-ৗ]/g;

// Hand-placed labels where neighbouring names would collide (map units).
const TWEAKS: Record<string, { x?: number; y?: number; size?: number }> = {
  madaripur: { x: 334, y: 562 },
  shariatpur: { x: 388, y: 590 },
  narsingdi: { x: 428, y: 438 },
  brahmanbaria: { x: 486, y: 470, size: 11 },
  bagerhat: { x: 272, y: 662 },
  pirojpur: { x: 312, y: 716 },
  jhalokati: { x: 352, y: 674 },
  narail: { x: 246, y: 586 },
  gopalganj: { x: 304, y: 612 },
  lalmonirhat: { x: 214, y: 78, size: 10 },
  nilphamari: { x: 146, y: 114 },
  bhola: { x: 440, y: 700 },
  patuakhali: { x: 372, y: 738 },
  manikganj: { x: 296, y: 464 },
  dhaka: { x: 360, y: 490 },
  tangail: { x: 322, y: 372 },
  sirajganj: { x: 250, y: 388 },
};

export interface Label {
  x: number;
  y: number;
  /** Font size in map units, sized to fit inside the district. */
  size: number;
}

export function labelFor(shape: DistrictShape, name: string): Label {
  const [, , w, h] = shape.box;
  const glyphs = Math.max(2, name.replace(COMBINING, '').length);
  const fit = Math.min(15, Math.max(8, Math.min(w / (glyphs * 0.62), h / 2.6)));
  const tweak = TWEAKS[shape.id] ?? {};
  return { x: tweak.x ?? shape.cx, y: tweak.y ?? shape.cy, size: Math.round((tweak.size ?? fit) * 10) / 10 };
}
