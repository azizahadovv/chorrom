import { useQuery } from '@tanstack/react-query';
import { fetchPrices } from '@/lib/rest';
import { normalizePriceConfig, type PriceConfig } from '@/lib/pricing';
import { getInitialData } from '@/lib/initialData';
import { isHydrated } from '@/lib/hydration';

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
  return normalizePriceConfig(res.data);
}

export function usePriceSettings() {
  const init = getInitialData();
  return useQuery({
    queryKey: PRICE_SETTINGS_KEY,
    queryFn: fetchPriceSettings,
    // Build vaqtidagi qiymat bilan chiziladi, gidratsiyadan keyin yangilanadi (App'dagi whenHydrated)
    ...(init
      ? { initialData: () => (init.prices ? normalizePriceConfig(init.prices) : null), initialDataUpdatedAt: isHydrated() ? 0 : Date.now() }
      : {}),
    // Build vaqtida jadval yo'q edi (migratsiya qo'llanmagan) — 404 so'rov yubormaymiz
    enabled: !(init && init.prices === null),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
