#!/usr/bin/env bash
# Puts the latest code online: pull, build, test, switch, restart. Learners' data is untouched.
# Runs by itself every minute when GitHub's main has a new commit (deploy/autodeploy.sh), or by hand:
#
#   sudo bash /opt/englio/deploy/update.sh            # pull from GitHub, then deploy
#   sudo bash /opt/englio/deploy/update.sh --no-pull  # deploy the code that's already here
#
# Safe: the new app is built next to the live one and only swapped in after the build and the tests pass.
# If anything fails, the code goes back to the previous commit and the site keeps running as it was.
set -euo pipefail

APP_DIR=/opt/englio
ENV_FILE=/etc/englio.env
cd "$APP_DIR"
set -a; . "$ENV_FILE"; set +a

PREV=""
[ -d .git ] && PREV=$(git rev-parse HEAD)
rollback() {
  echo "✗ Deploy failed: the live site was not changed."
  if [ -n "$PREV" ]; then git reset -q --hard "$PREV" && echo "  Code is back at $(git log -1 --format='%h %s')."; fi
  rm -rf dist-next
}
trap rollback ERR

# Pulls from GitHub when the code was cloned; code uploaded as a folder (no .git) is used as it is.
if [ "${1:-}" != "--no-pull" ] && [ -d .git ]; then
  git fetch -q origin main
  git reset -q --hard origin/main
fi

npm ci --no-audit --no-fund
npm install --no-save --no-audit --no-fund web-push   # the reminder sender's one extra package
VITE_VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" npm run build -- --outDir dist-next --emptyOutDir
npm test

# First time only: fill the database with the built-in course (no demo learners).
if [ ! -f "$DB_PATH" ]; then
  node server/seedMain.ts --no-demo
  chown englio:englio "$DB_PATH"*
fi

# Everything passed: switch to the new app and restart the API.
trap - ERR
rm -rf dist-old
[ -d dist ] && mv dist dist-old
mv dist-next dist
rm -rf dist-old
systemctl restart englio-api
echo "✓ Updated: $( [ -d .git ] && git log -1 --format='%h %s' || date '+%F %T' )"
