# CHORROM — serverga joylash (Hetzner, Docker + nginx)

Tarkib: **PostgreSQL 16** va **Java API** (Spring Boot) Docker'da, frontend (React, oldindan chizilgan sahifalar)
host'dagi **nginx** orqali. Serverda boshqa loyihalar bo'lishi mumkin, shuning uchun:
- API faqat `127.0.0.1:8090` da (tashqariga ochilmaydi), Postgres umuman port ochmaydi;
- xotira chegaralangan: Postgres 256 MB, API 768 MB (o'lchangan eng og'ir holat — import + 4 ta 12 MP rasm bir vaqtda — 577 MB).

## Birinchi o'rnatish

Serverda (root):

```bash
apt-get update && apt-get install -y git rsync nginx certbot python3-certbot-nginx
# Docker o'rnatilmagan bo'lsa:  curl -fsSL https://get.docker.com | sh

# Loyiha /opt/chorrom ga ko'chiriladi (kompyuterdan: rsync -a --exclude node_modules --exclude dist ./ root@SERVER:/opt/chorrom/)
cd /opt/chorrom
cp deploy/.env.example deploy/.env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$(openssl rand -hex 24)/; s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" deploy/.env
nano deploy/.env        # ADMIN_EMAIL, ADMIN_PASSWORD (kamida 8 belgi), IMPORT_SUPABASE_KEY

bash deploy/deploy.sh   # baza + API + frontend build + /var/www/chorrom

cp deploy/nginx-chorrom.conf /etc/nginx/sites-available/chorrom.conf
ln -sf /etc/nginx/sites-available/chorrom.conf /etc/nginx/sites-enabled/chorrom.conf
nginx -t && systemctl reload nginx
```

DNS: `chorrom.uz` va `www.chorrom.uz` uchun **A-yozuv** → server IP. Yozuv tarqalgach:

```bash
certbot --nginx -d chorrom.uz -d www.chorrom.uz --redirect
```

Zaxira (har kuni 03:15):

```bash
(crontab -l 2>/dev/null; echo "15 3 * * * bash /opt/chorrom/deploy/backup.sh >> /var/log/chorrom-backup.log 2>&1") | crontab -
```

## Yangilash

```bash
cd /opt/chorrom && git pull && bash deploy/deploy.sh
```

Sahifalar build vaqtida bazadagi ma'lumot bilan chiziladi, keyin brauzer API'dan yangisini oladi —
admin paneldagi o'zgarish darhol ko'rinadi, qayta deploy shart emas.

## Eski Supabase'dan ko'chish

`IMPORT_SUPABASE_URL` va `IMPORT_SUPABASE_KEY` berilsa, API birinchi ishga tushganda (baza bo'sh bo'lsa)
ochiq ma'lumotni ko'chiradi: kategoriyalar, mahsulotlar, sayt matnlari, tizim sozlamalari va rasmlar
(WebP nusxalari bilan). Admin akkauntlari, eski buyurtmalar va Telegram tokeni yopiq bo'lgani uchun
ko'chmaydi: admin `.env` dagi email/parol bilan yaratiladi, Telegram admin panelda qayta sozlanadi.

## Foydali buyruqlar

```bash
docker compose -f deploy/docker-compose.yml --env-file deploy/.env ps
docker compose -f deploy/docker-compose.yml --env-file deploy/.env logs -f api
docker stats --no-stream chorrom-api-1 chorrom-db-1
```
