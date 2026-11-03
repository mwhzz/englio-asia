import { describe, expect, it } from 'vitest';
import { COURSE } from '../../../data/course';
import { SKY_WIDTH, skyLayout } from './starLayout';

describe('skyLayout', () => {
  const sky = skyLayout(COURSE);

  it('has one star per lesson and one constellation per unit', () => {
    expect(sky.stars).toHaveLength(COURSE.reduce((n, u) => n + u.lessons.length, 0));
    expect(sky.constellations).toHaveLength(COURSE.length);
  });

  it('runs downwards and keeps stars away from the edges', () => {
    sky.stars.forEach((s, i) => {
      if (i > 0) expect(s.y).toBeGreaterThan(sky.stars[i - 1].y);
      expect(s.x).toBeGreaterThan(60);
      expect(s.x).toBeLessThan(SKY_WIDTH - 60);
    });
  });

  it('puts each sign above its first star', () => {
    for (const c of sky.constellations) expect(c.sign.y).toBeLessThan(c.stars[0].y - 40);
  });
});
