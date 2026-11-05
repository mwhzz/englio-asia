#!/usr/bin/env bash
# Nightly copy of the database and uploaded media into /var/backups/englio (keeps 14 days).
# Runs from cron (see setup.sh). Keep a copy off the server too, see docs/DEPLOY_BN.md.
set -euo pipefail

set -a; . /etc/englio.env; set +a
OUT=/var/backups/englio
mkdir -p "$OUT/media"
chmod 700 "$OUT"   # learners' data: root only

sqlite3 "$DB_PATH" ".backup '$OUT/englio-$(date +%F).db'"
cp -ru "$MEDIA_DIR/." "$OUT/media/"
find "$OUT" -maxdepth 1 -name 'englio-*.db' -mtime +14 -delete
echo "Backed up to $OUT/englio-$(date +%F).db"
