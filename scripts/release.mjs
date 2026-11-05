// `npm run release -- patch|minor|major [--dry-run] [--skip-e2e] [--no-deploy]`
//
// Puts a new version of Englio online, safely:
//  1. checks you're on `main`, everything is committed, and CHANGELOG.md says what changed (under "## Unreleased");
//  2. builds and runs every test (stops if anything fails, so nothing broken goes online);
//  3. raises the version in package.json (patch 1.0.0→1.0.1 for fixes, minor →1.1.0 for features, major →2.0.0),
//     dates the changelog entry, commits, tags vX.Y.Z and pushes to GitHub;
//  4. runs deploy/update.sh on the server over SSH (it asks for the server password) and checks the site answers.
//
// --dry-run does the checks and tests and prints what would happen, changing nothing.
// The server and site can be changed with DEPLOY_HOST (default root@165.22.253.84) and DEPLOY_URL (default https://webpstudio.com).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dateChangelog, nextVersion } from './releaseVersion.mjs';

const HOST = process.env.DEPLOY_HOST ?? 'root@165.22.253.84';
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

/** Runs a command with its output shown; stops the release if it fails. */
function run(cmd, cmdArgs, what) {
  console.log(`\n▶ ${what}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) stop(`${what} failed. Nothing was released.`);
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
const day = new Date().toISOString().slice(0, 10);
const changelog = dateChangelog(readFileSync('CHANGELOG.md', 'utf8'), version, day);
if (!changelog) stop('CHANGELOG.md has nothing under "## Unreleased". Write a line or two about what changed first.');

console.log(`Releasing ${pkg.version} → ${version}${dry ? ' (dry run)' : ''}`);

// 2. Build and test
run('npm', ['run', 'build'], 'Build');
run('npm', ['test'], 'Unit tests');
if (!skipE2e) run('npm', ['run', 'e2e'], 'Browser tests');

if (dry) {
  console.log(`\n✓ Dry run passed. A real run would release v${version}, push it, and deploy to ${HOST}.`);
  process.exit(0);
}

// 3. Version, changelog, commit, tag, push
pkg.version = version;
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
lock.version = version;
if (lock.packages?.['']) lock.packages[''].version = version;
writeFileSync('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`);
writeFileSync('CHANGELOG.md', changelog);
run('git', ['add', 'package.json', 'package-lock.json', 'CHANGELOG.md'], 'Stage the version');
run('git', ['commit', '-q', '-m', `Release v${version}`], 'Commit');
run('git', ['tag', '-a', `v${version}`, '-m', `Englio ${version}`], 'Tag');
run('git', ['push', '--follow-tags', 'origin', BRANCH], 'Push to GitHub');

// 4. Deploy
if (noDeploy) {
  console.log(`\n✓ v${version} is on GitHub. Deploy it with: ssh ${HOST} "bash /opt/englio/deploy/update.sh"`);
  process.exit(0);
}
run('ssh', [HOST, 'bash /opt/englio/deploy/update.sh'], `Deploy to ${HOST}`);
const health = await fetch(`${URL_}/api/health`).then((r) => r.ok).catch(() => false);
if (!health) stop(`v${version} was deployed, but ${URL_}/api/health doesn't answer. Check: ssh ${HOST} "journalctl -u englio-api -n 50"`);
console.log(`\n✓ Englio ${version} is live at ${URL_}`);
