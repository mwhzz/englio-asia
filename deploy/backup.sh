#!/usr/bin/env bash
# Nightly backup (cron, see setup.sh), or by hand: sudo bash /opt/englio/deploy/backup.sh
#  - the database, checked and compressed, into /var/backups/englio (last 7 days) and to the owner's
#    Telegram (off the server; set up with deploy/telegram-setup.sh), locked with BACKUP_PASSWORD if set;
#  - pictures and recordings copied into /var/backups/englio/media, and to Telegram on Fridays (and the first time).
# Bring one back with deploy/restore.sh.
set -euo pipefail

set -a; . /etc/englio.env; set +a
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=/var/backups/englio
DAY=$(date +%F)
mkdir -p "$OUT/media"
chmod 700 "$OUT"   # learners' data: root only
TMP=$(mktemp -d)
chmod 700 "$TMP"
trap 'rm -rf "$TMP"' EXIT

sqlite3 "$DB_PATH" ".backup '$TMP/englio-$DAY.db'"
# Check the copy before trusting it.
if [ "$(sqlite3 "$TMP/englio-$DAY.db" 'PRAGMA integrity_check;')" != "ok" ]; then
  bash "$HERE/telegram.sh" message "Englio backup FAILED on $DAY: the copy is damaged. Check the server."
  exit 1
fi
USERS=$(sqlite3 "$TMP/englio-$DAY.db" 'SELECT COUNT(*) FROM users;')
gzip -c "$TMP/englio-$DAY.db" > "$OUT/englio-$DAY.db.gz"
rm -f "$TMP/englio-$DAY.db"
cp -ru "$MEDIA_DIR/." "$OUT/media/"
find "$OUT" -maxdepth 1 -name 'englio-*' -mtime +7 -delete
echo "Backed up to $OUT/englio-$DAY.db.gz ($USERS learners)"

# Sends a file to Telegram: locked first if BACKUP_PASSWORD is set, in 45 MB parts if it's big (bots: 50 MB max).
send() {
  local file=$1 caption=$2
  if [ -n "${BACKUP_PASSWORD:-}" ]; then
    openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSWORD -in "$file" -out "$file.enc"
    file="$file.enc"
    caption="$caption (locked)"
  fi
  if [ "$(stat -c %s "$file")" -le 47000000 ]; then
    bash "$HERE/telegram.sh" file "$file" "$caption"
  else
    split -b 45m -d "$file" "$file.part"
    for part in "$file".part*; do bash "$HERE/telegram.sh" file "$part" "$caption, part ${part##*.part}"; done
  fi
}

if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  export BACKUP_PASSWORD="${BACKUP_PASSWORD:-}"
  cp "$OUT/englio-$DAY.db.gz" "$TMP/"
  send "$TMP/englio-$DAY.db.gz" "Englio database $DAY · $USERS learners"
  if [ "$(date +%u)" = 5 ] || [ ! -f /var/lib/englio/media-sent ]; then
    tar -czf "$TMP/englio-media-$DAY.tar.gz" -C "$MEDIA_DIR" .
    send "$TMP/englio-media-$DAY.tar.gz" "Englio pictures and recordings $DAY"
    touch /var/lib/englio/media-sent
  fi
fi

# /api/health reports how old this is, and watch.sh warns when it gets old.
touch /var/lib/englio/last-backup
