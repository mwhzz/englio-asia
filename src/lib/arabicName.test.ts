import { describe, expect, it } from 'vitest';
import { arabicName } from './arabicName';

describe('a name in Arabic letters', () => {
  it('from English spelling', () => {
    expect(arabicName('Zawad')).toBe('زاواد');
    expect(arabicName('Tania')).toBe('تانيا');
    expect(arabicName('Shakib Khan')).toBe('شاكيب خان');
    expect(arabicName('Amina')).toBe('أمينا');
    expect(arabicName('Yasin')).toBe('ياسين');
  });

  it('from Bangla spelling', () => {
    expect(arabicName('রহিম')).toBe('رهيم');
    expect(arabicName('করিম')).toBe('كريم');
    expect(arabicName('আমিনা')).toBe('أمينا');
  });

  it('nothing to write gives nothing', () => {
    expect(arabicName('123')).toBe('');
    expect(arabicName('   ')).toBe('');
  });
});
