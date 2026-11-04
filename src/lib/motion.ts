import { useEffect, useRef, useState } from 'react';
import { createBrowserHistory, type BrowserHistory, type To } from '@remix-run/router';

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Raqam yangi qiymatga 650 ms davomida silliq yetib boradi (ease-out). Harakat kamaytirilgan bo'lsa — darhol. */
export function useTween(target: number, duration = 650) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    if (reducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min((t - t0) / duration, 1);
      const v = from + (target - from) * (1 - Math.pow(1 - k, 4));
      current.current = v;
      setValue(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

type Loader = () => Promise<unknown>;
type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => unknown };

/**
 * Sahifa yuklanguncha (Suspense zaxirasi yo'qolguncha) kutish — eski kadr shu vaqtgacha ekranda turadi.
 * View Transition davomida brauzer kadr chizmaydi (requestAnimationFrame ishlamaydi), shuning uchun setTimeout.
 */
const settled = () =>
  new Promise<void>((resolve) => {
    const t0 = performance.now();
    const check = () =>
      !document.querySelector('[data-page-loading]') || performance.now() - t0 > 1500 ? resolve() : setTimeout(check, 16);
    check();
  });

/**
 * Sayt sahifalari orasidagi o'tish: View Transitions API (eski sahifa 8px tepaga va so'nadi, yangisi 14px pastdan).
 * history.push/replace document.startViewTransition ichida bajariladi; kerakli sahifa chunk'i oldindan yuklanadi.
 */
export function createTransitionHistory(loaders: Record<string, Loader>, flush: (fn: () => void) => void): BrowserHistory {
  const history = createBrowserHistory({ v5Compat: true });
  const wrap = (orig: (to: To, state?: unknown) => void) => (to: To, state?: unknown) => {
    const doc = document as VTDocument;
    const path = typeof to === 'string' ? to.split(/[?#]/)[0] : to.pathname ?? '';
    const internal = !path.startsWith('/admin') && !window.location.pathname.startsWith('/admin');
    const samePage = path === window.location.pathname;
    if (!doc.startViewTransition || reducedMotion() || !internal || samePage) return orig(to, state);
    doc.startViewTransition(async () => {
      await loaders[path]?.().catch(() => undefined);
      flush(() => orig(to, state));
      await settled();
    });
  };
  history.push = wrap(history.push.bind(history));
  history.replace = wrap(history.replace.bind(history));
  return history;
}
