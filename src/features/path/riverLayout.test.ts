import { describe, expect, it } from 'vitest';
import { COURSE } from '../../data/course';
import { SCENE_WIDTH, sceneLayout } from './riverLayout';

describe('sceneLayout', () => {
  const scene = sceneLayout(COURSE);
  const lessonCount = COURSE.reduce((n, u) => n + u.lessons.length, 0);

  it('has one jetty per lesson and one bridge per unit', () => {
    expect(scene.stops).toHaveLength(lessonCount);
    expect(scene.marks).toHaveLength(COURSE.length);
  });

  it('runs downwards, alternates banks and keeps jetties on screen', () => {
    scene.stops.forEach((s, i) => {
      if (i > 0) expect(s.y).toBeGreaterThan(scene.stops[i - 1].y);
      expect(s.side).toBe(i % 2 === 0 ? 1 : -1);
      expect(s.x).toBeGreaterThan(30);
      expect(s.x).toBeLessThan(SCENE_WIDTH - 30);
      // The ship waits on the river side of its jetty.
      expect(Math.sign(s.x - s.ship.x)).toBe(s.side);
    });
    expect(scene.height).toBeGreaterThan(scene.mouth.y);
  });

  it('keeps scenery inside the scene and is the same every time', () => {
    for (const item of scene.items) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x).toBeLessThanOrEqual(SCENE_WIDTH);
    }
    expect(sceneLayout(COURSE).items).toEqual(scene.items);
  });
});
