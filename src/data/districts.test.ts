import { describe, expect, it } from 'vitest';
import { searchDistricts } from './districts';

describe('district search', () => {
  it('puts the best match first ("Raj" → Rajshahi before Rajbari)', () => {
    expect(searchDistricts('Raj')[0].en).toBe('Rajshahi');
    expect(searchDistricts('syl')[0].en).toBe('Sylhet');
  });
});
