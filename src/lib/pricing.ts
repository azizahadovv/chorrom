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
  /** Ruscha nomi (bo'sh bo'lsa name ishlatiladi) */
  nameRu?: string;
  /** O'lchov birligi narxi (mahsulot sozlamasiga ko'ra: 1 m², 1 metr yoki 1 dona), so'm */
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

export interface CalcType {
  id: string;
  label: LText;
  coef: number;
  /** "Tavaqa uchun" qo'shimchalar nechta tavaqaga hisoblanadi (masalan, chivin to'ri) */
  meshCount: number;
  /** Chizmadagi tavaqalar soni */
  panes?: number;
}

/** Tanlash guruhi (shisha paket, furnitura...): har bir variant narxni koeffitsiyentga ko'paytiradi. */
export interface OptionGroup {
  id: string;
  label: LText;
  options: PriceOption[];
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

/** Narx nimaga ko'paytiriladi: maydon, eni (metr) yoki dona. */
export type KindUnit = 'm2' | 'm' | 'piece';
export type DrawingId = 'window' | 'door' | 'sliding' | 'gate' | 'pergola' | 'shower' | 'mesh' | 'plain';

export interface DimLimit {
  min: number;
  max: number;
  def: number;
}

/** Kalkulyatordagi bitta mahsulot turi. Yangisini admin "Narxlar" bo'limida qo'shadi. */
export interface CalcKind {
  id: string;
  label: LText;
  hidden?: boolean;
  /** Katalog kategoriyasi: shu kategoriyadagi mahsulotdan kelganda bu tur ochiladi */
  categorySlug?: string;
  drawing: DrawingId;
  unit: KindUnit;
  minArea: number;
  width: DimLimit;
  height: DimLimit;
  widthLabel: LText;
  heightLabel: LText;
  typesTitle: LText;
  types: CalcType[];
  materialTitle: LText;
  seriesTitle: LText;
  materials: PriceMaterial[];
  groups: OptionGroup[];
  /** Umumiy laminatsiya ranglari shu mahsulotda ko'rsatiladimi */
  useLamination: boolean;
  extras: PriceExtra[];
}

export interface PriceConfig {
  /** true bo'lsa saytda "Namuna narxlar" yozuvi chiqadi */
  isSample: boolean;
  /** Tezkor karta uchun eng kichik maydon */
  minArea: number;
  kinds: CalcKind[];
  lamination: Lamination[];
  packs: QuickPack[];
  /** Tezkor kartadagi koeffitsiyent (prototipda 1.12) */
  quickCoef: number;
  installment: InstallmentConfig;
}

/** Admin "Yangi mahsulot" tugmasi shu shablondan boshlaydi. */
export const blankKind = (id: string): CalcKind => ({
  id,
  label: { uz: '', ru: '' },
  drawing: 'plain',
  unit: 'm2',
  minArea: 0.5,
  width: { min: 300, max: 6000, def: 1500 },
  height: { min: 300, max: 4000, def: 2000 },
  widthLabel: { uz: 'Eni, mm', ru: 'Ширина, мм' },
  heightLabel: { uz: 'Boʻyi, mm', ru: 'Высота, мм' },
  typesTitle: { uz: 'Turi', ru: 'Тип' },
  types: [],
  materialTitle: { uz: 'Profil turi', ru: 'Тип профиля' },
  seriesTitle: { uz: 'Model', ru: 'Модель' },
  materials: [{ id: `${id}-main`, label: { uz: 'Asosiy', ru: 'Основной' }, series: [] }],
  groups: [],
  useLamination: false,
  extras: [],
});

const panesType = (panes: number, uz: string, ru: string): CalcType => ({
  id: String(panes),
  label: { uz, ru },
  coef: 1,
  meshCount: panes,
  panes,
});

/** Katalogdagi model: id = mahsulot slug'i, shu bilan "Narxini hisoblash" modelni oldindan tanlaydi. */
const model = (id: string, name: string, nameRu: string): PriceSeries => ({ id, name, nameRu, price: 0 });

const mainMaterial = (kindId: string, series: PriceSeries[]): PriceMaterial[] => [
  { id: `${kindId}-main`, label: { uz: 'Asosiy', ru: 'Основной' }, series },
];

/** Deraza: narxlar bazadan, bu yerda faqat tuzilma. */
const windowKind = (
  materials: PriceMaterial[],
  types: CalcType[],
  glass: PriceOption[],
  furniture: PriceOption[],
  extras: PriceExtra[],
  minArea: number,
): CalcKind => ({
  ...blankKind('deraza'),
  label: { uz: 'Deraza', ru: 'Окно' },
  categorySlug: 'derazalar',
  drawing: 'window',
  minArea,
  width: { min: 400, max: 4000, def: 1400 },
  height: { min: 400, max: 3000, def: 1500 },
  typesTitle: { uz: 'Deraza turi', ru: 'Тип окна' },
  types,
  seriesTitle: { uz: 'Profil seriyasi', ru: 'Серия профиля' },
  materials,
  groups: [
    { id: 'glass', label: { uz: 'Shisha paket', ru: 'Стеклопакет' }, options: glass },
    { id: 'furniture', label: { uz: 'Furnitura', ru: 'Фурнитура' }, options: furniture },
  ],
  useLamination: true,
  extras,
});

/** Katalogdagi qolgan mahsulotlar. Narxi 0: admin kiritmaguncha saytda "Narxni menejer aytadi". */
const OTHER_KINDS: CalcKind[] = [
  {
    ...blankKind('eshik'),
    label: { uz: 'Eshik', ru: 'Дверь' },
    categorySlug: 'eshiklar',
    drawing: 'door',
    width: { min: 700, max: 3000, def: 1000 },
    height: { min: 1800, max: 3000, def: 2100 },
    typesTitle: { uz: 'Eshik turi', ru: 'Тип двери' },
    types: [panesType(1, 'Bir tabaqali', 'Одностворчатая'), panesType(2, 'Ikki tabaqali', 'Двустворчатая')],
    materials: mainMaterial('eshik', [
      model('aldox', 'Aldox', 'Aldox'),
      model('aldox-neo', 'Aldox Neo', 'Aldox Neo'),
      model('bkc-50', 'BKC 50', 'BKC 50'),
      model('bkt-57', 'BKT 57', 'BKT 57'),
      model('bkt-70', 'BKT 70', 'BKT 70'),
      model('termoperfect', 'Termoperfect', 'Termoperfect'),
    ]),
    useLamination: true,
  },
  {
    ...blankKind('surma'),
    label: { uz: 'Surma tizim', ru: 'Раздвижная система' },
    categorySlug: 'surma-tizimlar',
    drawing: 'sliding',
    width: { min: 1000, max: 8000, def: 3000 },
    height: { min: 1000, max: 3500, def: 2400 },
    typesTitle: { uz: 'Tavaqalar soni', ru: 'Количество створок' },
    types: [
      panesType(2, 'Ikki tavaqali', 'Две створки'),
      panesType(3, 'Uch tavaqali', 'Три створки'),
      panesType(4, 'Toʻrt tavaqali', 'Четыре створки'),
    ],
    materials: mainMaterial('surma', [
      model('steklopaket-surma', 'Steklopaket surma', 'Стеклопакет витраж'),
      model('kalyonni-surma', 'Kalyonni surma', 'Калёный витраж'),
      model('loft-surma', 'LOFT surma', 'Лофт витраж'),
      model('kaskad-tizimli-loft', 'Kaskad tizimli LOFT', 'Каскадная система ЛОФТ'),
    ]),
    useLamination: true,
  },
  {
    ...blankKind('pergola'),
    label: { uz: 'Pergola', ru: 'Пергола' },
    categorySlug: 'pergola',
    drawing: 'pergola',
    width: { min: 2000, max: 12000, def: 4000 },
    height: { min: 1500, max: 8000, def: 3000 },
    heightLabel: { uz: 'Chiqishi, mm', ru: 'Вынос, мм' },
    materials: mainMaterial('pergola', [
      model('tentli-pergola', 'Tentli pergola', 'Тентовая пергола'),
      model('alyumenniy-pergola', 'Alyuminiy pergola', 'Алюминиевая пергола'),
      model('oynali-ayvon', 'Oynali ayvon', 'Стеклянная навесная пергола'),
    ]),
  },
  {
    ...blankKind('darvoza'),
    label: { uz: 'Darvoza', ru: 'Ворота' },
    categorySlug: 'darvozalar',
    drawing: 'gate',
    width: { min: 2000, max: 8000, def: 3000 },
    height: { min: 1800, max: 5000, def: 2500 },
    materials: mainMaterial('darvoza', [
      model('seksionniy-darvozalar', 'Seksionniy darvozalar', 'Секционные ворота'),
      model('rolstavniy-darvozalar', 'Rolstavniy darvozalar', 'Рольставни ворота'),
    ]),
  },
  {
    ...blankKind('dush'),
    label: { uz: 'Dush kabinasi', ru: 'Душевая кабина' },
    categorySlug: 'dush-kabinalari',
    drawing: 'shower',
    width: { min: 700, max: 2500, def: 1200 },
    height: { min: 1800, max: 2500, def: 2000 },
    materials: mainMaterial('dush', [model('loft-usuldagi-', 'Loft uslubidagi dush kabinasi', 'Душевая кабина в стиле лофт')]),
  },
  {
    ...blankKind('setka'),
    label: { uz: 'Setka', ru: 'Москитная сетка' },
    categorySlug: 'setkalar',
    drawing: 'mesh',
    minArea: 0.3,
    width: { min: 300, max: 3000, def: 700 },
    height: { min: 300, max: 3000, def: 1400 },
    materials: mainMaterial('setka', [model('setka', 'Setka', 'Москитная сетка')]),
  },
];

const DEFAULT_WINDOW_MATERIALS: PriceMaterial[] = [
  { id: 'pvx', label: { uz: 'PVX', ru: 'ПВХ' }, series: [] },
  { id: 'al', label: { uz: 'Alyumin', ru: 'Алюминий' }, series: [] },
];
const DEFAULT_WINDOW_TYPES: CalcType[] = [
  { id: '1', label: { uz: 'Bir tavaqali', ru: 'Одностворчатое' }, coef: 1, meshCount: 1 },
  { id: '2', label: { uz: 'Ikki tavaqali', ru: 'Двустворчатое' }, coef: 1, meshCount: 1 },
  { id: '3', label: { uz: 'Uch tavaqali', ru: 'Трёхстворчатое' }, coef: 1, meshCount: 2 },
  { id: 'b', label: { uz: 'Balkon bloki', ru: 'Балконный блок' }, coef: 1, meshCount: 1 },
];

/** Narxsiz bo'sh tuzilma: jadval hali yo'q bo'lsa admin shundan boshlaydi. */
export const EMPTY_PRICE_CONFIG: PriceConfig = {
  isSample: true,
  minArea: 0.5,
  kinds: [windowKind(DEFAULT_WINDOW_MATERIALS, DEFAULT_WINDOW_TYPES, [], [], [], 0.5), ...OTHER_KINDS],
  lamination: [],
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

/** Eski saqlangan shakl: faqat deraza uchun maydonlar config'ning o'zida edi. */
interface LegacyFields {
  materials?: PriceMaterial[];
  types?: CalcType[];
  glass?: PriceOption[];
  furniture?: PriceOption[];
  extras?: PriceExtra[];
}

/**
 * Bazadagi JSON'dan to'liq config. `kinds` hali yo'q bo'lsa (eski yozuv) deraza narxlari saqlanib, qolgan
 * mahsulotlar qo'shiladi; admin saqlagach faqat yangi shakl yoziladi. `kinds` bor bo'lsa — aynan o'sha
 * (admin o'chirgan mahsulot qaytib kelmaydi).
 */
export function normalizePriceConfig(stored: unknown): PriceConfig {
  const { materials, types, glass, furniture, extras, ...rest } = (stored ?? {}) as Partial<PriceConfig> & LegacyFields;
  const minArea = rest.minArea ?? EMPTY_PRICE_CONFIG.minArea;
  const kinds = rest.kinds?.map((k) => ({ ...blankKind(k.id), ...k })) ?? [
    windowKind(materials ?? DEFAULT_WINDOW_MATERIALS, types ?? DEFAULT_WINDOW_TYPES, glass ?? [], furniture ?? [], extras ?? [], minArea),
    ...OTHER_KINDS,
  ];
  return {
    ...EMPTY_PRICE_CONFIG,
    ...rest,
    kinds,
    installment: { ...EMPTY_PRICE_CONFIG.installment, ...(rest.installment ?? {}) },
  };
}

/** Barcha mahsulotlardagi seriyadan narx (katalog kartasi uchun). */
export function seriesPrice(cfg: PriceConfig | null | undefined, materialId: string, seriesId: string) {
  for (const k of cfg?.kinds ?? []) {
    const s = k.materials.find((m) => m.id === materialId)?.series.find((x) => x.id === seriesId);
    if (s) return s.price;
  }
  return 0;
}

/** Katalog mahsuloti kalkulyatorda qaysi tur va modelga to'g'ri keladi. */
export function findKindForProduct(
  cfg: PriceConfig,
  p: { id: string; group: string; calc: { material: string; series: string } | null },
) {
  const { calc } = p;
  const byCalc = calc && cfg.kinds.find((k) => k.materials.some((m) => m.id === calc.material));
  if (byCalc && calc) return { kind: byCalc, materialId: calc.material, seriesId: calc.series };
  const kind = cfg.kinds.find((k) => k.categorySlug === p.group);
  if (!kind) return null;
  const material = kind.materials.find((m) => m.series.some((s) => s.id === p.id));
  return { kind, materialId: material?.id ?? '', seriesId: material ? p.id : '' };
}

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

export interface CalcSelection {
  kindId: string;
  typeId: string;
  materialId: string;
  seriesId: string;
  /** Guruh id → tanlangan variant id */
  options: Record<string, string>;
  laminationId: string;
  extras: string[];
  widthMm: number;
  heightMm: number;
  qty: number;
}

/** Bitta mahsulot narxi (soni hisobga olinmagan) va o'lchovi (m², metr yoki dona). Narx kiritilmagan bo'lsa one = 0. */
export function calcPrice(cfg: PriceConfig, s: CalcSelection) {
  const kind = cfg.kinds.find((k) => k.id === s.kindId);
  const unit: KindUnit = kind?.unit ?? 'm2';
  const widthM = (s.widthMm || 0) / 1000;
  const measure = unit === 'm2' ? area(s.widthMm, s.heightMm, kind?.minArea ?? cfg.minArea) : unit === 'm' ? widthM : 1;
  const series = kind?.materials.find((m) => m.id === s.materialId)?.series.find((x) => x.id === s.seriesId);
  if (!kind || !series || !series.price) return { one: 0, measure, unit };
  const type = kind.types.find((t) => t.id === s.typeId);
  const lam = kind.useLamination ? cfg.lamination.find((l) => l.id === s.laminationId) : undefined;
  let one = series.price * measure * (type?.coef ?? 1) * (1 + (lam?.surcharge ?? 0));
  for (const g of kind.groups) one *= g.options.find((o) => o.id === s.options[g.id])?.coef ?? 1;
  const chosen = kind.extras.filter((e) => s.extras.includes(e.id));
  for (const e of chosen) {
    if (e.unit === 'per_m') one += e.price * widthM;
    else if (e.unit === 'per_sash') one += e.price * (type?.meshCount ?? 1);
    else if (e.unit === 'fixed') one += e.price;
  }
  for (const e of chosen) if (e.unit === 'pct') one *= 1 + e.price;
  return { one, measure, unit };
}

export const pick = (t: LText | undefined, lang: 'uz' | 'ru') => (t ? t[lang] || t.uz : '');

export const seriesName = (s: PriceSeries | undefined, lang: 'uz' | 'ru') => (s ? (lang === 'ru' && s.nameRu) || s.name : '');

export const defaultOf = <T extends { id: string; isDefault?: boolean }>(list: T[]) =>
  (list.find((x) => x.isDefault) ?? list[0])?.id ?? '';
