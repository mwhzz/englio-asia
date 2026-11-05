import { describe, expect, it } from 'vitest';
import { baseForms, bareWord, lookup } from './lookup';

describe('tap-a-word lookup', () => {
  it('finds plurals and verb forms from their base word', async () => {
    expect((await lookup('books,'))?.word).toBe('book');
    expect((await lookup('“Studied'))?.word).toBe('study');
    expect((await lookup('running.'))?.word).toBe('run');
    expect((await lookup('making'))?.word).toBe('make');
    expect(await lookup('went')).toMatchObject({ word: 'went' });
  });

  it('never matches built-in object names', async () => {
    expect(await lookup('constructor')).toBeNull();
    expect(await lookup('toString')).toBeNull();
  });

  it('cleans the punctuation around a word', () => {
    expect(bareWord('“Hello,')).toBe('Hello');
    expect(baseForms('cities')).toContain('city');
  });
});
