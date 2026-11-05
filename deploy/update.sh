#!/usr/bin/env bash
# Puts the latest code online: pull, build, restart. Learners' data is untouched.
#
#   sudo bash /opt/englio/deploy/update.sh
set -euo pipefail

APP_DIR=/opt/englio
ENV_FILE=/etc/englio.env
cd "$APP_DIR"
set -a; . "$ENV_FILE"; set +a

# Pulls from GitHub when the code was cloned; code uploaded as a folder (no .git) is used as it is.
if [ "${1:-}" != "--no-pull" ] && [ -d .git ]; then git pull --ff-only; fi
npm ci
npm install --no-save web-push   # the reminder sender's one extra package
VITE_VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" npm run build

# First time only: fill the database with the built-in course (no demo learners).
if [ ! -f "$DB_PATH" ]; then
  node server/seedMain.ts --no-demo
  chown englio:englio "$DB_PATH"*
fi

systemctl restart englio-api
echo "Updated: $( [ -d .git ] && git log -1 --format='%h %s' || date '+%F %T' )"
