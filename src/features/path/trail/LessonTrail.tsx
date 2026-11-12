import { useEffect, useState } from 'react';
import { COURSE } from '../../../data/course';
import { useProgress } from '../../../state/ProgressContext';
import type { Unit } from '../../../types';
import { Guidebook } from '../Guidebook';
import type { StopState } from '../StopPopover';
import { TrailUnit } from './TrailUnit';
import { UnitRow } from './UnitRow';
import { Fragment } from 'react';
import { sectionsOf } from '../../../data/sections';
import { learnerLang } from '../../../lib/learnerLang';
import { sectionTestId } from '../../../lib/sectionTest';
import { SectionCheckpoint } from './SectionCheckpoint';
import { SectionHeader } from './SectionHeader';
import { takeJustDone } from '../../../lib/justDone';

/** Units past the current one that stay open; the rest fold into rows. */
const OPEN_AHEAD = 1;

/** The learning path on the plain page: one card per unit, its lessons on a soft curve. */
export function LessonTrail({ onStart, onTest }: { onStart: (lessonId: string) => void; onTest: (unitId: string) => void }) {
  const { progress } = useProgress();
  // COURSE depends on the learner's level, so it's read on each render (it's small).
  const ALL = COURSE.flatMap((u) => u.lessons);
  // Where each unit's first lesson sits in the path (for the entry stagger).
  const FIRST = COURSE.map((_, u) => COURSE.slice(0, u).reduce((n, unit) => n + unit.lessons.length, 0));
  const [openId, setOpenId] = useState<string | null>(null);
  const [guide, setGuide] = useState<Unit | null>(null);
  const [unfolded, setUnfolded] = useState<string[]>([]);
  // The lesson just finished pops as it turns done (once, coming back from it).
  const [justDone] = useState(takeJustDone);

  const currentId = ALL.find((l) => !progress.completed[l.id])?.id;
  const stateOf = (lessonId: string): StopState =>
    progress.completed[lessonId] ? 'done' : lessonId === currentId ? 'current' : 'locked';
  // The path in sections (data/sections.ts): a heading before each, a checkpoint test after.
  const sections = sectionsOf(learnerLang(), COURSE.length);
  const sectionAt = (unitIndex: number) => sections.findIndex((x) => x.from <= unitIndex && unitIndex <= x.to);
  const lessonsOf = (i: number) => COURSE.slice(sections[i].from, sections[i].to + 1).flatMap((u) => u.lessons);
  const currentUnit = currentId ? COURSE.findIndex((u) => u.lessons.some((l) => l.id === currentId)) : COURSE.length;

  // Tapping anywhere outside a lesson closes its card.
  useEffect(() => {
    if (!openId) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.tstop')) setOpenId(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openId]);

  return (
    <div className="trail">
      {COURSE.map((unit, unitIndex) => {
        const si = sectionAt(unitIndex);
        const section = sections[si];
        const lessons = si >= 0 ? lessonsOf(si) : [];
        const done = lessons.filter((l) => progress.completed[l.id]).length;
        return (
          <Fragment key={unit.id}>
            {section && section.from === unitIndex && sections.length > 1 && <SectionHeader section={section} number={si + 1} done={done} total={lessons.length} />}
            {unitIndex > currentUnit + OPEN_AHEAD && !unfolded.includes(unit.id) ? (
          <UnitRow unit={unit} unitIndex={unitIndex} onOpen={() => setUnfolded([...unfolded, unit.id])} />
        ) : (
          <TrailUnit
            unit={unit}
            unitIndex={unitIndex}
            firstIndex={FIRST[unitIndex]}
            stateOf={stateOf}
            justDone={justDone}
            openId={openId}
            onToggle={(id) => setOpenId(openId === id ? null : id)}
            onStart={onStart}
            onGuide={() => setGuide(unit)}
            onTest={() => onTest(unit.id)}
          />
            )}
            {section && section.to === unitIndex && sections.length > 1 && (
              <SectionCheckpoint
                number={si + 1}
                ready={done === lessons.length}
                passed={progress.unitTests?.[sectionTestId(section)]?.score}
                onStart={() => onTest(sectionTestId(section))}
              />
            )}
          </Fragment>
        );
      })}

      <p className="trail-end" lang="bn">
        আরও ইউনিট আসছে
      </p>

      {guide && <Guidebook unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}
