import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalogData } from '@/lib/rest';
import { useLanguage } from '@/hooks/useLanguage';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { getInitialData } from '@/lib/initialData';
import { seriesPrice } from '@/lib/pricing';
import { isHydrated } from '@/lib/hydration';

/** Katalog kartasi uchun tayyor mahsulot (products + categories + price_settings). */
export interface CatalogProduct {
  id: string;
  /** Kategoriya slug: pvx, al, surma, eshik, out */
  group: string;
  groupName: string;
  brand: string;
  name: string;
  chips: string[];
  place: string;
  /** 1 m² narxi; 0 = narx kiritilmagan */
  price: number;
  /** Kalkulyator bog'lanishi (profil turi + seriya). Yo'q bo'lsa kalkulyatorga oddiy havola. */
  calc: { material: string; series: string } | null;
  image: string;
  isFeatured: boolean;
  specs: {
    chambers: string;
    thickness: string;
    uw: string;
    db: string;
    warranty: string;
    suitable: string;
  };
}

export interface CatalogCategory {
  slug: string;
  name: string;
}

type Row = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).filter(Boolean) : []);

async function fetchCatalog() {
  const { categories, products } = await fetchCatalogData();
  return { categories: categories as Row[], products: products as Row[] };
}

export function useCatalog() {
  const { language } = useLanguage();
  const init = getInitialData()?.catalog;
  const query = useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: 60 * 1000,
    // Gidratsiyagacha yangi hisoblanadi (App'dagi whenHydrated yangilaydi), keyin ochilsa darhol so'raladi
    ...(init ? { initialData: init, initialDataUpdatedAt: isHydrated() ? 0 : Date.now() } : {}),
  });
  const { data: prices } = usePriceSettings();

  return useMemo(() => {
    const catRows = query.data?.categories ?? [];
    const categories: CatalogCategory[] = catRows.map((c) => ({
      slug: str(c.slug),
      name: str(language === 'ru' ? c.name_ru || c.name_uz : c.name_uz),
    }));
    const catById = new Map(catRows.map((c) => [str(c.id), c]));

    const products: CatalogProduct[] = (query.data?.products ?? [])
      .map((p) => {
        const cat = catById.get(str(p.category_id));
        if (!cat) return null;
        const material = str(p.calc_material);
        const series = str(p.calc_series);
        const id = str(p.slug) || str(p.id);
        const group = str(cat.slug);
        // Mahsulot qo'lda bog'langan bo'lsa o'sha seriya, aks holda kalkulyatordagi o'z kategoriyasidagi shu slug'li model
        const linkedPrice = prices
          ? material && series
            ? seriesPrice(prices, material, series)
            : prices.kinds
                .find((k) => k.categorySlug === group)
                ?.materials.flatMap((m) => m.series)
                .find((s) => s.id === id)?.price ?? 0
          : 0;
        const ru = language === 'ru';
        return {
          id,
          group,
          groupName: str(ru ? cat.name_ru || cat.name_uz : cat.name_uz),
          brand: str(p.brand),
          name: str(ru ? p.name_ru || p.name_uz : p.name_uz),
          chips: ru && arr(p.chips_ru).length ? arr(p.chips_ru) : arr(p.chips_uz),
          place: str(p.place),
          price: linkedPrice || Number(p.price) || 0,
          calc: material && series ? { material, series } : null,
          image: arr(p.images)[0] ?? '',
          isFeatured: !!p.is_featured,
          specs: {
            chambers: str(p.chambers),
            thickness: str(p.thickness),
            uw: str(p.uw_value),
            db: str(p.sound_db),
            warranty: str(p.warranty_years),
            suitable: str(ru ? p.suitable_ru || p.suitable_uz : p.suitable_uz),
          },
        } satisfies CatalogProduct;
      })
      .filter((p): p is CatalogProduct => p !== null);

    return { categories, products, isLoading: query.isLoading, isError: query.isError };
  }, [query.data, query.isLoading, query.isError, prices, language]);
}
