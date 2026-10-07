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
# Explicit CLI php binary for everything below — cron's PATH is more
# restricted than an interactive SSH shell's, and composer's own shebang
# resolving the wrong (CGI-mode) php here caused a real failed deploy on
# 2026-09-17 ("Composer cannot be run safely on non-CLI SAPIs"). This is
# the same binary already proven correct for cron in the schedule:run entry.
PHP_BIN=/usr/local/bin/php
"$PHP_BIN" /opt/cpanel/composer/bin/composer install --no-dev --optimize-autoloader --no-interaction
"$PHP_BIN" artisan migrate --force
"$PHP_BIN" artisan filament:clear-cached-components
# Rebuild (not just clear) the config/route/event/view caches so requests
# don't re-parse them on a slow shared host. Consequence: a later edit to
# .env has no effect until `php artisan optimize` is re-run.
"$PHP_BIN" artisan optimize
echo "$(date -u +%FT%TZ): deploy complete"
