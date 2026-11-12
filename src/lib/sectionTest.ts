import { COURSE } from '../data/course';
import { sectionsOf, type Section } from '../data/sections';
import type { Unit } from '../types';
import { learnerLang } from './learnerLang';

/** A section's checkpoint test is the unit test of all its units' lessons together ("section:s1"). */
export const sectionTestId = (section: Section) => `section:${section.id}`;

/**
 * The unit a test is about: a real unit, or for a section's checkpoint, one made of the section's units
 * (its title, the first unit's color, every lesson). `number` is what the certificate shows.
 */
export function testUnit(id: string): { unit: Unit; number: number } | null {
  if (!id.startsWith('section:')) {
    const index = COURSE.findIndex((u) => u.id === id);
    return index < 0 ? null : { unit: COURSE[index], number: index + 1 };
  }
  const sections = sectionsOf(learnerLang(), COURSE.length);
  const index = sections.findIndex((s) => sectionTestId(s) === id);
  if (index < 0) return null;
  const s = sections[index];
  const units = COURSE.slice(s.from, s.to + 1);
  return {
    unit: { ...units[0], id, title: `সেকশন ${index + 1}`, titleBn: s.title, lessons: units.flatMap((u) => u.lessons), tips: [] },
    number: index + 1,
  };
}
