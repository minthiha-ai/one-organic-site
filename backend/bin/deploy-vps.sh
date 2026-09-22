#!/bin/bash
# Push-triggered deploy for the DigitalOcean droplet, called over SSH by
# .github/workflows/deploy-backend.yml. Bluehost's inbound-SSH block doesn't
# apply here — we control this box — so this is a normal push-to-deploy
# script, not the pull-based cron workaround in bin/deploy.sh (Bluehost's
# script, kept only as a rollback reference during the migration window).
set -euo pipefail

LOCKFILE=/var/lock/one-organic-deploy.lock
exec 200>"$LOCKFILE"
flock -n 200 || { echo "$(date -u +%FT%TZ): deploy already in progress, skipping"; exit 0; }

cd /var/www/one-organic

BEFORE=$(git rev-parse HEAD)
git pull origin master
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  exit 0
fi

echo "$(date -u +%FT%TZ): deploying $BEFORE -> $AFTER"
cd backend

composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan filament:cache-components
php artisan queue:restart

# opcache.validate_timestamps=0 means new code isn't picked up without this.
sudo systemctl reload php8.3-fpm

echo "$(date -u +%FT%TZ): deploy complete"
