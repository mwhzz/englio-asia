import { describe, expect, it } from 'vitest';
import { BUNDLED_BOARD } from '../data/board';
import { applyBoardRound, boardYears, examFor, modelTest, roundOf, ROUND, topicsFor } from './board';
import { DEFAULT_PROGRESS } from './progress';

describe('board practice', () => {
  it('has topics with enough sound questions for a round', () => {
    expect(new Set(BUNDLED_BOARD.map((t) => t.id)).size).toBe(BUNDLED_BOARD.length);
    for (const t of BUNDLED_BOARD) {
      expect(t.questions.length).toBeGreaterThanOrEqual(ROUND);
      for (const q of t.questions) {
        expect(q.wrong).not.toContain(q.correct);
        expect(new Set([q.correct, ...q.wrong]).size).toBe(q.wrong.length + 1);
        expect(q.why.length).toBeGreaterThan(5);
      }
    }
  });

  it('picks the exam by class', () => {
    expect(examFor('class-9')).toBe('ssc');
    expect(examFor('class-12')).toBe('hsc');
    expect(examFor('university')).toBe('hsc');
    expect(boardYears('class-10')).toBe(true);
    expect(boardYears('class-5')).toBe(false);
  });

  it('makes rounds and model tests without repeats', () => {
    const round = roundOf(BUNDLED_BOARD[0]);
    expect(round).toHaveLength(ROUND);
    const test = modelTest(BUNDLED_BOARD, 'ssc');
    expect(test).toHaveLength(20);
    expect(new Set(test.map((q) => q.question)).size).toBe(20);
    expect(topicsFor(BUNDLED_BOARD, 'hsc').length).toBeGreaterThan(0);
  });

  it('keeps the best score and gives XP for right answers', () => {
    const p1 = applyBoardRound({ ...DEFAULT_PROGRESS }, 'articles', 8, 10, 60, '2026-11-03');
    expect(p1.boardScores.articles).toBe(80);
    expect(p1.xp).toBe(8);
    const p2 = applyBoardRound(p1, 'articles', 5, 10, 60, '2026-11-03');
    expect(p2.boardScores.articles).toBe(80);
    expect(p2.xp).toBe(13);
  });
});

describe('exam plan', () => {
  it('keeps each day’s board score and shows the last 14 days', async () => {
    const { applyBoardRound, boardTrend, boardToday, dailyRound } = await import('./board');
    const { DEFAULT_PROGRESS } = await import('./progress');
    const { BOARD } = await import('../data/board');
    let p = applyBoardRound(DEFAULT_PROGRESS, 'daily-ssc', 6, 10, 60, '2026-11-01');
    p = applyBoardRound(p, 'daily-ssc', 9, 10, 60, '2026-11-07');
    const trend = boardTrend(p, 14, '2026-11-07');
    expect(trend).toHaveLength(14);
    expect(trend.at(-1)).toEqual({ day: '2026-11-07', percent: 90 });
    expect(trend.find((d) => d.day === '2026-11-01')?.percent).toBe(60);
    expect(boardToday(p, '2026-11-07')).toBe(true);
    expect(dailyRound(BOARD, 'ssc')).toHaveLength(10);
  });
});
