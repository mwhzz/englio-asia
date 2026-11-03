import { useRef, type CSSProperties } from 'react';
import { placeAt, type Scene } from './riverLayout';
import { useInView } from './useInView';
import { useShipIndex } from './useShipIndex';

/** Where the ship waits for a lesson (or at the river mouth when everything is done). */
function shipSpot(scene: Scene, index: number) {
  return scene.stops[index]?.ship ?? scene.mouth;
}

/**
 * A Bangladeshi river launch (লঞ্চ) that waits beside the current jetty
 * and sails across the river to the next one as lessons are finished.
 */
export function Ship({ scene, index }: { scene: Scene; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShipIndex(index, useInView(ref));
  const here = shipSpot(scene, shown);
  const next = shipSpot(scene, shown + 1);
  // Face the way it will sail next.
  const facing = next.x < here.x ? -1 : 1;

  return (
    <div ref={ref} className="ship" style={{ ...placeAt(here, scene.height), '--face': facing } as CSSProperties} aria-hidden="true">
      <div className="ship-body">
        <span className="ship-smoke" />
        <span className="ship-smoke" />
        <span className="ship-smoke" />
        <svg viewBox="0 0 84 52" className="ship-svg">
          {/* wake */}
          <ellipse cx="42" cy="45" rx="40" ry="4" className="ship-wake" />
          {/* hull */}
          <path d="M3 32H81L74 43Q72 46 67 46H17Q12 46 10 43Z" className="ship-hull" />
          <path d="M5 32H79L77.4 35H6.6Z" className="ship-stripe" />
          {/* lower deck */}
          <rect x="11" y="21" width="62" height="11" rx="2" className="ship-deck" />
          {[15, 23, 31, 39, 47, 55, 63].map((x) => (
            <rect key={x} x={x} y="24" width="5" height="4.5" rx="1" className="ship-window" />
          ))}
          {/* upper deck and wheelhouse */}
          <rect x="21" y="12" width="40" height="9" rx="2" className="ship-deck-upper" />
          {[25, 32, 39, 46].map((x) => (
            <rect key={x} x={x} y="14.5" width="4.5" height="4" rx="1" className="ship-window" />
          ))}
          <rect x="52" y="5" width="11" height="8" rx="1.6" className="ship-deck" />
          <rect x="54.5" y="7" width="6" height="3.6" rx="0.8" className="ship-window" />
          {/* chimney */}
          <rect x="30" y="3" width="7" height="9" rx="1" className="ship-chimney" />
          <rect x="30" y="3" width="7" height="2.5" className="ship-chimney-top" />
          {/* Bangladesh flag at the stern */}
          <path d="M15 21V6" className="ship-flagpole" />
          <rect x="15" y="6" width="10" height="6.5" className="ship-flag" />
          <circle cx="19.5" cy="9.25" r="2" className="ship-flag-sun" />
        </svg>
      </div>
    </div>
  );
}
