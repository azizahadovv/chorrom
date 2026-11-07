#!/usr/bin/env bash
# CHORROM'ni serverga o'rnatish va yangilash. Bir xil buyruq:  bash deploy/deploy.sh
# Serverda faqat Docker kerak. Birinchi marta deploy/.env ni o'zi yaratadi.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=${ENV_FILE:-deploy/.env}
PROJECT=${COMPOSE_PROJECT_NAME:-chorrom}

command -v docker >/dev/null || { echo "Docker o'rnatilmagan:  curl -fsSL https://get.docker.com | sh"; exit 1; }
docker compose version >/dev/null || { echo "docker compose yo'q: Docker'ni yangilang"; exit 1; }

random_hex() { od -An -tx1 -N"$1" /dev/urandom | tr -d ' \n'; }

# Bo'sh qiymatni tasodifiy parol bilan to'ldiradi
fill_secret() {
  local key=$1 bytes=$2
  if grep -q "^$key=$" "$ENV_FILE"; then
    sed -i "s/^$key=$/$key=$(random_hex "$bytes")/" "$ENV_FILE"
  fi
}

if [ ! -f "$ENV_FILE" ]; then
  cp deploy/.env.example "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "== $ENV_FILE yaratildi"
  NEW_ENV=1
fi
fill_secret DB_PASSWORD 24
fill_secret JWT_SECRET 32
fill_secret ADMIN_PASSWORD 9

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
DOMAIN=${DOMAIN:-chorrom.uz}
WEB_PORT=${WEB_PORT:-8088}
HTTPS_MODE=${HTTPS_MODE:-auto}

port_busy() { ss -ltnH "sport = :$1" 2>/dev/null | grep -q .; }

# Bizning caddy o'zi 80-portni band qilib turgan bo'lishi mumkin: bu "band" hisoblanmaydi
caddy_running() { [ -n "$(docker ps -q --filter "label=com.docker.compose.project=$PROJECT" --filter "label=com.docker.compose.service=caddy")" ]; }

if [ "$HTTPS_MODE" = auto ]; then
  if caddy_running || ! { port_busy 80 || port_busy 443; }; then
    HTTPS_MODE=caddy
  else
    HTTPS_MODE=host
  fi
fi

COMPOSE=(docker compose -p "$PROJECT" -f deploy/docker-compose.yml --env-file "$ENV_FILE")

echo "== Baza va API (birinchi marta import bilan bir necha daqiqa: rasmlar ko'chiriladi)"
"${COMPOSE[@]}" up -d --build --wait --wait-timeout 1200 db api || {
  "${COMPOSE[@]}" logs --tail=80 api
  echo "API ishga tushmadi: yuqoridagi log"
  exit 1
}

echo "== Sahifalarni chizish"
"${COMPOSE[@]}" --profile build build builder
"${COMPOSE[@]}" --profile build run --rm builder

echo "== Sayt"
if [ "$HTTPS_MODE" = caddy ]; then
  "${COMPOSE[@]}" --profile https up -d --build --wait --wait-timeout 120 web caddy
else
  "${COMPOSE[@]}" up -d --build --wait --wait-timeout 120 web
fi

echo "== Tekshirish"
for path in / /katalog /kalkulyator /api/public/settings; do
  # curl ulana olmasa ham skript xabarsiz to'xtamasin: pastdagi xato va loglar chiqsin
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "http://127.0.0.1:$WEB_PORT$path" || true)
  echo "  $path → $code"
  [ "$code" = 200 ] || { echo "Xato: $path javob bermadi"; "${COMPOSE[@]}" logs --tail=40 web api; exit 1; }
done

echo
if [ "${NEW_ENV:-}" = 1 ]; then
  echo "Admin paneli uchun (bir marta chiqadi, $ENV_FILE da ham bor):"
  echo "  Email: $ADMIN_EMAIL"
  echo "  Parol: $ADMIN_PASSWORD"
  echo
fi
if [ "$HTTPS_MODE" = caddy ]; then
  echo "Tayyor: https://$DOMAIN"
  echo "DNS: $DOMAIN va www.$DOMAIN A-yozuvi shu serverga qarashi kerak. Sertifikat DNS tarqalgach o'zi olinadi."
else
  echo "Sayt ishlayapti: 127.0.0.1:$WEB_PORT. 80/443 band, shuning uchun HTTPS host'dagi nginx orqali:"
  echo "  cp deploy/nginx-chorrom.conf /etc/nginx/sites-available/chorrom.conf"
  echo "  ln -sf /etc/nginx/sites-available/chorrom.conf /etc/nginx/sites-enabled/chorrom.conf"
  echo "  nginx -t && systemctl reload nginx"
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect"
  [ "$WEB_PORT" = 8088 ] || echo "  (nginx-chorrom.conf dagi 8088 ni $WEB_PORT ga almashtiring)"
fi
