#!/usr/bin/env bash
# Kunlik zaxira: baza (pg_dump) + rasmlar. cron:  15 3 * * * bash /opt/chorrom/deploy/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=${ENV_FILE:-deploy/.env}
set -a; . "$ENV_FILE"; set +a
OUT=${BACKUP_DIR:-/srv/chorrom-backups}
mkdir -p "$OUT"
chmod 700 "$OUT"
STAMP=$(date +%F)
COMPOSE=(docker compose -p "${COMPOSE_PROJECT_NAME:-chorrom}" -f deploy/docker-compose.yml --env-file "$ENV_FILE")

"${COMPOSE[@]}" exec -T db pg_dump -U chorrom -d chorrom --format=custom > "$OUT/db-$STAMP.dump.tmp"
"${COMPOSE[@]}" exec -T api tar -czf - -C /data uploads > "$OUT/uploads-$STAMP.tar.gz.tmp"
# Yarim yozilgan nusxa to'liq nusxa bo'lib ko'rinmasin
mv "$OUT/db-$STAMP.dump.tmp" "$OUT/db-$STAMP.dump"
mv "$OUT/uploads-$STAMP.tar.gz.tmp" "$OUT/uploads-$STAMP.tar.gz"

# 14 kundan eskilarini o'chirish
find "$OUT" -type f -mtime +14 -delete
echo "Zaxira: $OUT/db-$STAMP.dump, $OUT/uploads-$STAMP.tar.gz"
