import { useEffect, useRef, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { reducedMotion } from '@/lib/motion';

// Scroll bilan chiqadigan bloklar (prototip assets/app.js "motion" bo'limidagi ro'yxat)
const REVEAL = [
  '.head', '.mosaic figure', '.rowi', '.card', '.steps4 > div', '.steps > .st', '.work', '.teaser', '.mem',
  '.see > div', '.need > div', '.gcard', '.color', '.factor', '.mstep', '.values > div', '.tr', '.rcard', '.vid',
  '.doc', '.case', '.tl > div', '.ci', 'details', '.letter', '.sband .card4', '.offer .wrap > div', '.icalc',
  '.visit', '.hire', '.gu h2',
].join(',');

/**
 * Sayt animatsiyalari: scroll reveal (80 ms qadam bilan, guruhda maks. 6), header pastga scroll'da yashirinadi,
 * shourum bandidagi foto parallaks (±50px). Faqat atributlar qo'yiladi (data-reveal, data-in, data-hide) —
 * React boshqaradigan className'ga tegilmaydi. Harakat kamaytirilgan bo'lsa hech narsa qilinmaydi.
 */
export function useSiteMotion(root: RefObject<HTMLElement>) {
  const { pathname } = useLocation();
  const firstPath = useRef(pathname);
  const navigated = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion() || !('IntersectionObserver' in window)) return;
    // Birinchi yuklashda ekranda turgan bloklar allaqachon chizilgan — ularni yashirib qayta chiqarmaymiz.
    // (Effekt qayta ishga tushsa ham — StrictMode — natija bir xil bo'lishi uchun holat manzildan olinadi.)
    if (pathname !== firstPath.current) navigated.current = true;
    const initial = !navigated.current;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = e.target as HTMLElement;
          t.setAttribute('data-in', '');
          io.unobserve(t);
          // Chiqish tugagach reveal o'tishi (0.9 s + qadam kechikishi) olinadi — hover o'z yumshoq o'tishiga qaytadi
          const i = Number(t.style.getPropertyValue('--i')) || 0;
          setTimeout(() => t.removeAttribute('data-reveal'), 1000 + i * 80);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const scan = (skipVisible: boolean) => {
      const groups = new Map<Element | null, number>();
      el.querySelectorAll<HTMLElement>(REVEAL).forEach((n) => {
        if (n.hasAttribute('data-rv')) return;
        n.setAttribute('data-rv', '');
        if (skipVisible && n.getBoundingClientRect().top < window.innerHeight) return;
        const i = groups.get(n.parentElement) ?? 0;
        groups.set(n.parentElement, i + 1);
        n.style.setProperty('--i', String(Math.min(i, 6)));
        n.setAttribute('data-reveal', '');
        io.observe(n);
      });
    };
    scan(initial);
    // Keyin chizilgan bloklar (katalog filtri, ma'lumot kelgach) ham chiqadi
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => scan(false));
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      // Hali chiqmagan bloklar kuzatuvsiz yashirin qolmasin: belgilar olinadi, keyingi skan ularni qayta oladi
      el.querySelectorAll('[data-rv]:not([data-in])').forEach((n) => {
        n.removeAttribute('data-rv');
        n.removeAttribute('data-reveal');
      });
    };
  }, [pathname, root]);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const hdr = el.querySelector('header.hdr');
        const menuOpen = el.querySelector('.mnav[data-open="true"]');
        hdr?.toggleAttribute('data-hide', y > last && y > 240 && !menuOpen);
        last = y;
        const band = el.querySelector<HTMLElement>('.sband img');
        const box = band?.closest('.sband');
        if (band && box) {
          const r = box.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
            band.style.transform = `translateY(${p * -50}px) scale(1.1)`;
          }
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [root]);
}
