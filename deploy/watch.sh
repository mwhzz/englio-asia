#!/usr/bin/env bash
# Every 5 minutes (cron): is the site up, is the disk or memory running out, is the backup recent?
# Sends a Telegram message when something goes wrong, and once when it's fine again (not every 5 minutes).
set -uo pipefail
set -a; . /etc/englio.env; set +a
HERE=$(cd "$(dirname "$0")" && pwd)
STATE=/var/lib/englio/watch-state
problems=()

if health=$(curl -fsS --max-time 10 "https://${DOMAIN}/api/health" 2>/dev/null); then
  age=$(printf '%s' "$health" | grep -o '"backupAgeHours":[0-9]*' | cut -d: -f2)
  if [ -n "$age" ] && [ "$age" -gt 30 ]; then problems+=("the last backup is ${age} hours old"); fi
else
  problems+=("the site or API is not answering (https://${DOMAIN}/api/health)")
fi
disk=$(df --output=pcent / | tail -1 | tr -dc 0-9)
if [ "$disk" -ge 85 ]; then problems+=("the disk is ${disk}% full"); fi
mem=$(free -m | awk '/Mem:/ {print $7}')
if [ "$mem" -lt 80 ]; then problems+=("only ${mem} MB of memory left"); fi

now=$(IFS=';'; echo "${problems[*]:-}")
before=$(cat "$STATE" 2>/dev/null || true)
if [ "$now" != "$before" ]; then
  if [ -n "$now" ]; then
    bash "$HERE/telegram.sh" message "Englio problem: ${now//;/; }"
  else
    bash "$HERE/telegram.sh" message "Englio is fine again."
  fi
  echo "$now" > "$STATE"
fi
