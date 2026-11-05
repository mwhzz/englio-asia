import { LearnerCard } from '../../components/card/LearnerCard';
import { findClassLevel } from '../../data/classLevels';
import { APP_VERSION } from '../../lib/version';
import { useProgress } from '../../state/ProgressContext';
import { BadgesGrid } from './BadgesGrid';
import { CourseProgress } from './CourseProgress';
import { LearningLinks } from './LearningLinks';
import { SettingsList } from './SettingsList';
import { StatTiles } from './StatTiles';
import { WeekChart } from './WeekChart';
import { WeeklyReport } from './WeeklyReport';

/** The profile: the learner's student pass, their numbers, this week, the course so far, and settings. */
export default function ProfileView({ onPlacement }: { onPlacement: () => void }) {
  const { progress } = useProgress();
  const profile = progress.profile;

  return (
    <div className="pf">
      <header className="pf-head">
        <h1 lang="bn">প্রোফাইল</h1>
        <small>Profile</small>
      </header>

      <div className="pf-card pf-rise">
        <LearnerCard
          name={profile?.name ?? ''}
          districtId={profile?.districtId ?? null}
          level={findClassLevel(profile?.classId)}
          joinedAt={profile?.joinedAt}
        />
      </div>

      <div className="pf-rise" style={{ animationDelay: '80ms' }}>
        <StatTiles />
      </div>
      <div className="pf-rise" style={{ animationDelay: '140ms' }}>
        <WeekChart />
      </div>
      <div className="pf-rise" style={{ animationDelay: '170ms' }}>
        <WeeklyReport />
      </div>
      <div className="pf-rise" style={{ animationDelay: '185ms' }}>
        <BadgesGrid />
      </div>
      <div className="pf-rise" style={{ animationDelay: '200ms' }}>
        <LearningLinks />
      </div>
      <div className="pf-rise" style={{ animationDelay: '220ms' }}>
        <CourseProgress />
      </div>
      <div className="pf-rise" style={{ animationDelay: '260ms' }}>
        <SettingsList onPlacement={onPlacement} />
      </div>

      <p className="pf-foot">Englio {APP_VERSION} · Made for Bangla speakers</p>
    </div>
  );
}
