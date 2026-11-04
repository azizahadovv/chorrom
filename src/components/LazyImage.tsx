import { memo, useEffect, useState } from 'react';
import { staticPhoto } from '@/lib/photos';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Birinchi ekrandagi rasm: darhol va yuqori ustuvorlik bilan yuklanadi */
  priority?: boolean;
  /** Faqat desktop'da birinchi ekrandagi rasm (mobilda odatdagi lazy) */
  desktopPriority?: boolean;
}

const DESKTOP_MIN = 1081;
const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Backend yuklangan har bir rasm uchun yaratadigan WebP nusxalar (backend ImageStorage.WIDTHS) */
const WIDTHS = [400, 640, 960];
const UPLOAD_RASTER = /^(\/uploads\/.+)\.(jpe?g|png|webp)$/i;

/** /uploads/x/abc.jpg → /uploads/x/abc-640.webp (kerakli eniga eng yaqin katta nusxa) */
export const optimizedUrl = (url: string, width: number) => {
  const m = url?.match(UPLOAD_RASTER);
  if (!m) return url;
  return `${m[1]}-${WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1]}.webp`;
};

const srcSetFor = (url: string) =>
  UPLOAD_RASTER.test(url) ? WIDTHS.map((w) => `${optimizedUrl(url, w)} ${w}w`).join(', ') : undefined;

/** Native lazy-loading + to'g'ri o'lchamdagi nusxalar. Xato bo'lsa rasm o'rniga bo'sh joy qoladi. */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw',
  priority = false,
  desktopPriority = false,
  width,
  height,
  ...props
}: LazyImageProps) {
  const [failed, setFailed] = useState(false);
  // Oldindan chizilgan HTML'da rasm yo'q (joyi o'lchami bilan tayyor): rasm hydrate'dan keyin qo'shiladi,
  // shunda u birinchi chizishni sekinlashtirmaydi
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [loaded, setLoaded] = useState(false);
  if (failed) return null;

  // Kompaniya fotolari (public/img): WebP + JPG zaxira, srcset bilan. Yuklangach sekin paydo bo'ladi.
  const st = staticPhoto(src);
  if (st) {
    if (!mounted && !priority) return null;
    const cls = ['photo', className, loaded ? 'loaded' : ''].filter(Boolean).join(' ');
    return (
      <picture>
        <source type="image/webp" srcSet={st.webp} sizes={sizes} />
        <img
          src={st.fallback}
          srcSet={st.jpg}
          sizes={sizes}
          alt={alt}
          width={width ?? st.w}
          height={height ?? st.h}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          data-fade={priority ? undefined : ''}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cls}
          {...props}
        />
      </picture>
    );
  }

  // Faqat keng ekranda birinchi ekranga tushadigan rasm (masalan, katalogning birinchi qatori):
  // HTML'da <picture> bo'lib keladi — desktop darhol yuklaydi, mobil esa hech narsa yuklamaydi (shaffof GIF)
  if (desktopPriority && srcSetFor(src)) {
    return (
      <picture>
        <source media={`(min-width: ${DESKTOP_MIN}px)`} srcSet={srcSetFor(src)} sizes={sizes} />
        <img
          src={mounted ? optimizedUrl(src, 960) : BLANK_GIF}
          srcSet={mounted ? srcSetFor(src) : undefined}
          sizes={mounted ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={mounted ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority="high"
          onError={() => mounted && setFailed(true)}
          className={className ? `object-cover ${className}` : 'object-cover'}
          {...props}
        />
      </picture>
    );
  }

  if (!mounted && !priority) return null;
  return (
    <img
      src={optimizedUrl(src, 960)}
      srcSet={srcSetFor(src)}
      sizes={srcSetFor(src) ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      className={className ? `object-cover ${className}` : 'object-cover'}
      {...props}
    />
  );
});
