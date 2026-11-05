#!/usr/bin/env bash
# Run every 15 seconds by the englio-deploy timer (see setup.sh): when GitHub's main has a new commit,
# deploys it with update.sh. A commit that failed to deploy isn't retried; the next new commit is tried as usual.
# Logs: journalctl -u englio-deploy -n 80 · history: /var/lib/englio/deploys.log
set -euo pipefail

APP_DIR=/opt/englio
FAILED=/var/lib/englio/.deploy-failed
cd "$APP_DIR"
[ -d .git ] || exit 0

git fetch -q origin main
NEW=$(git rev-parse origin/main)
[ "$NEW" = "$(git rev-parse HEAD)" ] && exit 0
[ -f "$FAILED" ] && [ "$(cat "$FAILED")" = "$NEW" ] && exit 0

echo "New commit on GitHub: $(git log -1 --format='%h %s' "$NEW"). Deploying…"
if bash "$APP_DIR/deploy/update.sh"; then
  rm -f "$FAILED"
else
  echo "$NEW" > "$FAILED"
  exit 1
fi
