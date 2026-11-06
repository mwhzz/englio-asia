#!/usr/bin/env bash
# Puts a backup back: the database from /var/backups/englio or a file saved from Telegram
# (.db, .db.gz, or a locked .enc; a backup in parts is joined first: cat f.part00 f.part01 > f).
#   sudo bash /opt/englio/deploy/restore.sh /root/englio-2026-11-06.db.gz --test   (checks it, changes nothing)
#   sudo bash /opt/englio/deploy/restore.sh /root/englio-2026-11-06.db.gz          (puts it live, asks first)
# The current database is kept as englio.db.before-restore-<time>, so a restore can be undone.
set -euo pipefail
FILE=${1:?usage: restore.sh <backup file> [--test]}
set -a; . /etc/englio.env; set +a
TMP=$(mktemp -d)
chmod 700 "$TMP"
trap 'rm -rf "$TMP"' EXIT

IN=$FILE
NAME=$FILE
if [[ $NAME == *.enc ]]; then
  if [ -z "${BACKUP_PASSWORD:-}" ]; then
    read -rsp "Backup password: " BACKUP_PASSWORD
    echo
  fi
  export BACKUP_PASSWORD
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSWORD -in "$IN" -out "$TMP/plain" || { echo "Wrong password or damaged file"; exit 1; }
  IN="$TMP/plain"
  NAME=${NAME%.enc}
fi
if [[ $NAME == *.gz ]]; then gunzip -c "$IN" > "$TMP/englio.db"; else cp "$IN" "$TMP/englio.db"; fi

[ "$(sqlite3 "$TMP/englio.db" 'PRAGMA integrity_check;')" = "ok" ] || { echo "This backup is damaged"; exit 1; }
echo "Backup is fine: $(sqlite3 "$TMP/englio.db" 'SELECT COUNT(*) FROM users;') learners, $(sqlite3 "$TMP/englio.db" 'SELECT COUNT(*) FROM lessons;') lessons."
if [ "${2:-}" = "--test" ]; then
  echo "Test only, nothing changed."
  exit 0
fi

read -rp "Replace the live database with it? Type yes: " OK
[ "$OK" = yes ] || { echo "Nothing changed."; exit 0; }
systemctl stop englio-api
KEEP="$DB_PATH.before-restore-$(date +%Y%m%d-%H%M%S)"
sqlite3 "$DB_PATH" ".backup '$KEEP'"
rm -f "$DB_PATH-wal" "$DB_PATH-shm"
install -o englio -g englio -m 640 "$TMP/englio.db" "$DB_PATH"
systemctl start englio-api
echo "Restored. The old database is kept as $KEEP"
