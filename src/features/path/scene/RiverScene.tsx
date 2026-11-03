import { SCENE_WIDTH, type Scene } from '../riverLayout';
import { Birds } from './Birds';
import { Bridge } from './Bridge';
import { Dock } from './Dock';
import { LandItems } from './LandItems';
import { Landmark } from './Landmarks';
import { WaterThings } from './WaterThings';

/** The illustrated landscape: green banks, a winding river, jetties, bridges, landmarks and life. */
export function RiverScene({ scene }: { scene: Scene }) {
  return (
    <svg className="sc" viewBox={`0 0 ${SCENE_WIDTH} ${scene.height}`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id="sc-land" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="sc-land-a" />
          <stop offset="0.5" className="sc-land-b" />
          <stop offset="1" className="sc-land-a" />
        </linearGradient>
        <pattern id="sc-grass" width="22" height="18" patternUnits="userSpaceOnUse">
          <path d="M4 12l1.4-4 1.4 4M14 5l1.2-3.4 1.2 3.4" className="sc-tuft" />
        </pattern>
      </defs>

      {/* Land */}
      <rect width={SCENE_WIDTH} height={scene.height} fill="url(#sc-land)" />
      {scene.patches.map((p, i) => (
        <ellipse key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} rx={p.rx.toFixed(1)} ry={p.ry.toFixed(1)} className={p.light ? 'sc-patch-light' : 'sc-patch-dark'} />
      ))}
      <rect width={SCENE_WIDTH} height={scene.height} fill="url(#sc-grass)" />

      {/* River */}
      <path d={scene.sand} className="sc-sand" />
      <path d={scene.water} className="sc-water" />
      <path d={scene.center} className="sc-deep" />
      <path d={scene.center} className="sc-current" />
      <path d={scene.shoreLeft} className="sc-foam" />
      <path d={scene.shoreRight} className="sc-foam" />
      <WaterThings things={scene.waterThings} />

      {/* Built and grown things */}
      <LandItems items={scene.items} />
      {scene.stops.map((s) => (
        <Dock key={s.lesson.id} stop={s} />
      ))}
      {scene.marks.map((m) => (
        <Bridge key={m.unit.id} mark={m} />
      ))}
      {scene.marks.map((m) => (
        <Landmark key={m.unit.id} mark={m} />
      ))}
      <Birds flocks={scene.birds} />
      <g className="sc-fireflies">
        {scene.fireflies.map((f, i) => (
          <circle key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r="1.3" style={{ animationDelay: `${(i * 0.37) % 4}s` }} />
        ))}
      </g>
    </svg>
  );
}
