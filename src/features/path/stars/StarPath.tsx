import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Glyph } from '../../../components/Glyph';
import { COURSE } from '../../../data/course';
import { toBanglaDigits } from '../../../lib/bangla';
import { useProgress } from '../../../state/ProgressContext';
import type { Unit } from '../../../types';
import { Guidebook } from '../Guidebook';
import type { StopState } from '../StopPopover';
import { ConstellationSign } from './ConstellationSign';
import { StarLines } from './StarLines';
import { SKY_WIDTH, placeInSky, skyLayout } from './starLayout';
import { StarStop } from './StarStop';

/**
 * The learning path as a night sky (তারার পথ): each unit is a constellation,
 * each lesson a star that lights up when it's finished.
 */
export function StarPath({ onStart }: { onStart: (lessonId: string) => void }) {
  const { progress } = useProgress();
  const sky = useMemo(() => skyLayout(COURSE), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [guide, setGuide] = useState<Unit | null>(null);

  const done = (lessonId: string) => !!progress.completed[lessonId];
  const current = sky.stars.findIndex((s) => !done(s.lesson.id));
  const stateOf = (index: number, lessonId: string): StopState => (done(lessonId) ? 'done' : index === current ? 'current' : 'locked');

  // Tapping anywhere outside a star closes its card.
  useEffect(() => {
    if (!openId) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.star')) setOpenId(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openId]);

  return (
    <div className="sky" style={{ aspectRatio: `${SKY_WIDTH} / ${sky.height}` } as CSSProperties}>
      <StarLines sky={sky} done={done} current={current} />
      <span className="sky-shooting" aria-hidden="true" />
      <span className="sky-shooting is-late" aria-hidden="true" />

      <p className="sky-summary" lang="bn">
        <Glyph name="star" size={14} />
        {toBanglaDigits(sky.stars.filter((s) => done(s.lesson.id)).length)}/{toBanglaDigits(sky.stars.length)} তারা জ্বলেছে
      </p>

      {sky.constellations.map((c) => (
        <ConstellationSign
          key={c.unit.id}
          unit={c.unit}
          unitIndex={c.unitIndex}
          style={placeInSky(c.sign, sky.height)}
          done={done}
          onGuide={() => setGuide(c.unit)}
        />
      ))}

      {sky.stars.map((star) => (
        <StarStop
          key={star.lesson.id}
          star={star}
          state={stateOf(star.index, star.lesson.id)}
          style={placeInSky(star, sky.height)}
          open={openId === star.lesson.id}
          onToggle={() => setOpenId(openId === star.lesson.id ? null : star.lesson.id)}
          onStart={() => onStart(star.lesson.id)}
        />
      ))}

      <p className="sky-end" style={{ top: `${((sky.height - 130) / sky.height) * 100}%` }} lang="bn">
        আরও ইউনিট আসছে
      </p>

      {guide && <Guidebook unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}
