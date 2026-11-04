# CHORROM — sayt va admin panel

Buxoro, deraza/eshik/pergola ishlab chiqaruvchi CHORROM sayti.

| Qism | Texnologiya | Papka |
|---|---|---|
| Sayt + admin panel | React 18, Vite, TypeScript, Tailwind (faqat admin) | `src/` |
| Sahifalarni oldindan chizish | React SSR (build vaqtida) + hydrate | `src/entry-server.tsx`, `scripts/prerender.mjs` |
| Backend | Java 21, Spring Boot 3, PostgreSQL 16, Flyway | `backend/` |
| Serverga joylash | Docker Compose + nginx | `deploy/` (qo'llanma: `deploy/README.md`) |

## Lokal ishga tushirish

```bash
# 1) Baza va API (Docker)
docker network create chorrom-dev
docker run -d --name chorrom-dev-db --network chorrom-dev -e POSTGRES_DB=chorrom -e POSTGRES_USER=chorrom -e POSTGRES_PASSWORD=devpass postgres:16-alpine
docker build -t chorrom-api:dev backend
docker run -d --name chorrom-dev-api --network chorrom-dev -p 127.0.0.1:18080:8080 \
  -e DB_URL=jdbc:postgresql://chorrom-dev-db:5432/chorrom -e DB_PASSWORD=devpass \
  -e JWT_SECRET=local-dev-secret-local-dev-secret-0123456789 \
  -e ADMIN_EMAIL=admin@chorrom.uz -e ADMIN_PASSWORD=devadmin123 chorrom-api:dev

# 2) Frontend (Vite /api va /uploads ni 127.0.0.1:18080 ga uzatadi)
npm ci
npm run dev                                   # http://localhost:8080
PRERENDER_API_URL=http://127.0.0.1:18080 npm run build && npx vite preview
```

Admin panel: `/admin` (kirish: `/admin/auth`).

## Kontent qayerda boshqariladi

- **Matnlar (UZ/RU)** — standart qiymatlar `src/content/pages/*.ts`, admin o'zgartirgani `site_content` jadvalida.
  Saytda admin "Tahrirlash" rejimida matn ustiga bosib o'zgartiradi yoki admin → "Sayt matnlari".
- **Ro'yxatlar** (statistika, ishlar, jamoa, sharhlar, savol-javoblar) — admin → "Ro'yxatlar".
- **Narxlar** (kalkulyator, katalog, tezkor karta, muddatli to'lov) — admin → "Narxlar" (`price_settings`).
- **Mahsulotlar va kategoriyalar** — admin → "Mahsulotlar", "Toifalar".
- **Arizalar** — saytdagi barcha formalar → admin → "Arizalar" (+ Telegram xabari).

`[N]`, `[Ism]` kabi to'ldirilmagan joylar mehmonlarga ko'rsatilmaydi.
