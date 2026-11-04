// public/img dagi kompaniya fotolari (scripts/build-photos.py yaratadi): har biri uchun WebP va JPG nusxalar.
// Admin rasm yuklamaguncha sahifalar shu fotolarni ko'rsatadi.

interface StaticPhoto {
  w: number;
  h: number;
  widths: number[];
}

export const STATIC_PHOTOS: Record<string, StaticPhoto> = {
  dush: { w: 1116, h: 1368, widths: [640, 1024, 1116] },
  'loft-kaskad': { w: 941, h: 1254, widths: [640, 941] },
  'loft-surma': { w: 941, h: 1254, widths: [640, 941] },
  'pergola-tentli': { w: 1116, h: 1358, widths: [640, 1024, 1116] },
  'vitraj-eshik': { w: 882, h: 592, widths: [640, 882] },
};

const STATIC_RE = /^\/img\/([\w-]+)\.jpg$/;

/** /img/loft-surma.jpg → nusxalar ro'yxati (bo'lmasa null) */
export function staticPhoto(src: string) {
  const name = src.match(STATIC_RE)?.[1];
  const meta = name ? STATIC_PHOTOS[name] : undefined;
  if (!meta) return null;
  const set = (ext: string) => meta.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const largest = meta.widths[meta.widths.length - 1];
  return {
    ...meta,
    webp: set('webp'),
    jpg: set('jpg'),
    fallback: `/img/${name}-${meta.widths.find((w) => w >= 1000) ?? largest}.jpg`,
  };
}
