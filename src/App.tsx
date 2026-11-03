import { lazy, Suspense, useState } from 'react';
import { HomeView } from './features/home/HomeView';
import { TabBar, type Tab } from './features/layout/TabBar';
import { LessonRunner } from './features/lesson/LessonRunner';
import { useProgress } from './state/ProgressContext';

// Only first-time users need onboarding (and its map), so it loads on demand; so does the profile and its card.
const Onboarding = lazy(() => import('./features/onboarding/Onboarding'));
const ProfileView = lazy(() => import('./features/profile/ProfileView'));
const LettersView = lazy(() => import('./features/letters/LettersView'));
const GrammarView = lazy(() => import('./features/grammar/GrammarView'));
const UnitTestRunner = lazy(() => import('./features/unittest/UnitTestRunner').then((m) => ({ default: m.UnitTestRunner })));
const PlacementTest = lazy(() => import('./features/placement/PlacementTest').then((m) => ({ default: m.PlacementTest })));

type Screen = { name: Tab } | { name: 'lesson'; lessonId: string } | { name: 'practice' } | { name: 'review' } | { name: 'placement' } | { name: 'test'; unitId: string };

export default function App() {
  const { progress } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'learn' });
  const home = () => setScreen({ name: 'learn' });
  const practice = () => setScreen({ name: 'practice' });

  if (!progress.profile) {
    return (
      <Suspense fallback={<div className="ob-loading" />}>
        <Onboarding />
      </Suspense>
    );
  }

  if (screen.name === 'test') {
    return (
      <Suspense fallback={<div className="ob-loading" />}>
        <UnitTestRunner unitId={screen.unitId} onExit={home} />
      </Suspense>
    );
  }

  if (screen.name === 'placement') {
    return (
      <Suspense fallback={<div className="ob-loading" />}>
        <PlacementTest onDone={home} />
      </Suspense>
    );
  }

  if (screen.name === 'lesson' || screen.name === 'practice' || screen.name === 'review') {
    const lessonId = screen.name === 'lesson' ? screen.lessonId : null;
    return (
      <LessonRunner key={lessonId ?? screen.name} lessonId={lessonId} review={screen.name === 'review'} onExit={home} onPractice={practice} />
    );
  }

  return (
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
          {screen.name === 'letters' ? <LettersView /> : screen.name === 'grammar' ? <GrammarView /> : <ProfileView onPlacement={() => setScreen({ name: 'placement' })} />}
        </Suspense>
      )}
      <TabBar tab={screen.name} onChange={(name) => setScreen({ name })} />
    </div>
  );
}
