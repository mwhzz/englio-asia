import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings, settingsProblems } from './appSettings';

describe('app settings', () => {
  it('falls back to everything on and nothing locked when the server sends nothing or junk', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ features: { hearts: 'no' }, lockedUnits: 'u1', plus: { price: -5 } })).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps what is valid', () => {
    const s = normalizeSettings({ features: { league: false }, lockedUnits: ['u3', 'u3', 'u4'], plus: { price: 149, days: 60 } });
    expect(s.features.league).toBe(false);
    expect(s.features.hearts).toBe(true);
    expect(s.lockedUnits).toEqual(['u3', 'u4']);
    expect(s.plus).toEqual({ price: 149, days: 60, yearPrice: 0, trialDays: 0 });
  });

  it('names every problem when the admin saves', () => {
    expect(settingsProblems(DEFAULT_SETTINGS, ['u1'])).toEqual([]);
    const problems = settingsProblems({ ...DEFAULT_SETTINGS, lockedUnits: ['u9'], plus: { price: 0, days: 30 } }, ['u1']);
    expect(problems).toContain('unknown unit "u9"');
    expect(problems.some((p) => p.includes('price'))).toBe(true);
    expect(settingsProblems({ lockedUnits: [] }, [])).toContain('"features" is missing');
  });
});
