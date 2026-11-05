import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS module used by the release script
import { dateChangelog, nextVersion } from './releaseVersion.mjs';

describe('release version', () => {
  it('raises the right part', () => {
    expect(nextVersion('1.4.2', 'patch')).toBe('1.4.3');
    expect(nextVersion('1.4.2', 'minor')).toBe('1.5.0');
    expect(nextVersion('1.4.2', 'major')).toBe('2.0.0');
    expect(nextVersion('0.1.0', 'major')).toBe('1.0.0');
  });

  it('moves the unreleased notes under a dated heading and keeps older entries', () => {
    const before = '# Changelog\n\n## Unreleased\n\n- Fixed the timer.\n\n## 1.0.0 (2026-11-06)\n\n- First release.\n';
    expect(dateChangelog(before, '1.0.1', '2026-11-07')).toBe(
      '# Changelog\n\n## Unreleased\n\n## 1.0.1 (2026-11-07)\n\n- Fixed the timer.\n\n## 1.0.0 (2026-11-06)\n\n- First release.\n',
    );
  });

  it('works when the unreleased notes are the only entry', () => {
    expect(dateChangelog('# Changelog\n\n## Unreleased\n\n- First.\n', '1.0.0', '2026-11-06')).toBe(
      '# Changelog\n\n## Unreleased\n\n## 1.0.0 (2026-11-06)\n\n- First.\n',
    );
  });

  it('refuses when nothing is written under Unreleased', () => {
    expect(dateChangelog('# Changelog\n\n## Unreleased\n\n## 1.0.0 (2026-11-06)\n\n- First.\n', '1.0.1', '2026-11-07')).toBeNull();
  });
});
