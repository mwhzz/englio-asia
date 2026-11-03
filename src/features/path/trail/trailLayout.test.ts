import { describe, expect, it } from 'vitest';
import { SWING, curveBetween, trailLayout } from './trailLayout';

describe('trailLayout', () => {
  it('has one stop per lesson, running downwards inside the swing', () => {
    const { points, height } = trailLayout(6, 0, -1);
    expect(points).toHaveLength(6);
    points.forEach((p, i) => {
      if (i > 0) expect(p.y).toBeGreaterThan(points[i - 1].y);
      expect(Math.abs(p.dx)).toBeLessThanOrEqual(SWING);
    });
    expect(height).toBeGreaterThan(points[5].y);
  });

  it('starts in the middle and alternates direction by unit', () => {
    const even = trailLayout(3, 0, -1).points;
    const odd = trailLayout(3, 1, -1).points;
    expect(even[0].dx).toBe(0);
    expect(even[1].dx).toBeGreaterThan(0);
    expect(odd[1].dx).toBeLessThan(0);
  });

  it('leaves extra room under the next lesson for its start button', () => {
    const plain = trailLayout(3, 0, -1).points;
    const withCurrent = trailLayout(3, 0, 0).points;
    expect(withCurrent[1].y - withCurrent[0].y).toBeGreaterThan(plain[1].y - plain[0].y);
  });

  it('draws a curve that starts and ends on the stops', () => {
    expect(curveBetween({ dx: 0, y: 10 }, { dx: 50, y: 110 })).toBe('M0 10C0 60 50 60 50 110');
  });
});
