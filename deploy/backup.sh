#!/usr/bin/env bash
# Kunlik zaxira: baza (pg_dump) + rasmlar. cron:  15 3 * * * bash /opt/chorrom/deploy/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . deploy/.env; set +a
DATA_DIR=${DATA_DIR:-/srv/chorrom}
OUT="$DATA_DIR/backups"
mkdir -p "$OUT"
STAMP=$(date +%F)

docker compose -f deploy/docker-compose.yml --env-file deploy/.env exec -T db \
  pg_dump -U chorrom -d chorrom --format=custom > "$OUT/db-$STAMP.dump"
tar -czf "$OUT/uploads-$STAMP.tar.gz" -C "$DATA_DIR" uploads

# 14 kundan eskilarini o'chirish
find "$OUT" -type f -mtime +14 -delete
echo "Zaxira: $OUT/db-$STAMP.dump, $OUT/uploads-$STAMP.tar.gz"
