import type { PriceConfig } from './pricing';

/**
 * Build vaqtida (scripts/prerender.mjs) Supabase'dan olingan ma'lumot.
 * Server render va birinchi hydrate aynan shu ma'lumot bilan chiziladi, keyin sahifa
 * Supabase'dan yangisini so'raydi (admin o'zgartirgan narsa darhol ko'rinadi).
 */
export interface InitialData {
  route: string;
  content: Array<{
    id: string;
    key: string;
    value_uz: string | null;
    value_ru: string | null;
    content_type: string | null;
    page: string | null;
    section: string | null;
  }>;
  prices: PriceConfig | null;
  catalog: { categories: Record<string, unknown>[]; products: Record<string, unknown>[] } | null;
  /** Build vaqtida saytga ko'chirilgan rasmlar: asl URL → /img/<nom> (nusxalar: -400.webp, -640.webp, -960.webp) */
  images?: Record<string, string>;
}

declare global {
  // eslint-disable-next-line no-var
  var __CH_DATA__: InitialData | undefined;
}

export const getInitialData = (): InitialData | undefined => globalThis.__CH_DATA__;

export const setInitialData = (data: InitialData | undefined) => {
  globalThis.__CH_DATA__ = data;
};
