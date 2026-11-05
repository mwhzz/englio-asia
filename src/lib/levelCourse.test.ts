import { describe, expect, it } from 'vitest';
import type { Unit } from '../types';
import { isForLevel, unitsForLevel } from './levelCourse';

const unit = (id: string, levels?: Unit['levels']): Unit => ({ id, title: id, titleBn: id, color: '#000000', tips: [], lessons: [], levels });

describe('unitsForLevel', () => {
  const units = [unit('basics'), unit('kids', ['primary']), unit('ssc', ['secondary', 'higher']), unit('empty', [])];

  it('keeps units for everyone and the ones tagged with the level, in order', () => {
    expect(unitsForLevel(units, 'primary').map((u) => u.id)).toEqual(['basics', 'kids', 'empty']);
    expect(unitsForLevel(units, 'higher').map((u) => u.id)).toEqual(['basics', 'ssc', 'empty']);
  });

  it('shows everything before the learner has a level', () => {
    expect(unitsForLevel(units, undefined)).toHaveLength(4);
    expect(isForLevel(unit('kids', ['primary']), undefined)).toBe(true);
  });

  it('falls back to the whole course when nothing is made for the level', () => {
    const tagged = [unit('kids', ['primary'])];
    expect(unitsForLevel(tagged, 'university')).toEqual(tagged);
  });
});
