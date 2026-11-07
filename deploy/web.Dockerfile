# CHORROM frontend. Kontekst — repo ildizi (.dockerignore shu yerda).

# builder: sahifalar API ma'lumoti bilan chizilishi kerak, API esa faqat compose tarmog'ida.
# Shuning uchun build image yig'ilayotganda emas, konteyner ishga tushganda bajariladi (docker compose run builder).
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Avval yangi assets, keyin HTML: ochiq turgan sayt yangilanish paytida buzilmaydi. Eski assets 7 kun saqlanadi
# (eski sahifani ochib turgan mehmonlar uchun). .vite — build manifesti, saytda kerak emas.
CMD ["sh", "-c", "npm run build && mkdir -p /out/assets && cp -a dist/assets/. /out/assets/ && rm -rf dist/assets dist/.vite && cp -a dist/. /out/ && find /out/assets -type f -mtime +7 -delete"]

FROM nginx:1.27-alpine AS web
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

FROM caddy:2-alpine AS caddy
COPY deploy/Caddyfile /etc/caddy/Caddyfile
