/**
 * A short message to the owner's Telegram (the same bot as backups and alerts: TELEGRAM_BOT_TOKEN and
 * TELEGRAM_CHAT_ID in /etc/englio.env). Used for new learner reports. Quiet when Telegram isn't set up,
 * and at most 30 messages an hour, so a flood of reports can't flood the phone.
 */
const MAX_PER_HOUR = 30;
let hour = 0;
let sent = 0;
let skipped = 0;

export function notifyOwner(text: string, now = Date.now()): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const h = Math.floor(now / 3_600_000);
  if (h !== hour) {
    if (skipped) text = `${text}\n(+${skipped} more in the last hour, see the admin)`;
    hour = h;
    sent = 0;
    skipped = 0;
  }
  if (sent >= MAX_PER_HOUR) {
    skipped++;
    return;
  }
  sent++;
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: text.slice(0, 3500) }),
  }).catch(() => undefined);
}
