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
import { boardCourse } from '../../lib/learnerLang';
import { BackupNudge } from './BackupNudge';
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

/**
 * The home page, in order of what matters: the greeting and today's goal, the next lesson, what comes back
 * today, anything that needs the learner now, the path; the rest (tasks, league, stories) below it.
 */
export function HomeView({ onStart, onPractice, onProfile, onPlacement, onReview, onTest }: Props) {
  const { progress } = useProgress();
  const anyDone = Object.keys(progress.completed).length > 0;

  return (
    <div className="home">
      <HomeHeader onProfile={onProfile} />
      <div className="home-body">
        <SyncNote />
        {/* 1. The one thing to do: the next lesson, in reach without scrolling, even with large text. */}
        <div className="home-rise" style={{ animationDelay: '140ms' }}>
          <UpNextCard onStart={onStart} onPractice={onPractice} />
        </div>
        {/* 2. What comes back today. */}
        <ReviewCard onStart={onReview} />
        {/* 3. Only what needs the learner now (each shows only when it applies). */}
        <NoticeBanner />
        <ReplyCard />
        <StreakLost onStart={onStart} />
        <StreakNudge onStart={onStart} />
        <BackupNudge />
        {!anyDone && !progress.placementTaken && (
          <div className="home-rise" style={{ animationDelay: '100ms' }}>
            <PlacementCard onStart={onPlacement} />
          </div>
        )}
        {!anyDone && <HowItWorks />}
        <section className="home-path home-rise" style={{ animationDelay: '220ms' }}>
          <div className="home-section-head">
            <h2 className="home-section-title">
              <span lang="bn">তোমার পথ</span> <small>Your path</small>
            </h2>
            {anyDone && <PracticeButton onPractice={onPractice} />}
          </div>
          <LessonTrail onStart={onStart} onTest={onTest} />
        </section>
        {/* The rest, below the path: today's tasks, the league, stories, board prep. */}
        {anyDone && (
          <section className="home-more" aria-label="আরও">
            <h2 className="home-section-title">
              <span lang="bn">আরও</span>
            </h2>
            <QuestsCard />
            {feature('league') && <LeagueCard />}
            {feature('stories') && <StoriesCard />}
            {feature('board') && boardCourse() && boardYears(progress.profile?.classId) && <BoardCard delay={0} />}
          </section>
        )}
        <VoiceHint />
      </div>
    </div>
  );
}
