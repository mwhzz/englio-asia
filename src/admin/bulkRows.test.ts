import { describe, expect, it } from 'vitest';
import { parseRows } from './bulkRows';

describe('bulk rows', () => {
  it('reads rows pasted from Excel (tabs), with a header row', () => {
    expect(parseRows('vocab', 'English\tBangla\nteacher\tশিক্ষক\r\n\nbook\tবই')).toEqual([
      { en: 'teacher', bn: 'শিক্ষক' },
      { en: 'book', bn: 'বই' },
    ]);
  });

  it('reads "|" rows and CSV files', () => {
    expect(parseRows('sentence', 'I am a student. | আমি একজন ছাত্র। | I’m a student.; Im a student.')).toEqual([
      { en: 'I am a student.', bn: 'আমি একজন ছাত্র।', alt: ['I’m a student.', 'Im a student.'] },
    ]);
    expect(parseRows('vocab', 'cat,বিড়াল')).toEqual([{ en: 'cat', bn: 'বিড়াল' }]);
    expect(parseRows('fill', '"She ___ a doctor.","is","is, am, are","সে একজন ডাক্তার।"')).toEqual([
      { text: 'She ___ a doctor.', answer: 'is', options: ['is', 'am', 'are'], bn: 'সে একজন ডাক্তার।' },
    ]);
  });
});
