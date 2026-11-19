#!/bin/bash
# Pull-based deploy, run on a schedule via cPanel cron (see README's Backend
# CI/CD section). Exists because GitHub Actions' inbound SSH to Bluehost is
# blocked at the network edge (2026-09-17, still open with Bluehost support)
# — this avoids inbound SSH entirely by having the server pull from GitHub
# itself, over the same outbound connection `git pull` already uses.
#
# "Deployed" means every step below finished, and only then is the commit
# recorded in $STATE. A run that fails part-way (26.11.19: composer was gone
# after the server was rebuilt, so `migrate` never ran) is therefore retried
# on the next cron tick, instead of being skipped because `git pull` already
# brought the code in. The paths and PHP binary can be overridden by
# environment variables, which is how the script is tested.
set -e
REPO_DIR="${DEPLOY_REPO_DIR:-$HOME/repositories/one-organic-platform}"
LOCKFILE="${DEPLOY_LOCKFILE:-$HOME/deploy.lock}"
STATE="${DEPLOY_STATE_FILE:-$HOME/deploy.last-deployed}"
# Explicit CLI php binary for everything below — cron's PATH is more
# restricted than an interactive SSH shell's, and composer's own shebang
# resolving the wrong (CGI-mode) php here caused a real failed deploy on
# 2026-09-17 ("Composer cannot be run safely on non-CLI SAPIs"). This is
# the same binary already proven correct for cron in the schedule:run entry.
PHP_BIN="${PHP_BIN:-/usr/local/bin/php}"

cd "$REPO_DIR"

if [ -f "$LOCKFILE" ]; then
  echo "$(date -u +%FT%TZ): deploy already in progress, skipping"
  exit 0
fi
trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

git pull origin master
HEAD_SHA=$(git rev-parse HEAD)
DEPLOYED=$(cat "$STATE" 2>/dev/null || true)

if [ "$DEPLOYED" = "$HEAD_SHA" ]; then
  exit 0
fi

echo "$(date -u +%FT%TZ): deploying ${DEPLOYED:-<nothing recorded>} -> $HEAD_SHA"
cd backend

# composer only has to run when the dependencies changed since the last
# recorded deploy. With nothing recorded yet, assume an installed vendor/ is
# current rather than demanding composer.
NEED_COMPOSER=1
if [ -n "$DEPLOYED" ] && git cat-file -e "$DEPLOYED^{commit}" 2>/dev/null; then
  if git diff --quiet "$DEPLOYED" HEAD -- composer.json composer.lock; then NEED_COMPOSER=0; fi
elif [ -f vendor/autoload.php ]; then
  NEED_COMPOSER=0
fi

if [ "$NEED_COMPOSER" = 1 ]; then
  COMPOSER=""
  for candidate in "$(command -v composer 2>/dev/null || true)" /opt/cpanel/composer/bin/composer "$HOME/bin/composer" "$HOME/composer.phar" "$HOME/.composer/composer.phar"; do
    if [ -n "$candidate" ] && [ -f "$candidate" ]; then COMPOSER="$candidate"; break; fi
  done
  if [ -z "$COMPOSER" ]; then
    echo "$(date -u +%FT%TZ): ERROR composer.json/composer.lock changed but no composer was found (looked in PATH, /opt/cpanel/composer/bin, ~/bin, ~/composer.phar). Install composer, then this deploy retries on the next run." >&2
    exit 1
  fi
  "$PHP_BIN" "$COMPOSER" install --no-dev --optimize-autoloader --no-interaction
else
  echo "composer.json/composer.lock unchanged, skipping composer install"
fi

"$PHP_BIN" artisan migrate --force
"$PHP_BIN" artisan filament:clear-cached-components
# Rebuild (not just clear) the config/route/event/view caches so requests
# don't re-parse them on a slow shared host. Consequence: a later edit to
# .env has no effect until `php artisan optimize` is re-run.
"$PHP_BIN" artisan optimize

echo "$HEAD_SHA" > "$STATE"
echo "$(date -u +%FT%TZ): deploy complete"
