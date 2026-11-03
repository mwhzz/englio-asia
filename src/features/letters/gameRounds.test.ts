import { describe, expect, it } from 'vitest';
import { makeRounds, type GameKind } from './gameRounds';

describe('letter games', () => {
  it.each(['listen', 'case', 'order'] as GameKind[])('%s rounds always have exactly one right answer among 4', (kind) => {
    for (let run = 0; run < 50; run++) {
      const rounds = makeRounds(kind);
      expect(rounds).toHaveLength(8);
      for (const r of rounds) {
        expect(r.options).toHaveLength(4);
        expect(new Set(r.options).size).toBe(4);
        expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
      }
    }
  });

  it('order rounds show four letters in a row with the answer missing', () => {
    for (let run = 0; run < 50; run++) {
      for (const r of makeRounds('order')) {
        expect(r.sequence).toHaveLength(4);
        expect(r.sequence!.filter((x) => x === null)).toHaveLength(1);
        const codes = r.sequence!.map((x) => (x ?? r.answer).charCodeAt(0));
        codes.slice(1).forEach((c, i) => expect(c).toBe(codes[i] + 1));
      }
    }
  });

  it('case rounds pair a capital with its small letter', () => {
    for (const r of makeRounds('case')) expect(r.prompt.toLowerCase()).toBe(r.answer.toLowerCase());
  });
});
