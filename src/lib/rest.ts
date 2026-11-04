// Ommaviy sahifalar uchun CHORROM backend endpoint'lari (yengil: faqat fetch).
import { apiGet, apiPost, getToken } from './api';

export interface ContentRow {
  id: string;
  key: string;
  value_uz: string | null;
  value_ru: string | null;
  content_type: string | null;
  page: string | null;
  section: string | null;
}

export const fetchContent = () => apiGet<ContentRow[]>('/api/public/content');

export const fetchCatalogData = () =>
  apiGet<{ categories: Record<string, unknown>[]; products: Record<string, unknown>[] }>('/api/public/catalog');

export const fetchPrices = () => apiGet<{ data?: unknown }>('/api/public/prices');

export const fetchSystemSettings = () => apiGet<Record<string, unknown>>('/api/public/settings');

export const postLead = (lead: Record<string, unknown>) => apiPost<{ ok: boolean }>('/api/public/leads', lead);

/** Admin oldin kirganmi (saqlangan token) — tahrirlash vositalari faqat shunda yuklanadi */
export const hasStoredSession = (): boolean => !!getToken();
