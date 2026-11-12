import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { track } from '../../lib/track';
import { isBangla, learnerLang } from '../../lib/learnerLang';
import { signupSource } from '../../lib/source';
import { haptic } from '../../lib/haptics';
import { cleanName } from '../../lib/profile';
import { politeChoice, setPoliteChoice } from '../../lib/polite';
import { markIntroSeen, requestFirstLesson } from '../../lib/courseIntro';
import { useProgress } from '../../state/ProgressContext';
import { ClassStep } from './ClassStep';
import { DailyStep } from './DailyStep';
import { DistrictStep } from './DistrictStep';
import { DoneStep } from './DoneStep';
import { BangladeshMap } from './map/BangladeshMap';
import { NameStep } from './NameStep';
import { NavBar } from './NavBar';
import { TasteStep } from './TasteStep';
import { useSlotRect } from './useSlotRect';
import { WelcomeStep } from './WelcomeStep';
import { WhyStep } from './WhyStep';
import '../../styles/onboarding.css';
import '../../styles/onboardingSteps.css';

const ALL_STEPS = ['welcome', 'taste', 'why', 'district', 'name', 'class', 'daily', 'done'] as const;
type Step = (typeof ALL_STEPS)[number];
// Districts are Bangladesh's: learners in other languages skip that step (no map, no district league).
// The taste (words Bangla already borrowed) is for Bangla speakers too.
const STEPS: readonly Step[] = isBangla() ? ALL_STEPS : ALL_STEPS.filter((s) => s !== 'district' && s !== 'taste');

/**
 * First-run flow (docs/LEARNING_DESIGN.md: a win in the first minute, questions after): welcome (with the
 * language and course) → a 30-second taste → why → district (Bangla) → name → class → daily goal, reminder
 * time and আপনি → the first lesson opens at once.
 */
export default function Onboarding() {
  const { update } = useProgress();
  const [step, setStep] = useState<Step>('welcome');
  const [direction, setDirection] = useState(1);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [hour, setHour] = useState(21);
  const [polite, setPolite] = useState(politeChoice() === 'on');

  const rootRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const rect = useSlotRect(rootRef, slot);

  const index = STEPS.indexOf(step);
  // Anonymous count of who reaches each step (the admin's onboarding drop-off).
  useEffect(() => track('onboard', step), [step]);
  function go(next: Step) {
    haptic();
    setDirection(STEPS.indexOf(next) > index ? 1 : -1);
    setStep(next);
  }
  const next = () => go(STEPS[index + 1]);

  const save = useCallback(() => {
    if ((isBangla() && !districtId) || !classId) return;
    // Only a change is kept: untouched, adults still get আপনি by their class (lib/polite.ts).
    if (polite !== (politeChoice() === 'on')) setPoliteChoice(polite ? 'on' : 'off');
    markIntroSeen(learnerLang());
    requestFirstLesson();
    update((p) => ({
      ...p,
      dailyGoal,
      reminder: { ...p.reminder, hour },
      profile: {
        name: cleanName(name),
        districtId: districtId ?? '',
        classId,
        lang: learnerLang(),
        joinedAt: new Date().toISOString(),
        source: signupSource(),
        ...(goals.length ? { goals } : {}),
      },
    }));
  }, [update, name, districtId, classId, goals, dailyGoal, hour, polite]);

  const showNav = step !== 'welcome' && step !== 'done';

  return (
    <div ref={rootRef} className="ob" style={{ '--dir': direction } as CSSProperties}>
      <div className={`ob-aurora${step === 'welcome' ? '' : ' is-off'}`} aria-hidden="true" />
      {showNav && <NavBar step={index - 1} total={STEPS.length - 2} onBack={() => go(STEPS[index - 1])} />}

      {/* One map shared by the welcome and district screens, gliding between their slots (Bangla learners only). */}
      {isBangla() && (
        <div
          className={`ob-map-layer${slot && (step === 'welcome' || step === 'district') ? '' : ' is-hidden'}`}
          style={rect ? { transform: `translate(${rect.left}px, ${rect.top}px)`, width: rect.width, height: rect.height } : undefined}
        >
          <BangladeshMap mode={step === 'welcome' ? 'intro' : 'pick'} selectedId={step === 'welcome' ? null : districtId} onSelect={setDistrictId} />
        </div>
      )}

      {step === 'welcome' && <WelcomeStep mapSlot={setSlot} onNext={next} />}
      {step === 'taste' && <TasteStep onNext={next} />}
      {step === 'why' && <WhyStep goals={goals} onChange={setGoals} onNext={next} />}
      {step === 'district' && <DistrictStep mapSlot={setSlot} districtId={districtId} onPick={setDistrictId} onNext={next} />}
      {step === 'name' && <NameStep name={name} districtId={districtId} onChange={setName} onNext={next} />}
      {step === 'class' && <ClassStep name={name} districtId={districtId} classId={classId} onChange={setClassId} onNext={next} />}
      {step === 'daily' && (
        <DailyStep goal={dailyGoal} hour={hour} polite={polite} onGoal={setDailyGoal} onHour={setHour} onPolite={setPolite} onNext={next} />
      )}
      {step === 'done' && <DoneStep name={cleanName(name)} onDone={save} />}
    </div>
  );
}
