import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { findDistrict } from '../../../data/districts';
import { haptic } from '../../../lib/haptics';
import { COUNTRY_PATH, DISTRICT_SHAPES, MAP_HEIGHT, MAP_WIDTH } from './districtShapes';
import { DIVISION_COLORS } from './divisionColors';
import { labelFor } from './labels';
import { MapBubbles } from './MapBubbles';
import { MapControls } from './MapControls';
import { MapLights } from './MapLights';
import { useMapGestures } from './useMapGestures';
import { HOME, focusOn, zoomAt, type View } from './zoom';

// Copies of the outline stacked under the map give it thickness.
const DEPTH_LAYERS = [3, 6, 9, 12, 15];
const HINT = DISTRICT_SHAPES.find((s) => s.id === 'dhaka')!;

interface Props {
  /** "intro" draws the map in and floats it; "pick" lets the learner pan, zoom and tap a district. */
  mode: 'intro' | 'pick';
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Bangladesh with all 64 districts, tilted like a 3D slab and tinted by division. */
export function BangladeshMap({ mode, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>(HOME);
  const [ready, setReady] = useState(false);
  const picking = mode === 'pick';
  const selected = DISTRICT_SHAPES.find((s) => s.id === selectedId) ?? null;

  // Start flat, then tilt into 3D on the next frame so the change animates.
  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Glide to the chosen district, whether it was tapped or found by search.
  useEffect(() => {
    if (picking && selected) setView((v) => focusOn(selected, v.scale));
    if (!picking) setView(HOME);
  }, [picking, selected]);

  const gestures = useMapGestures(svgRef, picking, setView, (id) => {
    haptic();
    onSelect(id);
  });

  const districts = useMemo(
    () =>
      DISTRICT_SHAPES.map((shape) => {
        const district = findDistrict(shape.id);
        const name = district?.bn ?? shape.id;
        return {
          shape,
          name,
          color: district ? DIVISION_COLORS[district.division] : '#8e8e93',
          label: labelFor(shape, name),
        };
      }),
    [],
  );
  const selectedInfo = districts.find((d) => d.shape.id === selectedId);

  const zoomBy = (factor: number) => setView((v) => zoomAt(v, factor, MAP_WIDTH / 2, MAP_HEIGHT / 2));

  return (
    <div className={`bdmap bdmap-${mode}${selected ? ' has-selection' : ''}${ready ? ' is-ready' : ''}`}>
      <div className="bdmap-clip">
        <div className="bdmap-tilt">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className={`bdmap-svg${gestures.active ? ' is-gesturing' : ''}`}
            role="img"
            aria-label="Map of Bangladesh with 64 districts"
            {...gestures.handlers}
          >
            <defs>
              <path id="bd-country" d={COUNTRY_PATH} />
              <linearGradient id="bd-light" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={MAP_WIDTH} y2={MAP_HEIGHT}>
                <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
                <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.12" />
              </linearGradient>
              <filter id="bd-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
            </defs>

            <g className="bdmap-zoom" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` } as CSSProperties}>
              <g className="bdmap-depth">
                <use href="#bd-country" y={34} className="bdmap-shadow" filter="url(#bd-blur)" />
                {DEPTH_LAYERS.map((dy) => (
                  <use key={dy} href="#bd-country" y={dy} className="bdmap-side" />
                ))}
              </g>

              <g className="bdmap-land">
                {districts.map(({ shape, color }) => (
                  <path
                    key={shape.id}
                    d={shape.d}
                    data-id={shape.id}
                    pathLength={1}
                    style={{ '--div': color, '--d': `${(shape.cy / MAP_HEIGHT) * 0.9}s` } as CSSProperties}
                  />
                ))}
              </g>

              {/* Soft top-left light across the whole slab. */}
              <use href="#bd-country" className="bdmap-light" fill="url(#bd-light)" />

              {picking ? (
                <g className="bdmap-labels" aria-hidden="true">
                  {districts.map(({ shape, name, label }) =>
                    shape.id === selectedId ? null : (
                      <text key={shape.id} x={label.x} y={label.y} fontSize={label.size} lang="bn">
                        {name}
                      </text>
                    ),
                  )}
                </g>
              ) : (
                <>
                  <MapLights />
                  <MapBubbles />
                </>
              )}

              {picking && !selected && (
                // "Tap here" ripple until the learner picks something.
                <g className="bdmap-ripple bdmap-hint" transform={`translate(${HINT.cx} ${HINT.cy})`} aria-hidden="true">
                  <circle r="10" />
                  <circle r="10" />
                </g>
              )}

              {selected && selectedInfo && (
                // The chosen district rises out of the map.
                <g className="bdmap-lift" key={selected.id} aria-hidden="true">
                  <path d={selected.d} className="bdmap-lift-side" transform="translate(0 7)" />
                  <path d={selected.d} className="bdmap-lift-top" />
                  <g className="bdmap-ripple" transform={`translate(${selectedInfo.label.x} ${selectedInfo.label.y})`}>
                    <circle r="12" />
                    <circle r="12" />
                  </g>
                  <text x={selectedInfo.label.x} y={selectedInfo.label.y} fontSize={Math.max(11, selectedInfo.label.size + 2)} lang="bn">
                    {selectedInfo.name}
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {picking && (
        <MapControls
          canZoomOut={view.scale > 1.01}
          onZoomIn={() => zoomBy(1.6)}
          onZoomOut={() => zoomBy(1 / 1.6)}
          onReset={() => setView(HOME)}
        />
      )}
    </div>
  );
}
