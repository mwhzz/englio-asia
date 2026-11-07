import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { setUiText, translate } from '../src/lib/translateText.ts';

const SOURCES = JSON.parse(readFileSync('content/ui-strings.json', 'utf8')) as string[];
const AR = JSON.parse(readFileSync('content/ui/ar.json', 'utf8')) as Record<string, string>;

describe('the app in another language', () => {
  it('swaps whole texts, template texts with their numbers, and Bangla digits', () => {
    setUiText({ 'শুরু করো': 'ابدأ', '{0}টা প্রশ্ন': '{0} سؤال', 'টা প্রশ্ন': 'سؤال' });
    expect(translate('শুরু করো')).toBe('ابدأ');
    expect(translate('  শুরু করো ')).toBe('  ابدأ ');
    expect(translate('১০টা প্রশ্ন')).toBe('10 سؤال');
    expect(translate('টা প্রশ্ন')).toBe('سؤال');
    expect(translate('১২')).toBe('12');
    expect(translate('Hello')).toBe('Hello');
  });

  it('the list of app texts is up to date (new Bangla text gets listed for translators)', () => {
    expect(() => execFileSync(process.execPath, ['scripts/extract-ui-text.mjs', '--check'], { stdio: 'pipe' })).not.toThrow();
  });

  it('Arabic has every app text, and keeps every {0} placeholder', () => {
    const missing = SOURCES.filter((s) => !(s in AR));
    expect(missing).toEqual([]);
    for (const s of SOURCES) for (const ph of s.match(/\{\d\}/g) ?? []) expect(AR[s], s).toContain(ph);
  });
});
