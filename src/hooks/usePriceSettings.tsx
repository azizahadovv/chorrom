import { useQuery } from '@tanstack/react-query';
import { fetchPrices } from '@/lib/rest';
import { EMPTY_PRICE_CONFIG, type PriceConfig } from '@/lib/pricing';
import { getInitialData } from '@/lib/initialData';

export const PRICE_SETTINGS_KEY = ['price-settings'] as const;

/** Bazadagi narx sozlamalari. Jadval yoki qator bo'lmasa null — sayt "narxni menejer aytadi" rejimiga o'tadi. */
export async function fetchPriceSettings(): Promise<PriceConfig | null> {
  let res: { data?: unknown };
  try {
    res = await fetchPrices();
  } catch {
    return null;
  }
  if (!res?.data) return null;
  const stored = res.data as Partial<PriceConfig>;
  return {
    ...EMPTY_PRICE_CONFIG,
    ...stored,
    installment: { ...EMPTY_PRICE_CONFIG.installment, ...(stored.installment ?? {}) },
  };
}

export function usePriceSettings() {
  const init = getInitialData();
  return useQuery({
    queryKey: PRICE_SETTINGS_KEY,
    queryFn: fetchPriceSettings,
    // Build vaqtidagi qiymat bilan chiziladi va darhol yangilanadi
    ...(init ? { initialData: init.prices, initialDataUpdatedAt: 0 } : {}),
    // Build vaqtida jadval yo'q edi (migratsiya qo'llanmagan) — 404 so'rov yubormaymiz
    enabled: !(init && init.prices === null),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
