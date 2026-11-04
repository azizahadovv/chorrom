import type { Language } from '@/lib/translations';

export type Lang = Language;

/** Bitta matn kaliti: kodagi standart qiymat (UZ/RU). Admin uni site_content orqali almashtiradi. */
export interface TextEntry {
  uz: string;
  ru: string;
  /** Admin tahrirlashda ko'p qatorli maydon chiqsin (paragraflar bo'sh qator bilan ajratiladi). */
  multiline?: boolean;
}

export type TextDict = Record<string, TextEntry>;

export type FieldType = 'text' | 'textarea' | 'image' | 'select' | 'color' | 'url';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /** true bo'lsa qiymat `${key}_uz` va `${key}_ru` maydonlarida saqlanadi. */
  localized?: boolean;
  options?: { value: string; label: string }[];
  /** Ommaviy saytda element shu maydon to'ldirilgandagina ko'rinadi ([N] kabi placeholder ham "to'ldirilmagan"). */
  required?: boolean;
}

/** Ro'yxat elementi: tekis kalit-qiymat. Lokalizatsiya qilingan maydonlar `title_uz`, `title_ru` ko'rinishida. */
export type ListItem = Record<string, string>;

export interface ListDef {
  label: string;
  page: PageId;
  fields: FieldDef[];
  items: ListItem[];
}

export type ListDict = Record<string, ListDef>;

export type PageId =
  | 'common'
  | 'home'
  | 'katalog'
  | 'kalkulyator'
  | 'nega-biz'
  | 'ishlarimiz'
  | 'muddatli-tolov'
  | 'shourum'
  | 'jamoa';

/** Ixcham yozish uchun: L('Matn', 'Текст'). */
export const L = (uz: string, ru: string, multiline = false): TextEntry =>
  multiline ? { uz, ru, multiline } : { uz, ru };

/** Pagehead KPI ro'yxatlari uchun standart maydonlar (`${prefix}.kpis`). */
export const KPI_FIELDS: FieldDef[] = [
  { key: 'value', label: 'Qiymat', type: 'text', localized: true, required: true },
  { key: 'text', label: 'Izoh', type: 'text', localized: true, required: true },
];
