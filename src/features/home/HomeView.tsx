import { useProgress } from '../../state/ProgressContext';
import { PracticeButton } from '../path/PracticeButton';
import { BoardCard } from '../board/BoardCard';
import { LeagueCard } from '../league/LeagueCard';
import { boardYears } from '../../lib/board';
import { PlacementCard } from '../placement/PlacementCard';
import { StoriesCard } from '../stories/StoriesCard';
import { ReviewCard } from './ReviewCard';
import { LessonTrail } from '../path/trail/LessonTrail';
import { HomeHeader } from './HomeHeader';
import { UpNextCard } from './UpNextCard';
import { HowItWorks } from './HowItWorks';
import { StreakNudge } from './StreakNudge';
import { StreakLost } from './StreakLost';
import { NoticeBanner } from '../notice/NoticeBanner';
import { ReplyCard } from '../help/ReplyCard';
import { QuestsCard } from './QuestsCard';
import { SyncNote } from './SyncNote';
import { VoiceHint } from './VoiceHint';
import { feature } from '../../lib/appSettings';

interface Props {
  onStart: (lessonId: string) => void;
  onPractice: () => void;
  onProfile: () => void;
  onPlacement: () => void;
  onReview: () => void;
  onTest: (unitId: string) => void;
}

/** The home page: greeting with today's sun path, the next lesson, then the lesson path. */
export function HomeView({ onStart, onPractice, onProfile, onPlacement, onReview, onTest }: Props) {
  const { progress } = useProgress();
  const anyDone = Object.keys(progress.completed).length > 0;

  return (
    <div className="home">
      <HomeHeader onProfile={onProfile} />
      <div className="home-body">
        <SyncNote />
        {!anyDone && !progress.placementTaken && (
          <div className="home-rise" style={{ animationDelay: '100ms' }}>
            <PlacementCard onStart={onPlacement} />
          </div>
        )}
        <NoticeBanner />
        <ReplyCard />
        <StreakNudge onStart={onStart} />
        <StreakLost onStart={onStart} />
        <div className="home-rise" style={{ animationDelay: '140ms' }}>
          <UpNextCard onStart={onStart} onPractice={onPractice} />
        </div>
        {Object.keys(progress.completed).length < 3 && <HowItWorks />}
        <VoiceHint />
        {anyDone && <QuestsCard />}
        <ReviewCard onStart={onReview} />
        {feature('board') && boardYears(progress.profile?.classId) && <BoardCard delay={190} />}
        {feature('stories') && anyDone && <StoriesCard />}
        {feature('league') && anyDone && <LeagueCard />}
        <section className="home-path home-rise" style={{ animationDelay: '220ms' }}>
          <div className="home-section-head">
            <h2 className="home-section-title">
              <span lang="bn">তোমার পথ</span> <small>Your path</small>
            </h2>
            {anyDone && <PracticeButton onPractice={onPractice} />}
          </div>
          <LessonTrail onStart={onStart} onTest={onTest} />
        </section>
      </div>
    </div>
  );
}
