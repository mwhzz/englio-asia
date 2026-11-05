// The pure parts of `npm run release` (scripts/release.mjs), kept apart so they can be tested.

/** "1.4.2" + "minor" → "1.5.0". */
export function nextVersion(version, part) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (part === 'major') return `${major + 1}.0.0`;
  if (part === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * The changelog with the notes under "## Unreleased" moved under "## <version> (<day>)", and an empty
 * "## Unreleased" left on top for next time. null when there are no notes (nothing to release).
 */
export function dateChangelog(text, version, day) {
  const match = text.match(/## Unreleased[^\n]*\n([\s\S]*?)(?=\n## |$)/);
  const notes = match?.[1].trim() ?? '';
  if (!match || !notes) return null;
  return text.replace(match[0], `## Unreleased\n\n## ${version} (${day})\n\n${notes}\n`);
}
