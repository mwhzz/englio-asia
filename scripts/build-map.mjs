// Converts a district GeoJSON into a TS module of SVG paths.
// usage: node scripts/build-map.mjs <districts.geojson> <outline.geojson> src/features/onboarding/map/districtShapes.ts
// Inputs: geoBoundaries BGD ADM2 simplified GeoJSON, run through mapshaper:
//   mapshaper in.geojson -simplify 4% keep-shapes planar -filter-islands min-area=15km2 -o districts.geojson precision=0.0001
//   mapshaper districts.geojson -dissolve -filter-islands min-area=40km2 -o outline.geojson precision=0.0001
import { readFileSync, writeFileSync } from 'node:fs';

const [input, outlineInput, output] = process.argv.slice(2);
const geo = JSON.parse(readFileSync(input, 'utf8'));
const outline = JSON.parse(readFileSync(outlineInput, 'utf8'));

// geoBoundaries names -> app ids (modern official spellings)
const RENAME = {
  Barisal: 'barishal',
  Bogra: 'bogura',
  Brahamanbaria: 'brahmanbaria',
  Chittagong: 'chattogram',
  Comilla: 'cumilla',
  "Cox's Bazar": 'coxs-bazar',
  Jessore: 'jashore',
  Maulvibazar: 'moulvibazar',
  Nawabganj: 'chapai-nawabganj',
  Netrakona: 'netrokona',
};
const idOf = (name) => RENAME[name] ?? name.toLowerCase().replace(/[^a-z]+/g, '-');

let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const f of geo.features)
  for (const poly of f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
    for (const [lon, lat] of poly[0]) {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    }

const HEIGHT = 1000;
const PAD = 10;
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const scale = (HEIGHT - 2 * PAD) / (maxLat - minLat);
const WIDTH = Math.ceil((maxLon - minLon) * kx * scale + 2 * PAD);
const project = ([lon, lat]) => [Math.round((lon - minLon) * kx * scale + PAD), Math.round((maxLat - lat) * scale + PAD)];

function ringArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function ringCentroid(pts) {
  let cx = 0, cy = 0, a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    const c = x1 * y2 - x2 * y1;
    a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c;
  }
  return [Math.round(cx / (3 * a)), Math.round(cy / (3 * a))];
}

function toPath(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let d = '';
  let biggest = null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = [];
      for (const p of ring.map(project)) {
        const last = pts[pts.length - 1];
        if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p);
      }
      if (pts.length > 1 && pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1]) pts.pop();
      if (pts.length < 3) continue;
      d += `M${pts.map((p) => p.join(',')).join(' ')}Z`;
      for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const area = Math.abs(ringArea(pts));
      if (!biggest || area > biggest.area) biggest = { area, pts };
    }
  }
  return { d, biggest, box: [x0, y0, x1 - x0, y1 - y0] };
}

const shapes = geo.features.map((f) => {
  const { d, biggest, box } = toPath(f.geometry);
  const [cx, cy] = ringCentroid(biggest.pts);
  return { id: idOf(f.properties.shapeName), cx, cy, box, d };
});

const country = outline.geometries.map((g) => toPath(g).d).join('');

shapes.sort((a, b) => a.id.localeCompare(b.id));
const body = shapes
  .map((s) => `  { id: '${s.id}', cx: ${s.cx}, cy: ${s.cy}, box: [${s.box.join(', ')}], d: '${s.d}' },`)
  .join('\n');

writeFileSync(
  output,
  `// GENERATED from geoBoundaries BGD ADM2 (BBS, OCHA ROAP; CC BY 3.0 IGO), simplified with mapshaper.
// Do not edit by hand.

export const MAP_WIDTH = ${WIDTH};
export const MAP_HEIGHT = ${HEIGHT};

export interface DistrictShape {
  id: string;
  /** Label point (centroid of the largest island). */
  cx: number;
  cy: number;
  /** Bounding box: x, y, width, height. */
  box: [number, number, number, number];
  d: string;
}

export const DISTRICT_SHAPES: DistrictShape[] = [
${body}
];

/** The whole country as one outline (used for the 3D slab and shadow). */
export const COUNTRY_PATH =
  '${country}';
`,
);
console.log(`${shapes.length} districts, ${WIDTH}x${HEIGHT}, ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB`);
