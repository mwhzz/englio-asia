import type { StopState } from '../StopPopover';
import { curveBetween, type TrailPoint } from './trailLayout';

/** The line that joins a unit's stops: solid where finished, dotted ahead. */
export function TrailLine({ points, states, height }: { points: TrailPoint[]; states: StopState[]; height: number }) {
  return (
    <svg className="trail-line" viewBox={`-90 0 180 ${height}`} width="180" height={height} aria-hidden="true">
      {points.slice(1).map((to, i) => (
        <path key={i} d={curveBetween(points[i], to)} className={`trail-seg is-${states[i + 1]}`} />
      ))}
    </svg>
  );
}
