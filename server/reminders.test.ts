import { describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { deletePush, dueReminders, reminderMessage, savePush } from './reminders.ts';
import { saveProgress } from './users.ts';

const SUB = { endpoint: 'https://push.example.com/abc', keys: { p256dh: 'x', auth: 'y' } };
// 14:00 UTC is 20:00 in Dhaka (UTC+6).
const NOW = new Date('2026-11-03T14:00:00Z');

function setup(xpByDay: Record<string, number>) {
  const db = openDb(':memory:');
  saveProgress(db, 'device-0001', { profile: { name: 'Rina Akter' }, xp: 50, streak: 4, xpByDay, completed: {} });
  savePush(db, 'device-0001', { subscription: SUB, hour: 20, timeZone: 'Asia/Dhaka' });
  return db;
}

describe('daily reminders', () => {
  it('is due at the chosen local hour when nothing was learned today', () => {
    const db = setup({ '2026-11-02': 20 });
    expect(dueReminders(db, NOW)).toEqual([{ userId: 'device-0001', name: 'Rina Akter', streak: 4, subscription: SUB, away: 0 }]);
  });

  it('is not due at another hour, or after learning today', () => {
    expect(dueReminders(setup({}), new Date('2026-11-03T13:00:00Z'))).toEqual([]);
    expect(dueReminders(setup({ '2026-11-03': 10 }), NOW)).toEqual([]);
  });

  it('stops after the device turns it off', () => {
    const db = setup({});
    deletePush(db, 'device-0001');
    expect(dueReminders(db, NOW)).toEqual([]);
  });

  it('refuses something that is not a push subscription', () => {
    const db = setup({});
    expect(() => savePush(db, 'device-0001', { subscription: { endpoint: 'http://x' } })).toThrow();
  });

  it('mentions the streak when there is one to keep', () => {
    expect(reminderMessage({ name: 'Rina Akter', streak: 4 }).title).toContain('৪');
    expect(reminderMessage({ name: null, streak: 0 }).body).not.toContain(',');
  });

  it('after two quiet days, only asks them back on days 3, 7, 14 and 30', () => {
    // Last practised 2026-10-30: on 2026-11-03 that is 3 days away.
    expect(dueReminders(setup({ '2026-10-30': 20 }), NOW).map((r) => r.away)).toEqual([3]);
    expect(dueReminders(setup({ '2026-10-29': 20 }), NOW)).toEqual([]);
    expect(reminderMessage({ name: 'Rina', streak: 0, away: 3 }).variant).toBe('back-3');
    expect(reminderMessage({ name: 'Rina', streak: 0 }, 0.99).variant).toBe('daily-c');
  });
});
