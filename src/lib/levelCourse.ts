import type { Level, Unit } from '../types';

/** Every level, in the order the admin lists them. */
export const LEVELS: Level[] = ['primary', 'secondary', 'higher', 'university', 'other'];

/** Whether a unit is on this level's path (a unit without levels is for everyone). */
export const isForLevel = (unit: Pick<Unit, 'levels'>, level: Level | undefined): boolean =>
  !level || !unit.levels?.length || unit.levels.includes(level);

/**
 * The units a learner at `level` sees, in course order. If the admin hasn't made anything for that
 * level yet, the whole course is better than an empty path.
 */
export function unitsForLevel(units: Unit[], level: Level | undefined): Unit[] {
  const mine = units.filter((u) => isForLevel(u, level));
  return mine.length ? mine : units;
}
