import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { COURSE } from '../../data/course';
import { useProgress } from '../../state/ProgressContext';
import type { Unit } from '../../types';
import { Guidebook } from './Guidebook';
import { SCENE_WIDTH, placeAt, sceneLayout } from './riverLayout';
import { RiverStop, type StopState } from './RiverStop';
import { RiverScene } from './scene/RiverScene';
import { Ship } from './Ship';
import { UnitSign } from './UnitSign';

/**
 * The learning path as a river journey: green banks on both sides, a winding
 * river in the middle, a jetty per lesson, a bridge per unit, and a launch
 * that carries the learner from lesson to lesson.
 */
export function RiverPath({ onStart }: { onStart: (lessonId: string) => void }) {
  const { progress } = useProgress();
  const scene = useMemo(() => sceneLayout(COURSE), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [guide, setGuide] = useState<Unit | null>(null);

  const firstOpen = scene.stops.findIndex((s) => !progress.completed[s.lesson.id]);
  const shipAt = firstOpen === -1 ? scene.stops.length : firstOpen;

  // Tapping anywhere outside a stop closes its card.
  useEffect(() => {
    if (!openId) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.rstop')) setOpenId(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openId]);

  const stateOf = (index: number, lessonId: string): StopState =>
    progress.completed[lessonId] ? 'done' : index === firstOpen ? 'current' : 'locked';

  return (
    <div className="river" style={{ aspectRatio: `${SCENE_WIDTH} / ${scene.height}` } as CSSProperties}>
      <RiverScene scene={scene} />

      {scene.marks.map((mark) => (
        <UnitSign
          key={mark.unit.id}
          mark={mark}
          style={placeAt(mark.sign, scene.height)}
          done={mark.unit.lessons.filter((l) => progress.completed[l.id]).length}
          onGuide={() => setGuide(mark.unit)}
        />
      ))}

      <Ship scene={scene} index={shipAt} />

      {scene.stops.map((stop) => (
        <RiverStop
          key={stop.lesson.id}
          stop={stop}
          state={stateOf(stop.index, stop.lesson.id)}
          style={placeAt(stop, scene.height)}
          open={openId === stop.lesson.id}
          onToggle={() => setOpenId(openId === stop.lesson.id ? null : stop.lesson.id)}
          onStart={() => onStart(stop.lesson.id)}
        />
      ))}

      <p className="river-mouth" style={placeAt(scene.mouth, scene.height)} lang="bn">
        আরও ইউনিট আসছে
      </p>

      {guide && <Guidebook unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}
