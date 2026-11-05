import { lazy, Suspense, useState, type ReactNode } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { findClassLevel } from './data/classLevels';
import { applyLevel } from './data/course';
import { PlusReturn } from './features/premium/PlusReturn';
import { HomeView } from './features/home/HomeView';
import { TabBar, type Tab } from './features/layout/TabBar';
import { LessonRunner } from './features/lesson/LessonRunner';
import { useProgress } from './state/ProgressContext';
import { useBackButton } from './lib/backButton';

// Only first-time users need onboarding (and its map), so it loads on demand; so does the profile and its card.
const Onboarding = lazy(() => import('./features/onboarding/Onboarding'));
const ProfileView = lazy(() => import('./features/profile/ProfileView'));
const SpeakListenView = lazy(() => import('./features/speaking/SpeakListenView'));
const GrammarView = lazy(() => import('./features/grammar/GrammarView'));
const UnitTestRunner = lazy(() => import('./features/unittest/UnitTestRunner').then((m) => ({ default: m.UnitTestRunner })));
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
  applyLevel(findClassLevel(progress.profile?.classId)?.stage);
  const [screen, setScreen] = useState<Screen>({ name: 'learn' });
  const home = () => setScreen({ name: 'learn' });
  const practice = () => setScreen({ name: 'practice' });
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
          onStart={(lessonId) => setScreen({ name: 'lesson', lessonId })}
          onPractice={practice}
          onProfile={() => setScreen({ name: 'profile' })}
          onPlacement={() => setScreen({ name: 'placement' })}
          onReview={() => setScreen({ name: 'review' })}
          onTest={(unitId) => setScreen({ name: 'test', unitId })}
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
    </div>
  );
}
