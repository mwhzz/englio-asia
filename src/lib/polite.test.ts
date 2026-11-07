import { describe, expect, it } from 'vitest';
import { polite } from './polite';

describe('polite Bangla (আপনি)', () => {
  it('speaks to the learner politely and leaves other words alone', () => {
    expect(polite('তুমি কোন জেলার?')).toBe('আপনি কোন জেলার?');
    expect(polite('তোমার নাম লেখো')).toBe('আপনার নাম লিখুন');
    expect(polite('শুরু করো')).toBe('শুরু করুন');
    expect(polite('ম্যাপে চাপ দাও বা খুঁজো')).toBe('ম্যাপে চাপ দিন বা খুঁজুন');
    expect(polite('তুমি কি সাঁতার কাটতে পারো?')).toBe('আপনি কি সাঁতার কাটতে পারেন?');
    // A word that only contains a matching piece isn't changed.
    expect(polite('দাওয়াত')).toBe('দাওয়াত');
    expect(polite('হার্ট ফিরবে')).toBe('হার্ট ফিরবে');
  });
});
