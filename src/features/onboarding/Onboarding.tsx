import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { haptic } from '../../lib/haptics';
import { cleanName } from '../../lib/profile';
import { useProgress } from '../../state/ProgressContext';
import { ClassStep } from './ClassStep';
import { DistrictStep } from './DistrictStep';
import { DoneStep } from './DoneStep';
import { BangladeshMap } from './map/BangladeshMap';
import { NameStep } from './NameStep';
import { NavBar } from './NavBar';
import { useSlotRect } from './useSlotRect';
import { WelcomeStep } from './WelcomeStep';
import '../../styles/onboarding.css';

const STEPS = ['welcome', 'district', 'name', 'class', 'done'] as const;
type Step = (typeof STEPS)[number];

/** First-run flow: welcome → district → name → class → dashboard. */
export default function Onboarding() {
  const { update } = useProgress();
  const [step, setStep] = useState<Step>('welcome');
  const [direction, setDirection] = useState(1);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const rect = useSlotRect(rootRef, slot);

  const index = STEPS.indexOf(step);
  function go(next: Step) {
    haptic();
    setDirection(STEPS.indexOf(next) > index ? 1 : -1);
    setStep(next);
  }

  const save = useCallback(() => {
    if (!districtId || !classId) return;
    update((p) => ({
      ...p,
      profile: { name: cleanName(name), districtId, classId, joinedAt: new Date().toISOString() },
    }));
  }, [update, name, districtId, classId]);

  const showNav = step === 'district' || step === 'name' || step === 'class';

  return (
    <div ref={rootRef} className="ob" style={{ '--dir': direction } as CSSProperties}>
      <div className={`ob-aurora${step === 'welcome' ? '' : ' is-off'}`} aria-hidden="true" />
      {showNav && <NavBar step={index - 1} total={3} onBack={() => go(STEPS[index - 1])} />}

      {/* One map shared by the welcome and district screens, gliding between their slots. */}
      <div
        className={`ob-map-layer${slot ? '' : ' is-hidden'}`}
        style={rect ? { transform: `translate(${rect.left}px, ${rect.top}px)`, width: rect.width, height: rect.height } : undefined}
      >
        <BangladeshMap mode={step === 'welcome' ? 'intro' : 'pick'} selectedId={step === 'welcome' ? null : districtId} onSelect={setDistrictId} />
      </div>

      {step === 'welcome' && <WelcomeStep mapSlot={setSlot} onNext={() => go('district')} />}
      {step === 'district' && (
        <DistrictStep mapSlot={setSlot} districtId={districtId} onPick={setDistrictId} onNext={() => go('name')} />
      )}
      {step === 'name' && <NameStep name={name} districtId={districtId} onChange={setName} onNext={() => go('class')} />}
      {step === 'class' && (
        <ClassStep name={name} districtId={districtId} classId={classId} onChange={setClassId} onNext={() => go('done')} />
      )}
      {step === 'done' && <DoneStep name={cleanName(name)} onDone={save} />}
    </div>
  );
}
