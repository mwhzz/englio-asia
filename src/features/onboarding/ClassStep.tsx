import type { CSSProperties } from 'react';
import { STAGES, findClassLevel } from '../../data/classLevels';
import { haptic } from '../../lib/haptics';
import { LearnerCard } from '../../components/card/LearnerCard';
import { ClassDial } from './dial/ClassDial';
import { OtherLevels } from './dial/OtherLevels';
import { ObButton } from './ObButton';

interface Props {
  name: string;
  districtId: string | null;
  classId: string | null;
  onChange: (id: string) => void;
  onNext: () => void;
}

export function ClassStep({ name, districtId, classId, onChange, onNext }: Props) {
  const level = findClassLevel(classId);
  const stage = level ? STAGES[level.stage] : null;
  const pick = (id: string) => {
    haptic();
    onChange(id);
  };

  return (
    <div className="ob-screen ob-scroll ob-class-step">
      <header className="ob-head ob-rise">
        <h1 className="ob-title" lang="bn">
          তুমি কোন শ্রেণিতে পড়ো?
        </h1>
        <p className="ob-sub">Turn the dial to your class.</p>
      </header>

      <div className="ob-rise ob-card-compact" style={{ '--i': 1 } as CSSProperties}>
        <LearnerCard name={name} districtId={districtId} level={level} />
      </div>

      <div className="ob-rise" style={{ '--i': 2 } as CSSProperties}>
        <ClassDial level={level} onPick={pick} />
      </div>

      <div className="ob-rise" style={{ '--i': 3 } as CSSProperties}>
        <OtherLevels selectedId={classId} onPick={pick} />
        {stage && (
          <p className="ob-focus" key={stage.id} lang="bn">
            <span className="ob-focus-dot" style={{ background: `linear-gradient(145deg, ${stage.colors[0]}, ${stage.colors[1]})` }} />
            {stage.focus}
          </p>
        )}
      </div>

      <div className="ob-grow" />

      <div className="ob-rise ob-sticky-cta" style={{ '--i': 4 } as CSSProperties}>
        <ObButton disabled={!level} onClick={onNext}>
          <span lang="bn">শুরু করো</span>
        </ObButton>
      </div>
    </div>
  );
}
