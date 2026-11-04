#!/usr/bin/env bash
# CHORROM'ni serverda yangilash/ishga tushirish. Repo ildizidan ishga tushiring:  bash deploy/deploy.sh
# 1) Baza + Java API (docker compose)  2) Frontend build (sahifalar API ma'lumoti bilan oldindan chiziladi)
# 3) dist → WEB_ROOT (host nginx beradi)
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=deploy/.env
[ -f "$ENV_FILE" ] || { echo "deploy/.env yo'q: deploy/.env.example dan nusxa olib to'ldiring"; exit 1; }
set -a; . "$ENV_FILE"; set +a
DATA_DIR=${DATA_DIR:-/srv/chorrom}
API_PORT=${API_PORT:-8090}
WEB_ROOT=${WEB_ROOT:-/var/www/chorrom}

echo "== Papkalar: $DATA_DIR"
mkdir -p "$DATA_DIR/postgres" "$DATA_DIR/uploads" "$WEB_ROOT"
# API konteyneri 10001 foydalanuvchisi nomidan rasmlarni yozadi
chown -R 10001:10001 "$DATA_DIR/uploads"

echo "== Baza va API"
docker compose -f deploy/docker-compose.yml --env-file "$ENV_FILE" up -d --build

echo "== API tayyor bo'lishini kutish"
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$API_PORT/actuator/health" | grep -q UP; then echo "API: UP"; break; fi
  [ "$i" = 60 ] && { echo "API ishga tushmadi:"; docker compose -f deploy/docker-compose.yml logs --tail=80 api; exit 1; }
  sleep 3
done

echo "== Frontend build (Node konteynerida)"
docker run --rm --network host \
  -v "$PWD":/app -w /app \
  -e PRERENDER_API_URL="http://127.0.0.1:$API_PORT" \
  node:20-bookworm-slim sh -c "npm ci --no-audit --no-fund && npm run build"

echo "== Saytni joylash: $WEB_ROOT"
rsync -a --delete dist/ "$WEB_ROOT"/

echo "Tayyor. Tekshirish: curl -I http://127.0.0.1/ -H 'Host: chorrom.uz'"
