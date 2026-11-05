#!/usr/bin/env bash
# Puts the latest code online: pull, build, test, switch, restart. Learners' data is untouched.
# Runs by itself within ~15 s of a new commit on GitHub's main (deploy/autodeploy.sh), or by hand:
#
#   sudo bash /opt/englio/deploy/update.sh            # pull from GitHub, then deploy
#   sudo bash /opt/englio/deploy/update.sh --no-pull  # deploy the code that's already here
#
# Safe and instant:
#  - each version is built into its own folder (releases/<time>-<commit>) and the tests run before anything changes;
#  - the live site then switches to it in one step (an atomic symlink swap), so visitors never see a half-built site;
#  - if anything fails, the code goes back to the previous commit and the live site isn't touched;
#  - the last 3 versions are kept, so going back is instant too (see docs/DEPLOY_BN.md);
#  - every deploy is written to /var/lib/englio/deploys.log (time, commit, version, OK or FAILED and why).
set -euo pipefail

APP_DIR=/opt/englio
ENV_FILE=/etc/englio.env
HISTORY=/var/lib/englio/deploys.log
KEEP=3
cd "$APP_DIR"
set -a; . "$ENV_FILE"; set +a

STEP="start"
PREV=""
[ -d .git ] && PREV=$(git rev-parse HEAD)
commit() { [ -d .git ] && git log -1 --format='%h %s' || echo "(no git)"; }
history() { echo "$(date '+%F %T') $1 $(commit)" >> "$HISTORY"; }

rollback() {
  local failed
  failed=$(commit)
  echo "✗ Deploy failed at: $STEP. The live site was not changed."
  rm -rf dist-next
  if [ -n "$PREV" ]; then git reset -q --hard "$PREV"; fi
  echo "$(date '+%F %T') FAILED($STEP) $failed" >> "$HISTORY"
  echo "  Code is back at $(commit)."
}
trap rollback ERR

# 1. Get the code (only when it was cloned from GitHub; an uploaded folder is used as it is).
STEP="pull"
if [ "${1:-}" != "--no-pull" ] && [ -d .git ]; then
  git fetch -q origin main
  git reset -q --hard origin/main
fi
CHANGED=""
[ -n "$PREV" ] && CHANGED=$(git diff --name-only "$PREV" HEAD)

# 2. Packages: only when they changed (that's what makes most deploys take seconds, not minutes).
STEP="install"
if [ ! -d node_modules ] || [ -z "$PREV" ] || [ "${1:-}" = "--no-pull" ] || echo "$CHANGED" | grep -qx 'package-lock.json'; then
  npm ci --no-audit --no-fund
  npm install --no-save --no-audit --no-fund web-push   # the reminder sender's one extra package
fi

# 3. Build next to the live site, and test. Nothing live has changed yet.
STEP="build"
VITE_VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" npm run build -- --outDir dist-next --emptyOutDir
STEP="tests"
npm test

# First time only: fill the database with the built-in course (no demo learners).
STEP="database"
if [ ! -f "$DB_PATH" ]; then
  node server/seedMain.ts --no-demo
  chown englio:englio "$DB_PATH"*
fi

# 4. Switch the live site in one step.
STEP="switch"
mkdir -p releases
RELEASE="releases/$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo local)"
mv dist-next "$RELEASE"
if [ -d dist ] && [ ! -L dist ]; then mv dist "releases/00000000-000000-first"; fi   # the old plain folder, once
ln -sfn "$RELEASE" dist.tmp && mv -Tf dist.tmp dist

# 5. Restart the API only when its code or the version changed (a restart drops requests for about a second).
STEP="restart"
if [ -z "$PREV" ] || [ "${1:-}" = "--no-pull" ] || echo "$CHANGED" | grep -qE '^(server/|package\.json$|package-lock\.json$)'; then
  systemctl restart englio-api
fi

trap - ERR
# Keep the newest few versions (the live one is always among them).
ls -1d releases/*/ 2>/dev/null | sort | head -n -"$KEEP" | xargs -r rm -rf
history "OK v$(node -p "require('./package.json').version")"
echo "✓ Live: $(commit)"
