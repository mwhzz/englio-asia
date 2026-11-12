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

type Step = 'welcome' | 'taste' | 'why' | 'name' | 'daily' | 'district' | 'class' | 'done';

/**
 * The first run in two parts, so the first lesson comes quickly (docs/LEARNING_DESIGN.md: a win first,
 * questions after). Start: welcome → a 30-second taste → why → name → daily goal, reminder time and আপনি →
 * the first lesson. Finish (after that lesson, on Home): district (Bangla) → class → Home.
 */
function stepsOf(phase: 'start' | 'finish'): readonly Step[] {
  const all: Step[] = phase === 'start' ? ['welcome', 'taste', 'why', 'name', 'daily', 'done'] : ['district', 'class', 'done'];
  // Districts are Bangladesh's, and the taste is words Bangla borrowed: both for Bangla speakers.
  return isBangla() ? all : all.filter((s) => s !== 'district' && s !== 'taste');
}

export default function Onboarding({ phase = 'start' }: { phase?: 'start' | 'finish' }) {
  const STEPS = stepsOf(phase);
  const { progress, update } = useProgress();
  const [step, setStep] = useState<Step>(STEPS[0]);
  const [direction, setDirection] = useState(1);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [name, setName] = useState(progress.profile?.name ?? '');
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
    if (phase === 'finish') {
      if ((isBangla() && !districtId) || !classId) return;
      update((p) => (p.profile ? { ...p, profile: { ...p.profile, districtId: districtId ?? '', classId, setupLater: false } } : p));
      return;
    }
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
        districtId: '',
        classId: '',
        // District and class are asked after the first lesson.
        setupLater: true,
        lang: learnerLang(),
        joinedAt: new Date().toISOString(),
        source: signupSource(),
        ...(goals.length ? { goals } : {}),
      },
    }));
  }, [phase, update, name, districtId, classId, goals, dailyGoal, hour, polite]);

  const showNav = step !== 'welcome' && step !== 'done' && index > 0;
  const mapOn = step === 'welcome' || step === 'district';

  return (
    <div ref={rootRef} className="ob" style={{ '--dir': direction } as CSSProperties}>
      <div className={`ob-aurora${step === 'welcome' ? '' : ' is-off'}`} aria-hidden="true" />
      {showNav && <NavBar step={phase === 'start' ? index - 1 : index} total={STEPS.length - (phase === 'start' ? 2 : 1)} onBack={() => go(STEPS[index - 1])} />}

      {/* One map shared by the welcome and district screens, gliding between their slots (Bangla learners only). */}
      {isBangla() && (
        <div
          className={`ob-map-layer${slot && mapOn ? '' : ' is-hidden'}`}
          style={rect ? { transform: `translate(${rect.left}px, ${rect.top}px)`, width: rect.width, height: rect.height } : undefined}
        >
          <BangladeshMap mode={step === 'welcome' ? 'intro' : 'pick'} selectedId={step === 'welcome' ? null : districtId} onSelect={setDistrictId} />
        </div>
      )}

      {step === 'welcome' && <WelcomeStep mapSlot={setSlot} onNext={next} />}
      {step === 'taste' && <TasteStep onNext={next} />}
      {step === 'why' && <WhyStep goals={goals} onChange={setGoals} onNext={next} />}
      {step === 'name' && <NameStep name={name} districtId={districtId} onChange={setName} onNext={next} />}
      {step === 'daily' && (
        <DailyStep goal={dailyGoal} hour={hour} polite={polite} onGoal={setDailyGoal} onHour={setHour} onPolite={setPolite} onNext={next} />
      )}
      {step === 'district' && <DistrictStep mapSlot={setSlot} districtId={districtId} onPick={setDistrictId} onNext={next} />}
      {step === 'class' && <ClassStep name={name} districtId={districtId} classId={classId} onChange={setClassId} onNext={next} />}
      {step === 'done' && (
        <DoneStep
          name={cleanName(name)}
          text={phase === 'start' ? 'এবার প্রথম লেসন।' : isBangla() ? 'জেলা লিগে তোমার নাম উঠল।' : 'চলো শিখি।'}
          onDone={save}
        />
      )}
    </div>
  );
}
