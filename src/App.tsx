import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { setPolite, wantsPolite } from './lib/polite';
import { ErrorBoundary } from './components/ErrorBoundary';
import { findClassLevel } from './data/classLevels';
import { ALL_LESSONS, applyLevel, COURSE } from './data/course';
import type { Unit } from './types';
import { PlusReturn } from './features/premium/PlusReturn';
import { HomeView } from './features/home/HomeView';
import { TabBar, type Tab } from './features/layout/TabBar';
import { LessonRunner } from './features/lesson/LessonRunner';
import { useProgress } from './state/ProgressContext';
import { useBackButton } from './lib/backButton';
import { lessonLocked, unitLocked } from './lib/appSettings';
import { LockedUnitSheet } from './features/premium/LockedUnitSheet';
import { introSeen, markIntroSeen, takeFirstLessonRequest } from './lib/courseIntro';
import { learnerLang } from './lib/learnerLang';
import { nextLesson } from './features/home/nextLesson';

// Only first-time users need onboarding (and its map), so it loads on demand; so does the profile and its card.
const Onboarding = lazy(() => import('./features/onboarding/Onboarding'));
const ProfileView = lazy(() => import('./features/profile/ProfileView'));
const SpeakListenView = lazy(() => import('./features/speaking/SpeakListenView'));
const GrammarView = lazy(() => import('./features/grammar/GrammarView'));
const UnitTestRunner = lazy(() => import('./features/unittest/UnitTestRunner').then((m) => ({ default: m.UnitTestRunner })));
const CourseIntro = lazy(() => import('./features/courseIntro/CourseIntro').then((m) => ({ default: m.CourseIntro })));
const PlacementTest = lazy(() => import('./features/placement/PlacementTest').then((m) => ({ default: m.PlacementTest })));

type Screen =
  | { name: Tab }
  | { name: 'lesson'; lessonId: string }
  | { name: 'practice' }
  | { name: 'review' }
  | { name: 'listening' }
  | { name: 'speaking' }
  | { name: 'placement' }
  | { name: 'test'; unitId: string };

export default function App() {
  const { progress } = useProgress();
  // The path shows the units made for the learner's level (chosen in onboarding, changeable in settings).
  const stage = findClassLevel(progress.profile?.classId)?.stage;
  applyLevel(stage);
  // Adults (job / other) are spoken to as আপনি, unless they chose otherwise in Profile.
  useEffect(() => setPolite(wantsPolite(stage)), [stage]);
  const [screen, setScreen] = useState<Screen>({ name: 'learn' });
  // A lesson or test of a Plus-only unit opens this sheet instead (see the admin's Settings).
  const [lockedUnit, setLockedUnit] = useState<Unit | null>(null);
  const unitOfLesson = (lessonId: string) => ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.unit;
  const home = () => setScreen({ name: 'learn' });
  const practice = () => setScreen({ name: 'practice' });
  // A course started for the first time here gets its short intro (features/courseIntro); someone who's
  // already learning it never sees it.
  const [introDone, setIntroDone] = useState(false);
  const startedHere = ALL_LESSONS.some((x) => progress.completed[x.lesson.id]);
  const needsIntro = !!progress.profile && !introDone && !startedHere && !introSeen(learnerLang());
  useEffect(() => {
    if (startedHere && !introSeen(learnerLang())) markIntroSeen(learnerLang());
  }, [startedHere]);
  // Right after the onboarding or a course intro, the first lesson opens by itself.
  useEffect(() => {
    if (!progress.profile || needsIntro || !takeFirstLessonRequest()) return;
    const next = nextLesson(progress.completed, unitLocked);
    if (next) setScreen({ name: 'lesson', lessonId: next.lesson.id });
  }, [progress.profile, needsIntro]);
  useBackButton(home, screen.name === 'speak' || screen.name === 'grammar' || screen.name === 'profile');
  // A broken screen shows a message and a way home instead of a blank page (and is reported).
  const guard = (node: ReactNode) => (
    <ErrorBoundary key={screen.name} where={screen.name} onHome={home}>
      {node}
    </ErrorBoundary>
  );

  if (!progress.profile) {
    return (
      <Suspense fallback={<div className="ob-loading" />}>
        <Onboarding />
      </Suspense>
    );
  }

  if (needsIntro) {
    return (
      <Suspense fallback={<div className="ob-loading" />}>
        <CourseIntro
          onDone={() => setIntroDone(true)}
          onPlacement={() => {
            setIntroDone(true);
            setScreen({ name: 'placement' });
          }}
        />
      </Suspense>
    );
  }

  if (screen.name === 'test') {
    return guard(
      <Suspense fallback={<div className="ob-loading" />}>
        <UnitTestRunner unitId={screen.unitId} onExit={home} />
      </Suspense>
    );
  }

  if (screen.name === 'placement') {
    return guard(
      <Suspense fallback={<div className="ob-loading" />}>
        <PlacementTest onDone={home} />
      </Suspense>
    );
  }

  if (screen.name === 'listening' || screen.name === 'speaking') {
    const back = () => setScreen({ name: 'speak' });
    return guard(<LessonRunner key={screen.name} lessonId={null} mode={screen.name} onExit={back} onPractice={back} />);
  }

  if (screen.name === 'lesson' || screen.name === 'practice' || screen.name === 'review') {
    const lessonId = screen.name === 'lesson' ? screen.lessonId : null;
    return guard(
      <LessonRunner key={lessonId ?? screen.name} lessonId={lessonId} review={screen.name === 'review'} onExit={home} onPractice={practice} />
    );
  }

  return guard(
    <div className="shell">
      {screen.name === 'learn' ? (
        <HomeView
          onStart={(lessonId) => (lessonLocked(lessonId) ? setLockedUnit(unitOfLesson(lessonId) ?? null) : setScreen({ name: 'lesson', lessonId }))}
          onPractice={practice}
          onProfile={() => setScreen({ name: 'profile' })}
          onPlacement={() => setScreen({ name: 'placement' })}
          onReview={() => setScreen({ name: 'review' })}
          onTest={(unitId) => (unitLocked(unitId) ? setLockedUnit(COURSE.find((u) => u.id === unitId) ?? null) : setScreen({ name: 'test', unitId }))}
        />
      ) : (
        <Suspense fallback={<div className="pf" />}>
          {screen.name === 'speak' ? (
            <SpeakListenView onListening={() => setScreen({ name: 'listening' })} onSpeaking={() => setScreen({ name: 'speaking' })} />
          ) : screen.name === 'grammar' ? <GrammarView /> : <ProfileView onPlacement={() => setScreen({ name: 'placement' })} />}
        </Suspense>
      )}
      <TabBar tab={screen.name} onChange={(name) => setScreen({ name })} />
      <PlusReturn />
      {lockedUnit && <LockedUnitSheet unit={lockedUnit} onClose={() => setLockedUnit(null)} />}
    </div>
  );
}
