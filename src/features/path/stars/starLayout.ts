import type { CSSProperties } from 'react';
import type { Lesson, Unit } from '../../../types';
import { seeded, type Pt } from '../scene/geometry';

/** The sky is laid out in a 360-unit-wide space and scaled to the screen. */
export const SKY_WIDTH = 360;
const CX = SKY_WIDTH / 2;
const TOP = 76; // room for the summary chip
const VILLAGE = 160; // the village horizon at the bottom
const SIGN_SPACE = 124; // a unit's sign
const STEP = 86; // between stars
const UNIT_GAP = 40;

export interface Star extends Pt {
  unit: Unit;
  unitIndex: number;
  lesson: Lesson;
  lessonIndex: number;
  /** Position among all lessons in the course. */
  index: number;
}

export interface Constellation {
  unit: Unit;
  unitIndex: number;
  sign: Pt;
  stars: Star[];
  /** A soft glow of the unit's color behind its stars. */
  nebula: Pt & { rx: number; ry: number };
}

export interface Sky {
  height: number;
  constellations: Constellation[];
  stars: Star[];
  /** Faint background stars. */
  dust: (Pt & { r: number; twinkle: boolean })[];
}

/** Places each unit as a small constellation: a sign, then its lessons as stars in a zig-zag. */
export function skyLayout(units: Unit[]): Sky {
  const constellations: Constellation[] = [];
  const stars: Star[] = [];
  let y = TOP;
  let index = 0;

  units.forEach((unit, unitIndex) => {
    const sign = { x: CX, y: y + 26 };
    y += SIGN_SPACE;
    const own: Star[] = unit.lessons.map((lesson, lessonIndex) => {
      // A gentle zig-zag whose shape changes a little from unit to unit.
      const x = CX + 80 * Math.sin(index * 2.2 + unitIndex * 0.7 + 0.6);
      const star = { unit, unitIndex, lesson, lessonIndex, index, x, y };
      y += STEP;
      index++;
      return star;
    });
    stars.push(...own);
    const top = own[0].y;
    const bottom = own[own.length - 1].y;
    const nebula = { x: own.reduce((s, p) => s + p.x, 0) / own.length, y: (top + bottom) / 2, rx: 150, ry: (bottom - top) / 2 + 70 };
    constellations.push({ unit, unitIndex, sign, stars: own, nebula });
    y += UNIT_GAP - STEP + 60;
  });

  const height = y + VILLAGE;
  const rand = seeded(5);
  const dust = Array.from({ length: Math.round(height / 9) }, () => ({
    x: rand() * SKY_WIDTH,
    y: rand() * height,
    r: 0.5 + rand() * 1.1,
    twinkle: rand() < 0.3,
  }));

  return { height, constellations, stars, dust };
}

/** CSS position for a sky point, as percentages of the sky box. */
export function placeInSky(p: Pt, height: number): CSSProperties {
  return { left: `${(p.x / SKY_WIDTH) * 100}%`, top: `${(p.y / height) * 100}%` };
}
