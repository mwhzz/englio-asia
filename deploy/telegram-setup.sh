#!/usr/bin/env bash
# One-time: connects the server to your Telegram, for backups and "site is down" alerts.
#   1. In Telegram, open @BotFather, send /newbot, pick a name; it gives you a token.
#   2. Open your new bot and send it any message (e.g. "hi").
#   3. On the server: sudo bash /opt/englio/deploy/telegram-setup.sh
# It asks for the token (not shown on screen), finds your chat, saves both in /etc/englio.env and sends a test.
set -euo pipefail
ENV_FILE=/etc/englio.env
HERE=$(cd "$(dirname "$0")" && pwd)
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }

read -rsp "Bot token from @BotFather: " TOKEN
echo
[ -n "$TOKEN" ] || { echo "No token given"; exit 1; }
UPDATES=$(curl -fsS "https://api.telegram.org/bot${TOKEN}/getUpdates") || { echo "Telegram did not accept that token"; exit 1; }
CHAT=$(printf '%s' "$UPDATES" | python3 "$HERE/telegram-chat.py")
[ -n "$CHAT" ] || { echo "No message found: open your bot in Telegram, send it 'hi', then run this again"; exit 1; }

read -rsp "A password to lock the backup files (empty = not locked; keep it safe, it is needed to restore): " PASS
echo

sed -i '/^\(TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID\|BACKUP_PASSWORD\)=/d' "$ENV_FILE"
{
  echo "TELEGRAM_BOT_TOKEN=$TOKEN"
  echo "TELEGRAM_CHAT_ID=$CHAT"
  if [ -n "$PASS" ]; then echo "BACKUP_PASSWORD=$PASS"; fi
} >> "$ENV_FILE"
chown root:englio "$ENV_FILE" && chmod 640 "$ENV_FILE"

TELEGRAM_BOT_TOKEN=$TOKEN TELEGRAM_CHAT_ID=$CHAT bash "$HERE/telegram.sh" message "Englio server connected. Backups and alerts will come here."
echo "Done. Check Telegram for the test message. Send a backup now with: sudo bash /opt/englio/deploy/backup.sh"
