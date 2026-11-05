// `npm run release -- patch|minor|major [--dry-run] [--skip-e2e] [--no-deploy]`
//
// Puts a new version of Englio online, safely:
//  1. checks you're on `main`, everything is committed, and CHANGELOG.md says what changed (under "## Unreleased");
//  2. builds and runs every test (stops if anything fails, so nothing broken goes online);
//  3. raises the version in package.json (patch 1.0.0→1.0.1 for fixes, minor →1.1.0 for features, major →2.0.0),
//     dates the changelog entry, commits, tags vX.Y.Z and pushes to GitHub;
//  4. waits until the site runs the new version (the server deploys new commits on main by itself, see deploy/autodeploy.sh).
//
// --dry-run does the checks and tests and prints what would happen, changing nothing. --no-deploy doesn't wait for the site.
// The site to check can be changed with DEPLOY_URL (default https://webpstudio.com).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dateChangelog, nextVersion } from './releaseVersion.mjs';

const URL_ = (process.env.DEPLOY_URL ?? 'https://webpstudio.com').replace(/\/$/, '');
const BRANCH = 'main';

const args = process.argv.slice(2);
const kind = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry-run');
const skipE2e = args.includes('--skip-e2e');
const noDeploy = args.includes('--no-deploy');

function stop(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/** Set once the version files are changed: a failure before the commit then puts them back. */
let changedFiles = false;

/** Runs a command with its output shown; stops the release if it fails. */
function run(cmd, cmdArgs, what) {
  console.log(`\n▶ ${what}`);
  // npm is a .cmd script on Windows and needs a shell; everything else runs directly, so arguments with spaces stay whole.
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: cmd === 'npm' && process.platform === 'win32' });
  if (r.status === 0) return;
  if (changedFiles) {
    spawnSync('git', ['reset', '-q']);
    spawnSync('git', ['checkout', '--', 'package.json', 'package-lock.json', 'CHANGELOG.md']);
    stop(`${what} failed. The version change was undone; nothing was released.`);
  }
  stop(`${what} failed. Nothing was released.`);
}

/** A git command's output (trimmed). */
const git = (...a) => spawnSync('git', a, { encoding: 'utf8' }).stdout.trim();

if (!['patch', 'minor', 'major'].includes(kind ?? '')) {
  stop('Say what kind of release: npm run release -- patch   (fixes)  |  minor   (new features)  |  major   (big changes)');
}

// 1. Checks
const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
if (branch !== BRANCH) stop(`Releases are made from "${BRANCH}", but you're on "${branch}". Merge your work into ${BRANCH} first.`);
if (git('status', '--porcelain')) stop('There are uncommitted changes. Commit them (or stash them) first.');
spawnSync('git', ['fetch', '--quiet', 'origin', BRANCH]);
if (git('rev-list', '--count', `HEAD..origin/${BRANCH}`) !== '0') stop(`GitHub has newer commits on ${BRANCH}. Run "git pull" first.`);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = nextVersion(pkg.version, kind);
const day = new Date().toLocaleDateString('en-CA'); // today's local date, YYYY-MM-DD
const changelog = dateChangelog(readFileSync('CHANGELOG.md', 'utf8'), version, day);
if (!changelog) stop('CHANGELOG.md has nothing under "## Unreleased". Write a line or two about what changed first.');

console.log(`Releasing ${pkg.version} → ${version}${dry ? ' (dry run)' : ''}`);

// 2. Build and test
run('npm', ['run', 'build'], 'Build');
run('npm', ['test'], 'Unit tests');
if (!skipE2e) run('npm', ['run', 'e2e'], 'Browser tests');

if (dry) {
  console.log(`\n✓ Dry run passed. A real run would release v${version} and push it; the server then deploys it.`);
  process.exit(0);
}

// 3. Version, changelog, commit, tag, push
changedFiles = true;
pkg.version = version;
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
lock.version = version;
if (lock.packages?.['']) lock.packages[''].version = version;
writeFileSync('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`);
writeFileSync('CHANGELOG.md', changelog);
run('git', ['add', 'package.json', 'package-lock.json', 'CHANGELOG.md'], 'Stage the version');
run('git', ['commit', '-q', '-m', `Release v${version}`], 'Commit');
changedFiles = false; // committed: from here a failure leaves the commit in place, to push or fix by hand
run('git', ['tag', '-a', `v${version}`, '-m', `Englio ${version}`], 'Tag');
run('git', ['push', '--follow-tags', 'origin', BRANCH], 'Push to GitHub');

// 4. The server deploys new commits on main by itself within a minute or two (deploy/autodeploy.sh); wait until it's live.
if (noDeploy) {
  console.log(`
✓ v${version} is on GitHub; the server will put it online by itself.`);
  process.exit(0);
}
console.log(`
▶ Waiting for ${URL_} to run v${version} (the server builds and tests it first; about 2 minutes)`);
for (let i = 0; i < 40; i++) {
  await new Promise((done) => setTimeout(done, 15_000));
  const live = await fetch(`${URL_}/api/health`).then((r) => r.json()).catch(() => null);
  if (live?.version === version) {
    console.log(`
✓ Englio ${version} is live at ${URL_}`);
    process.exit(0);
  }
}
stop(`v${version} is on GitHub, but ${URL_} isn't running it after 10 minutes. See why on the server: journalctl -t englio-deploy -n 80`);
