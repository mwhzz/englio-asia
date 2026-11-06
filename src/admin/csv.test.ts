import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('csv', () => {
  it('quotes commas, quotes and new lines, and keeps Bangla', () => {
    expect(toCsv([{ name: 'রিনা, আক্তার', note: 'say "hi"\nok', n: 3 }])).toBe('﻿name,note,n\r\n"রিনা, আক্তার","say ""hi""\nok",3');
    expect(toCsv([])).toBe('');
  });
});
