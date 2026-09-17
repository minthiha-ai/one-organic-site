#!/bin/bash
# Pull-based deploy, run on a schedule via cPanel cron (see README's Backend
# CI/CD section). Exists because GitHub Actions' inbound SSH to Bluehost is
# blocked at the network edge (2026-09-17, still open with Bluehost support)
# — this avoids inbound SSH entirely by having the server pull from GitHub
# itself, over the same outbound connection `git pull` already uses.
set -e
cd ~/repositories/one-organic-platform

LOCKFILE=~/deploy.lock
if [ -f "$LOCKFILE" ]; then
  echo "$(date -u +%FT%TZ): deploy already in progress, skipping"
  exit 0
fi
trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

BEFORE=$(git rev-parse HEAD)
git pull origin master
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  exit 0
fi

echo "$(date -u +%FT%TZ): deploying $BEFORE -> $AFTER"
cd backend
/opt/cpanel/composer/bin/composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan filament:clear-cached-components
php artisan optimize:clear
echo "$(date -u +%FT%TZ): deploy complete"
