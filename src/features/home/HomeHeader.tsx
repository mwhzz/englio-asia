import type { CSSProperties } from 'react';
import { findClassLevel } from '../../data/classLevels';
import { findDistrict } from '../../data/districts';
import { initialOf } from '../../lib/profile';
import { useProgress } from '../../state/ProgressContext';
import { GoalBar } from './GoalBar';
import { greetingFor, skyFor } from './sky';
import { StatusPills } from './StatusPills';
import { useNow } from './useNow';
import { WeekStrip } from './WeekStrip';

/** Greeting under a soft glow that follows the time of day, then this week and today's goal. */
export function HomeHeader({ onProfile }: { onProfile: () => void }) {
  const { progress } = useProgress();
  const now = useNow();
  const hour = now.getHours();
  const sky = skyFor(hour);
  const greeting = greetingFor(hour);
  const profile = progress.profile;
  const district = findDistrict(profile?.districtId);
  const level = findClassLevel(profile?.classId);
  const date = new Intl.DateTimeFormat('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);

  return (
    <header className={`home-head sky-${sky.id}`} style={{ '--glow': sky.glow } as CSSProperties}>
      <div className="home-head-inner">
        <div className="home-top">
          <button className="home-avatar" onClick={onProfile} aria-label="Open profile">
            {profile ? initialOf(profile.name) : '?'}
          </button>
          <StatusPills />
        </div>

        <p className="home-date" lang="bn">
          {date}
        </p>
        <h1 className="home-greeting">
          <span lang="bn">{greeting.bn},</span> {profile?.name}
        </h1>
        {(district || level) && (
          <p className="home-place" lang="bn">
            {district?.bn}
            {district && level && ' · '}
            {level?.bn}
          </p>
        )}

        <div className="home-today">
          <WeekStrip />
          <GoalBar night={sky.id === 'night'} />
        </div>
      </div>
    </header>
  );
}
