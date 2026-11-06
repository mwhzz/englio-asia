import { describe, expect, it } from 'vitest';
import { possessive, toBanglaDigits } from './bangla';

describe('bangla', () => {
  it('writes digits in Bangla', () => {
    expect(toBanglaDigits(2026)).toBe('২০২৬');
  });

  it('makes the possessive the way Bangla does', () => {
    expect(possessive('ঢাকা')).toBe('ঢাকার');
    expect(possessive('সিলেট')).toBe('সিলেটের');
    expect(possessive('কুমিল্লা')).toBe('কুমিল্লার');
    expect(possessive('Rina')).toBe('Rina-র');
    expect(possessive('Karim')).toBe('Karim-এর');
  });
});
