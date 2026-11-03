import { describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { backupCode, deleteByCode, restore } from './restoreCodes.ts';
import { saveProgress } from './users.ts';

function setup() {
  const db = openDb(':memory:');
  saveProgress(db, 'old-phone-0001', { profile: { name: 'Rina' }, xp: 120, completed: { 'u1-l1': 1 } });
  return db;
}

describe('backup codes', () => {
  it('gives the same readable code each time', () => {
    const db = setup();
    const code = backupCode(db, 'old-phone-0001');
    expect(code).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    expect(code).not.toMatch(/[01OIL]/);
    expect(backupCode(db, 'old-phone-0001')).toBe(code);
  });

  it('brings the progress to a new phone, however the code is typed', () => {
    const db = setup();
    const code = backupCode(db, 'old-phone-0001');
    const typed = ` ${code.toLowerCase().replace('-', ' ')} `;
    expect(restore(db, { code: typed })).toEqual({ id: 'old-phone-0001', progress: { profile: { name: 'Rina' }, xp: 120, completed: { 'u1-l1': 1 } } });
  });

  it('refuses a wrong code and deletes with the right one', () => {
    const db = setup();
    const code = backupCode(db, 'old-phone-0001');
    expect(() => restore(db, { code: 'AAAAA-AAAAA' })).toThrow();
    deleteByCode(db, { code });
    expect(() => restore(db, { code })).toThrow();
    expect(db.prepare('SELECT COUNT(*) AS n FROM users').get()).toEqual({ n: 0 });
  });

  it('needs a learner the server knows', () => {
    expect(() => backupCode(setup(), 'never-synced-1')).toThrow();
  });
});
