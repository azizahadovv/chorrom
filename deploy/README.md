# CHORROM — serverga joylash (Docker)

Hamma narsa Docker'da: **PostgreSQL 16**, **Java API**, **nginx** (sayt va rasmlar), kerak bo'lsa **Caddy** (HTTPS).
Serverda faqat Docker bo'lsa yetadi. Tavsiya: Ubuntu/Debian, kamida 2 GB xotira.

| Konteyner | Vazifasi | Xotira chegarasi | Tashqi port |
|---|---|---|---|
| `db` | baza | 256 MB | yo'q |
| `api` | Java API | 768 MB (o'lchangan eng og'ir holat 577 MB) | yo'q |
| `web` | sayt, `/uploads`, `/api` | 64 MB | faqat `127.0.0.1:8088` |
| `caddy` | HTTPS | 128 MB | 80, 443 (faqat bo'sh serverda) |
| `builder` | sahifalarni chizadi, keyin to'xtaydi | 1,5 GB | yo'q |

Ma'lumotlar Docker volume'larida saqlanadi: `chorrom_pgdata`, `chorrom_uploads`. Konteyner o'chsa ham yo'qolmaydi.

## 1. Kodni serverga ko'chirish

Kompyuterda, Git Bash'da (loyiha papkasidan). Birinchi qatordagi IP'ni o'zingiznikiga almashtiring:

```bash
SERVER=root@1.2.3.4
tar --exclude=node_modules --exclude=dist --exclude=dist-ssr --exclude=backend/target \
    --exclude=.git --exclude=design-v4 --exclude='*.zip' --exclude=deploy/.env -czf - . \
  | ssh "$SERVER" 'mkdir -p /opt/chorrom && tar -xzf - -C /opt/chorrom'
```

Kod git'ga commit qilingan bo'lsa, buning o'rniga serverda `git clone` ham bo'ladi.

## 2. Ishga tushirish

Serverda:

```bash
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
cd /opt/chorrom && bash deploy/deploy.sh
```

Skript o'zi:
- `deploy/.env` ni yaratadi va parollarni tasodifiy to'ldiradi;
- baza va API'ni ko'taradi, birinchi marta eski bazadan katalog, matnlar va rasmlarni ko'chiradi (bir necha daqiqa);
- sahifalarni chizadi, saytni ishga tushiradi va tekshiradi;
- oxirida **admin email va parolini** ekranga chiqaradi. Kirgach parolni "Adminlar" bo'limida almashtiring.

## 3. Domen va HTTPS

DNS'da `chorrom.uz` va `www.chorrom.uz` uchun **A-yozuv** → server IP.

- **80/443 portlar bo'sh (yangi server):** Caddy ishga tushadi va sertifikatni DNS tarqalgach o'zi oladi, keyin o'zi yangilaydi.
  Firewall'da 80 va 443 ochiq bo'lishi kerak.
- **Serverda boshqa nginx 80/443 ni band qilgan:** skript oxirida host nginx va certbot uchun tayyor buyruqlarni chiqaradi
  (`deploy/nginx-chorrom.conf`).

Tanlovni `deploy/.env` dagi `HTTPS_MODE` bilan majburlash mumkin: `caddy` yoki `host`. Boshqa domen uchun: `DOMAIN`,
hamda `index.html` va `scripts/prerender.mjs` dagi `chorrom.uz`.

## 4. Zaxira

Har kuni 03:15 da baza va rasmlar (`BACKUP_DIR`, 14 kun saqlanadi):

```bash
(crontab -l 2>/dev/null; echo "15 3 * * * bash /opt/chorrom/deploy/backup.sh >> /var/log/chorrom-backup.log 2>&1") | crontab -
```

Zaxira shu serverda turadi. Server yo'qolsa u ham yo'qoladi, shuning uchun nusxalarni vaqti-vaqti bilan boshqa joyga ham ko'chiring.

Tiklash (hozirgi baza va rasmlar almashtiriladi):

```bash
bash deploy/restore.sh /srv/chorrom-backups/db-SANA.dump /srv/chorrom-backups/uploads-SANA.tar.gz
```

## Yangilash

Kodni 1-qadamdagidek qayta ko'chiring (`deploy/.env` tegmaydi) va:

```bash
cd /opt/chorrom && bash deploy/deploy.sh
```

Sayt yangilanish paytida ishlab turadi. Sahifalar build vaqtidagi ma'lumot bilan chiziladi, keyin brauzer API'dan yangisini
oladi: admin paneldagi o'zgarish darhol ko'rinadi, qayta deploy shart emas.

## Eski Supabase'dan ko'chish

`IMPORT_SUPABASE_URL` va `IMPORT_SUPABASE_KEY` berilgan bo'lsa (`.env.example` da bor), API birinchi ishga tushganda, baza bo'sh
bo'lsa, ochiq ma'lumotni ko'chiradi: kategoriyalar, mahsulotlar, sayt matnlari, tizim sozlamalari va rasmlar (WebP nusxalari bilan).
Admin akkauntlari, eski buyurtmalar va Telegram tokeni yopiq bo'lgani uchun ko'chmaydi: admin `.env` dagi email va parol bilan
yaratiladi, Telegram admin panelda qayta sozlanadi.

## Foydali buyruqlar

```bash
cd /opt/chorrom
C="docker compose -p chorrom -f deploy/docker-compose.yml --env-file deploy/.env"
$C ps                # holat
$C logs -f api       # API loglari
$C restart api       # API'ni qayta ishga tushirish
docker stats --no-stream chorrom-api-1 chorrom-db-1 chorrom-web-1
```
