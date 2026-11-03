import { describe, expect, it } from 'vitest';
import { compare, normalize, tokens } from './answer';

describe('normalize', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalize('  Hello,   how are YOU? ')).toBe('hello how are you');
  });

  it('treats short forms and full forms the same', () => {
    expect(normalize("I'm fine")).toBe(normalize('I am fine'));
    expect(normalize('She’s my friend')).toBe(normalize('She is my friend'));
    expect(normalize("It's seven o'clock.")).toBe('it is seven oclock');
  });
});

describe('tokens', () => {
  it('splits a sentence into tiles without punctuation', () => {
    expect(tokens('Hello, how are you?')).toEqual(['Hello', 'how', 'are', 'you']);
    expect(tokens("It is seven o'clock.")).toEqual(['It', 'is', 'seven', "o'clock"]);
  });
});

describe('compare', () => {
  const answers = ['I am a student.', 'I am a pupil.'];

  it('accepts any listed answer', () => {
    expect(compare('i am a pupil', answers, false)).toBe('correct');
    expect(compare("I'm a student", answers, false)).toBe('correct');
  });

  it('flags a one-letter typo only when typos are allowed', () => {
    expect(compare('I am a studnt', answers, true)).toBe('typo');
    expect(compare('I am a studnt', answers, false)).toBe('wrong');
  });

  it('rejects wrong and empty answers', () => {
    expect(compare('You are a student', answers, true)).toBe('wrong');
    expect(compare('   ', answers, true)).toBe('wrong');
  });
});
