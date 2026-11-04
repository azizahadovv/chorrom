// Narx hisoblash mantig'i (design-reference/assets/app.js dagi formulalar).
// Narxlarning o'zi kodda yo'q: ular price_settings jadvalida, admin paneldan o'zgartiriladi.

/** Tezkor kartadan kalkulyatorga o'lcham o'tkazish (localStorage kaliti). */
export const DIMS_KEY = 'chorrom-dims';

export interface LText {
  uz: string;
  ru: string;
}

export interface PriceSeries {
  id: string;
  name: string;
  /** 1 m² narxi, so'm */
  price: number;
}

export interface PriceMaterial {
  id: string;
  label: LText;
  series: PriceSeries[];
  /** Kalkulyatorda standart tanlanadigan seriya */
  defaultSeries?: string;
}

export interface PriceOption {
  id: string;
  label: LText;
  coef: number;
  isDefault?: boolean;
}

export interface WindowType {
  id: string;
  label: LText;
  coef: number;
  /** Chivin to'ri nechta tavaqaga hisoblanadi */
  meshCount: number;
}

export interface Lamination {
  id: string;
  name: LText;
  hex: string;
  /** Ustama ulushi: 0.15 = +15% */
  surcharge: number;
  note: LText;
}

export type ExtraUnit = 'per_m' | 'per_sash' | 'fixed' | 'pct';

export interface PriceExtra {
  id: string;
  label: LText;
  /** so'm (per_m: eni metriga, per_sash: tavaqaga, fixed: dona) yoki foiz ulushi (pct: 0.12 = +12%) */
  price: number;
  unit: ExtraUnit;
  isDefault?: boolean;
}

export interface QuickPack {
  id: string;
  label: LText;
  price: number;
  isDefault?: boolean;
}

export interface InstallmentConfig {
  months: number[];
  /** Muddat → ustama foizi (masalan {"12": 0}) */
  markup: Record<string, number>;
  defaultMonths: number;
  sumMin: number;
  sumMax: number;
  sumStep: number;
  sumDefault: number;
  firstMin: number;
  firstMax: number;
  firstStep: number;
  firstDefault: number;
}

export interface PriceConfig {
  /** true bo'lsa saytda "Namuna narxlar" yozuvi chiqadi */
  isSample: boolean;
  minArea: number;
  materials: PriceMaterial[];
  types: WindowType[];
  glass: PriceOption[];
  furniture: PriceOption[];
  lamination: Lamination[];
  extras: PriceExtra[];
  packs: QuickPack[];
  /** Tezkor kartadagi koeffitsiyent (prototipda 1.12) */
  quickCoef: number;
  installment: InstallmentConfig;
}

/** Narxsiz bo'sh tuzilma: jadval hali yo'q bo'lsa admin shundan boshlaydi. */
export const EMPTY_PRICE_CONFIG: PriceConfig = {
  isSample: true,
  minArea: 0.5,
  materials: [
    { id: 'pvx', label: { uz: 'PVX', ru: 'ПВХ' }, series: [] },
    { id: 'al', label: { uz: 'Alyumin', ru: 'Алюминий' }, series: [] },
  ],
  types: [
    { id: '1', label: { uz: 'Bir tavaqali', ru: 'Одностворчатое' }, coef: 1, meshCount: 1 },
    { id: '2', label: { uz: 'Ikki tavaqali', ru: 'Двустворчатое' }, coef: 1, meshCount: 1 },
    { id: '3', label: { uz: 'Uch tavaqali', ru: 'Трёхстворчатое' }, coef: 1, meshCount: 2 },
    { id: 'b', label: { uz: 'Balkon bloki', ru: 'Балконный блок' }, coef: 1, meshCount: 1 },
  ],
  glass: [],
  furniture: [],
  lamination: [],
  extras: [],
  packs: [],
  quickCoef: 1,
  installment: {
    months: [3, 6, 12],
    markup: { '3': 0, '6': 0, '12': 0 },
    defaultMonths: 12,
    sumMin: 2000000,
    sumMax: 60000000,
    sumStep: 500000,
    sumDefault: 12000000,
    firstMin: 0,
    firstMax: 50,
    firstStep: 5,
    firstDefault: 20,
  },
};

// ru-RU guruhlash bo'shliqlari (NBSP, NNBSP) oddiy bo'shliqqa almashtiriladi
const SPACES = new RegExp('[' + String.fromCharCode(0xa0, 0x202f) + ']', 'g');

/** 1000 so'mgacha yaxlitlab, bo'shliq bilan guruhlash: 1 234 000 */
export const money = (n: number) =>
  (Math.round(n / 1000) * 1000).toLocaleString('ru-RU').replace(SPACES, ' ');

export const area = (wMm: number, hMm: number, min = 0.5) => Math.max(((wMm || 0) * (hMm || 0)) / 1e6, min);

/** Muddatli to'lov: oylik summa (ustama bilan). */
export const monthly = (sum: number, months: number, cfg?: PriceConfig | null) => {
  const pct = cfg?.installment.markup[String(months)] ?? 0;
  return (sum * (1 + pct / 100)) / months;
};

export const quickPrice = (cfg: PriceConfig, wMm: number, hMm: number, packId: string) => {
  const pack = cfg.packs.find((p) => p.id === packId);
  if (!pack || !pack.price) return 0;
  return area(wMm, hMm, cfg.minArea) * pack.price * cfg.quickCoef;
};

export interface WindowSelection {
  typeId: string;
  materialId: string;
  seriesId: string;
  glassId: string;
  furnitureId: string;
  laminationId: string;
  extras: string[];
  widthMm: number;
  heightMm: number;
  qty: number;
}

/** Bitta deraza narxi (soni hisobga olinmagan) va maydoni. Narx kiritilmagan bo'lsa one = 0. */
export function windowPrice(cfg: PriceConfig, s: WindowSelection) {
  const m2 = area(s.widthMm, s.heightMm, cfg.minArea);
  const series = cfg.materials.find((m) => m.id === s.materialId)?.series.find((x) => x.id === s.seriesId);
  if (!series || !series.price) return { one: 0, m2 };
  const type = cfg.types.find((t) => t.id === s.typeId);
  const glass = cfg.glass.find((g) => g.id === s.glassId);
  const fur = cfg.furniture.find((f) => f.id === s.furnitureId);
  const lam = cfg.lamination.find((l) => l.id === s.laminationId);
  let one = series.price * m2 * (type?.coef ?? 1) * (glass?.coef ?? 1) * (fur?.coef ?? 1) * (1 + (lam?.surcharge ?? 0));
  const widthM = (s.widthMm || 0) / 1000;
  const chosen = cfg.extras.filter((e) => s.extras.includes(e.id));
  for (const e of chosen) {
    if (e.unit === 'per_m') one += e.price * widthM;
    else if (e.unit === 'per_sash') one += e.price * (type?.meshCount ?? 1);
    else if (e.unit === 'fixed') one += e.price;
  }
  for (const e of chosen) if (e.unit === 'pct') one *= 1 + e.price;
  return { one, m2 };
}

export const pick = (t: LText | undefined, lang: 'uz' | 'ru') => (t ? t[lang] || t.uz : '');

export const defaultOf = <T extends { id: string; isDefault?: boolean }>(list: T[]) =>
  (list.find((x) => x.isDefault) ?? list[0])?.id ?? '';
