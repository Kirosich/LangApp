#!/usr/bin/env bash
# Nightly DB backup, run via cron on the host (not inside the container).
# Delegates the actual .backup() call to server/scripts/backup-db.js,
# which runs inside the app container where better-sqlite3 is already
# compiled and can reach the live database.
set -euo pipefail

docker exec langapp-app-1 node scripts/backup-db.js
