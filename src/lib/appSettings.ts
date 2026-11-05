import { ALL_LESSONS } from '../data/course';
import { DEFAULT_SETTINGS, normalizeSettings, type AppSettings, type FeatureId } from '../data/appSettings';
import { isPlus } from './premium';

// The owner's switches from the admin's Settings page, as the server sent them with the course (and saved
// with it for offline use). Set once at startup, before the app is drawn (main.tsx).
let current: AppSettings = DEFAULT_SETTINGS;

export function setAppSettings(raw: unknown): void {
  current = normalizeSettings(raw);
}

/** Whether a feature is switched on (everything is on unless the owner turned it off). */
export const feature = (id: FeatureId): boolean => current.features[id];

/** Whether this unit needs Englio Plus, and this learner doesn't have it. */
export const unitLocked = (unitId: string): boolean => current.lockedUnits.includes(unitId) && !isPlus();

/** The same, for the unit a lesson belongs to. */
export function lessonLocked(lessonId: string): boolean {
  const unit = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.unit;
  return !!unit && unitLocked(unit.id);
}

/** Hearts don't run out: with Plus, or when the owner switched hearts off. */
export const unlimitedHearts = (): boolean => isPlus() || !feature('hearts');
