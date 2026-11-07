#!/usr/bin/env bash
# Zaxiradan tiklash. DIQQAT: hozirgi baza va rasmlar shu nusxa bilan almashtiriladi.
#   bash deploy/restore.sh /srv/chorrom-backups/db-2026-11-06.dump /srv/chorrom-backups/uploads-2026-11-06.tar.gz
set -euo pipefail
cd "$(dirname "$0")/.."
DUMP=${1:?baza nusxasi kerak: db-SANA.dump}
UPLOADS=${2:?rasmlar nusxasi kerak: uploads-SANA.tar.gz}
[ -s "$DUMP" ] && [ -s "$UPLOADS" ] || { echo "Fayl yo'q yoki bo'sh"; exit 1; }
ENV_FILE=${ENV_FILE:-deploy/.env}
COMPOSE=(docker compose -p "${COMPOSE_PROJECT_NAME:-chorrom}" -f deploy/docker-compose.yml --env-file "$ENV_FILE")

if [ "${RESTORE_YES:-}" != 1 ]; then
  read -r -p "Hozirgi baza va rasmlar almashtiriladi. Davom etilsinmi? (ha/yo'q) " answer
  [ "$answer" = ha ] || { echo "Bekor qilindi"; exit 1; }
fi

# Tiklash paytida API bazaga yozmasin; rasmlar papkasini yangi konteyner tiklaydi
"${COMPOSE[@]}" stop api web
"${COMPOSE[@]}" exec -T db pg_restore -U chorrom -d chorrom --clean --if-exists --no-owner < "$DUMP"
"${COMPOSE[@]}" run --rm --no-deps -T --entrypoint bash api -c 'find /data/uploads -mindepth 1 -delete && tar -xzf - -C /data' < "$UPLOADS"
"${COMPOSE[@]}" up -d --wait --wait-timeout 300 api web
echo "Tiklandi. Sahifalarni yangi ma'lumot bilan chizish uchun: bash deploy/deploy.sh"
