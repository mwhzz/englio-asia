#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 24.04 server for Englio (app + API on one domain, HTTPS by Caddy).
# Step-by-step guide in Bangla: docs/DEPLOY_BN.md.
#
#   git clone <repo> /opt/englio && cd /opt/englio
#   sudo bash deploy/setup.sh app.example.com [you@example.com]
#
# The email is optional: Let's Encrypt uses it for certificate warnings, push services to reach you.
#
# Safe to run again (e.g. to move to a new domain): it keeps the database, media, admin token and push keys.
set -euo pipefail

DOMAIN=${1:?Usage: sudo bash deploy/setup.sh <domain> [email]}
EMAIL=${2:-}
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a   # no questions during installs
APP_DIR=/opt/englio
DATA=/var/lib/englio
ENV_FILE=/etc/englio.env

[ "$(id -u)" = 0 ] || { echo "Run with sudo."; exit 1; }
[ -f "$APP_DIR/package.json" ] || { echo "Clone the code into $APP_DIR first (see docs/DEPLOY_BN.md)."; exit 1; }

echo "==> Swap (so building works on a 1 GB server)"
if ! swapon --show | grep -q .; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Packages: Node 24, Caddy, sqlite3, firewall"
apt-get update
apt-get install -y curl git sqlite3 ufw gnupg debian-keyring debian-archive-keyring apt-transport-https
if ! node -v 2>/dev/null | grep -q '^v24'; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update && apt-get install -y caddy
fi

echo "==> User and data folder"
id englio >/dev/null 2>&1 || useradd --system --home "$DATA" --shell /usr/sbin/nologin englio
mkdir -p "$DATA/media" /var/backups/englio
chown -R englio:englio "$DATA" && chmod 750 "$DATA"

echo "==> Install packages and make keys"
cd "$APP_DIR"
npm ci
npm install --no-save web-push
if [ ! -f "$ENV_FILE" ]; then
  read -r VAPID_PUBLIC VAPID_PRIVATE < <(node -e "const k=require('web-push').generateVAPIDKeys();console.log(k.publicKey,k.privateKey)")
  cat > "$ENV_FILE" <<EOF
ADMIN_TOKEN=$(openssl rand -hex 24)
VAPID_PUBLIC_KEY=$VAPID_PUBLIC
VAPID_PRIVATE_KEY=$VAPID_PRIVATE
PORT=8787
TRUST_PROXY=1
DB_PATH=$DATA/englio.db
MEDIA_DIR=$DATA/media
EOF
fi
# Domain settings: replaced on every run, so running setup again with a new domain moves the site.
sed -i '/^\(DOMAIN\|APP_URL\|PUBLIC_API_URL\|VAPID_SUBJECT\)=/d' "$ENV_FILE"
cat >> "$ENV_FILE" <<EOF
DOMAIN=$DOMAIN
APP_URL=https://$DOMAIN
PUBLIC_API_URL=https://$DOMAIN/api
VAPID_SUBJECT=$([ -n "$EMAIL" ] && echo "mailto:$EMAIL" || echo "https://$DOMAIN")
EOF
chown root:englio "$ENV_FILE" && chmod 640 "$ENV_FILE"

echo "==> API service"
cat > /etc/systemd/system/englio-api.service <<EOF
[Unit]
Description=Englio API
After=network.target

[Service]
User=englio
EnvironmentFile=$ENV_FILE
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server/main.ts
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable englio-api

echo "==> Web server (HTTPS certificate is fetched automatically)"
GLOBAL=""
[ -n "$EMAIL" ] && GLOBAL=$(printf '{\n\temail %s\n}\n' "$EMAIL")
cat > /etc/caddy/Caddyfile <<EOF
$GLOBAL

$DOMAIN {
	encode zstd gzip
	handle /api/* {
		reverse_proxy 127.0.0.1:8787
	}
	handle {
		root * $APP_DIR/dist
		# Built files have a hash in their name, so they never change; everything else is re-checked, so updates show up at once.
		@hashed path /assets/*
		@other not path /assets/*
		header @hashed Cache-Control "public, max-age=31536000, immutable"
		header @other Cache-Control "no-cache"
		header /manifest.webmanifest Content-Type "application/manifest+json"
		try_files {path} /index.html
		file_server
	}
}
EOF

echo "==> Auto-deploy: check GitHub every 15 seconds"
cat > /etc/systemd/system/englio-deploy.service <<EOF
[Unit]
Description=Englio: deploy a new commit from GitHub

[Service]
Type=oneshot
ExecStart=/usr/bin/bash $APP_DIR/deploy/autodeploy.sh
EOF
cat > /etc/systemd/system/englio-deploy.timer <<EOF
[Unit]
Description=Englio: check GitHub for a new commit every 15 seconds

[Timer]
OnBootSec=30s
OnUnitInactiveSec=15s
AccuracySec=1s

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now englio-deploy.timer

echo "==> Hourly reminders and a nightly backup"
cat > /etc/cron.d/englio <<EOF
5 * * * * englio set -a; . $ENV_FILE; set +a; cd $APP_DIR && node server/sendReminders.ts 2>&1 | logger -t englio-reminders
30 3 * * * root bash $APP_DIR/deploy/backup.sh 2>&1 | logger -t englio-backup
EOF

echo "==> Firewall: only SSH and web"
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

bash "$APP_DIR/deploy/update.sh" --no-pull
systemctl reload caddy || systemctl restart caddy

set -a; . "$ENV_FILE"; set +a
cat <<EOF

Done. Open https://$DOMAIN (the certificate can take a minute the first time).
Admin panel: https://$DOMAIN/admin.html
Admin token (keep it secret, it is also in $ENV_FILE): $ADMIN_TOKEN
EOF
