"""design-v4/img dagi fotolardan public/img ga WebP + JPG o'lchamlarini yaratadi.

Ishlatish: python -I scripts/build-photos.py <manba papka> <public/img>
Har foto uchun 640, 1024 va asl kenglik (manbadan katta qilib cho'zilmaydi).
og-image.png (1200x630) ham shu yerda pergola fotosidan qirqiladi.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
WIDTHS = (640, 1024, 1600)
meta = {}

for f in sorted(src.glob('*.jpg')):
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    w0, h0 = im.size
    widths = sorted({w for w in WIDTHS if w < w0} | {w0})
    for w in widths:
        h = round(h0 * w / w0)
        r = im if w == w0 else im.resize((w, h), Image.LANCZOS)
        r.save(out / f'{f.stem}-{w}.webp', 'WEBP', quality=72, method=6)
        r.save(out / f'{f.stem}-{w}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
    meta[f.stem] = {'w': w0, 'h': h0, 'widths': widths}

# og:image — pergola fotosining o'rtasidan 1200x630
og = ImageOps.exif_transpose(Image.open(src / 'pergola-tentli.jpg')).convert('RGB')
scale = 1200 / og.width
og = og.resize((1200, round(og.height * scale)), Image.LANCZOS)
top = max(0, (og.height - 630) // 2)
og.crop((0, top, 1200, top + 630)).save(out.parent / 'og-image.jpg', 'JPEG', quality=82, optimize=True)

print(json.dumps(meta, indent=1))
