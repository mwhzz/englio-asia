#!/usr/bin/env bash
# Sends a message or a file to the owner's Telegram (a bot made with @BotFather).
# Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in /etc/englio.env (set them with deploy/telegram-setup.sh).
#   telegram.sh message "text"
#   telegram.sh file /path/to/file "caption"
# Does nothing (and says so) when Telegram isn't set up, so backups and checks still run without it.
set -uo pipefail

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] && [ -r /etc/englio.env ]; then set -a; . /etc/englio.env; set +a; fi
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "Telegram is not set up (run deploy/telegram-setup.sh); skipped."
  exit 0
fi
API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

case "${1:-}" in
  message)
    curl -fsS --max-time 30 -o /dev/null "$API/sendMessage" -d chat_id="$TELEGRAM_CHAT_ID" --data-urlencode text="${2:-}" \
      || { echo "Telegram message failed"; exit 1; }
    ;;
  file)
    curl -fsS --max-time 600 -o /dev/null "$API/sendDocument" -F chat_id="$TELEGRAM_CHAT_ID" -F document=@"$2" -F caption="${3:-}" \
      || { echo "Telegram upload failed: $2"; exit 1; }
    ;;
  *)
    echo "usage: telegram.sh message TEXT | file PATH [CAPTION]"
    exit 2
    ;;
esac
