import type { CSSProperties } from 'react';
import type { Lesson, Unit } from '../../types';
import { band, bandEdges, polyline, seeded, smoothLine, xAt, type Pt } from './scene/geometry';

/** The scene is drawn in a 360-unit-wide space and scaled to the screen. */
export const SCENE_WIDTH = 360;
const CX = SCENE_WIDTH / 2;
// Bends are kept gentle enough (radius > half the river + sand) that the banks never fold over.
const SWING = 32; // how far the river bends left and right
const STEP = 150; // between lessons
const RIVER_WIDTH = 96;
const SAND = 11; // sandy shore on each side

export type Side = -1 | 1;

export interface Stop extends Pt {
  unit: Unit;
  unitIndex: number;
  lesson: Lesson;
  lessonIndex: number;
  /** Position among all lessons in the course. */
  index: number;
  /** Which bank the jetty is on. */
  side: Side;
  /** Where the ship waits, mid-river beside the jetty. */
  ship: Pt;
}

export interface UnitMark {
  unit: Unit;
  unitIndex: number;
  /** Center of the glass sign above the bridge. */
  sign: Pt;
  bridgeY: number;
  /** Left and right ends of the bridge deck. */
  bridgeFrom: number;
  bridgeTo: number;
  landmark: Pt;
}

export type ItemKind = 'tree' | 'palm' | 'hut' | 'field' | 'bush' | 'haystack' | 'cow' | 'pond';

export interface SceneItem extends Pt {
  kind: ItemKind;
  scale: number;
  /** Small per-item variation (roof color, rotation …). */
  variant: number;
}

export interface WaterThing extends Pt {
  kind: 'ripple' | 'sparkle' | 'hyacinth' | 'ducks' | 'fishing-boat' | 'reeds' | 'stones' | 'glint';
  variant: number;
}

export interface Scene {
  height: number;
  stops: Stop[];
  marks: UnitMark[];
  mouth: Pt;
  center: string;
  water: string;
  sand: string;
  shoreLeft: string;
  shoreRight: string;
  items: SceneItem[];
  waterThings: WaterThing[];
  birds: Pt[];
  /** Soft lighter / darker blotches that break up the grass. */
  patches: Patch[];
  /** Night only: tiny glowing dots over the fields. */
  fireflies: Pt[];
}

export interface Patch extends Pt {
  rx: number;
  ry: number;
  light: boolean;
}

/** Lays out the whole river journey: the winding river, jetties, bridges, landmarks and scenery. */
export function sceneLayout(units: Unit[]): Scene {
  const ctrl: Pt[] = [{ x: CX, y: 0 }];
  const stops: Stop[] = [];
  const marks: UnitMark[] = [];

  let y = 0; // top of the current unit's block
  let index = 0;
  units.forEach((unit, unitIndex) => {
    const bridgeY = y + 112;
    marks.push({
      unit,
      unitIndex,
      sign: { x: CX, y: y + 54 },
      bridgeY,
      bridgeFrom: 0,
      bridgeTo: 0,
      landmark: { x: unitIndex % 2 === 0 ? 56 : SCENE_WIDTH - 56, y: bridgeY + 36 },
    });
    // Each bridge sits where the river crosses the middle.
    ctrl.push({ x: CX, y: bridgeY });

    let stopY = bridgeY + 120;
    unit.lessons.forEach((lesson, lessonIndex) => {
      const side: Side = index % 2 === 0 ? 1 : -1;
      ctrl.push({ x: CX + side * SWING, y: stopY });
      stops.push({ unit, unitIndex, lesson, lessonIndex, index, side, x: 0, y: stopY, ship: { x: 0, y: stopY } });
      stopY += STEP;
      index++;
    });
    // The next unit's sign starts a little below the last jetty.
    y = stopY - STEP + 56;
  });

  const mouth = { x: CX, y: y + 60 };
  ctrl.push(mouth, { x: CX, y: mouth.y + 140 });
  const height = mouth.y + 110;

  const line = smoothLine(ctrl);
  const widthAt = (i: number) => RIVER_WIDTH + 4 * Math.sin(i * 0.13);
  const water = bandEdges(line, widthAt);
  const sand = bandEdges(line, (i) => widthAt(i) + SAND * 2);

  // Jetties sit on the outer bank of each bend; the ship waits mid-river beside them.
  for (const s of stops) {
    const shore = s.side > 0 ? xAt(water.right, s.y) : xAt(water.left, s.y);
    s.x = shore + s.side * 8;
    // A little toward mid-river so the ship sits clear of the jetty button.
    s.ship = { x: xAt(line, s.y) - s.side * 22, y: s.y };
  }
  for (const m of marks) {
    m.bridgeFrom = xAt(sand.left, m.bridgeY) - 14;
    m.bridgeTo = xAt(sand.right, m.bridgeY) + 14;
  }

  return {
    height,
    stops,
    marks,
    mouth,
    center: polyline(line),
    water: band(water.left, water.right),
    sand: band(sand.left, sand.right),
    shoreLeft: polyline(water.left),
    shoreRight: polyline(water.right),
    items: scatterLand(sand, stops, marks, height),
    waterThings: scatterWater(line, water, stops, marks, height),
    patches: scatterPatches(height),
    fireflies: scatterFireflies(sand, height),
    birds: [0.1, 0.3, 0.52, 0.74, 0.9].map((f, i) => ({ x: 40 + ((i * 97) % 260), y: height * f })),
  };
}

/** Trees, palms, huts, fields, cows and ponds on both banks, kept clear of jetties, signs and landmarks. */
function scatterLand(sand: { left: Pt[]; right: Pt[] }, stops: Stop[], marks: UnitMark[], height: number): SceneItem[] {
  const rand = seeded(64);
  const items: SceneItem[] = [];
  const blocked = (x: number, y: number) =>
    stops.some((s) => Math.abs(s.y - y) < 40 && Math.abs(s.x - x) < 50) ||
    marks.some(
      (m) =>
        (Math.abs(m.sign.y - y) < 40 && Math.abs(m.sign.x - x) < 156) ||
        Math.abs(m.bridgeY - y) < 18 ||
        (Math.abs(m.landmark.y - y) < 50 && Math.abs(m.landmark.x - x) < 60),
    );

  for (let y = 16; y < height - 30; y += 21) {
    for (const side of [-1, 1] as Side[]) {
      const shore = side < 0 ? xAt(sand.left, y) : xAt(sand.right, y);
      const from = side < 0 ? 6 : shore + 12;
      const to = side < 0 ? shore - 12 : SCENE_WIDTH - 6;
      if (to - from < 20 || rand() < 0.16) continue;
      const x = from + rand() * (to - from);
      if (blocked(x, y)) continue;
      const roll = rand();
      const room = to - from;
      const kind: ItemKind =
        room > 100 && roll < 0.05
          ? 'pond'
          : room > 80 && roll < 0.17
            ? 'field'
            : room > 60 && roll < 0.24
              ? 'cow'
              : roll < 0.5
                ? 'tree'
                : roll < 0.68
                  ? 'palm'
                  : roll < 0.8
                    ? 'hut'
                    : roll < 0.86
                      ? 'haystack'
                      : 'bush';
      items.push({ kind, x, y: y + rand() * 12, scale: 0.85 + rand() * 0.35, variant: rand() });
    }
  }
  // Flat things (fields, ponds) go underneath; everything else is drawn top to bottom.
  const flat = (k: ItemKind) => (k === 'field' || k === 'pond' ? 0 : 1);
  return items.sort((a, b) => flat(a.kind) - flat(b.kind) || a.y - b.y);
}

/** Ripples, sparkles, water hyacinth, ducks and small fishing boats on the river. */
function scatterWater(line: Pt[], water: { left: Pt[]; right: Pt[] }, stops: Stop[], marks: UnitMark[], height: number): WaterThing[] {
  const rand = seeded(7);
  const things: WaterThing[] = [];
  const nearStop = (y: number) => stops.some((s) => Math.abs(s.y - y) < 40);
  const nearBridge = (y: number) => marks.some((m) => Math.abs(m.bridgeY - y) < 44);

  for (let y = 30; y < height - 40; y += 30) {
    const cx = xAt(line, y);
    things.push({ kind: rand() < 0.7 ? 'ripple' : 'sparkle', x: cx + (rand() - 0.5) * 56, y, variant: rand() });
  }
  // Reeds where the sand meets the grass, and pebbles on the sand.
  for (let y = 40; y < height - 60; y += 38) {
    if (nearStop(y) || nearBridge(y)) continue;
    const left = rand() < 0.5;
    const edge = left ? xAt(water.left, y) - SAND + 2 : xAt(water.right, y) + SAND - 2;
    things.push({ kind: rand() < 0.75 ? 'reeds' : 'stones', x: edge, y, variant: rand() });
  }
  // Night only: moonlight shimmering down the middle of the river.
  for (let y = 50; y < height - 60; y += 64) {
    things.push({ kind: 'glint', x: xAt(line, y) + (rand() - 0.5) * 20, y, variant: rand() });
  }
  for (let y = 70; y < height - 60; y += 84) {
    if (nearStop(y)) continue;
    const left = rand() < 0.5;
    const shore = left ? xAt(water.left, y) : xAt(water.right, y);
    things.push({ kind: 'hyacinth', x: shore + (left ? 10 : -10), y, variant: rand() });
  }
  let extras = 0;
  for (let y = 300; y < height - 120; y += 380) {
    while (nearStop(y) || nearBridge(y)) y += 30;
    const cx = xAt(line, y);
    things.push({ kind: extras % 2 === 0 ? 'ducks' : 'fishing-boat', x: cx + (extras % 2 === 0 ? -18 : 22), y, variant: rand() });
    extras++;
  }
  return things;
}

/** Big soft blotches of lighter and darker green across the land. */
function scatterPatches(height: number): Patch[] {
  const rand = seeded(11);
  const patches: Patch[] = [];
  for (let y = 20; y < height; y += 70) {
    for (let i = 0; i < 2; i++) {
      patches.push({ x: rand() * SCENE_WIDTH, y: y + rand() * 50, rx: 36 + rand() * 40, ry: 16 + rand() * 18, light: rand() < 0.55 });
    }
  }
  return patches;
}

/** Points on the land (never over the river) for fireflies at night. */
function scatterFireflies(sand: { left: Pt[]; right: Pt[] }, height: number): Pt[] {
  const rand = seeded(23);
  const flies: Pt[] = [];
  while (flies.length < 70) {
    const x = rand() * SCENE_WIDTH;
    const y = 20 + rand() * (height - 80);
    if (x > xAt(sand.left, y) - 6 && x < xAt(sand.right, y) + 6) continue;
    flies.push({ x, y });
  }
  return flies;
}

/** CSS position for a scene point, as percentages of the scene box. */
export function placeAt(p: Pt, height: number): CSSProperties {
  return { left: `${(p.x / SCENE_WIDTH) * 100}%`, top: `${(p.y / height) * 100}%` };
}
