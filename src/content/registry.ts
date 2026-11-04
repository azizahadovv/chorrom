import type { ListDict, PageId, TextDict } from './types';
import * as common from './pages/common';
import * as home from './pages/home';
import * as katalog from './pages/katalog';
import * as kalkulyator from './pages/kalkulyator';
import * as negaBiz from './pages/negaBiz';
import * as ishlarimiz from './pages/ishlarimiz';
import * as muddatliTolov from './pages/muddatliTolov';
import * as shourum from './pages/shourum';
import * as jamoa from './pages/jamoa';

const modules = [common, home, katalog, kalkulyator, negaBiz, ishlarimiz, muddatliTolov, shourum, jamoa];

/** Barcha matn kalitlarining standart qiymatlari (UZ/RU). */
export const TEXT_DEFAULTS: TextDict = Object.assign({}, ...modules.map((m) => m.texts));

/** Barcha tahrirlanadigan ro'yxatlar va ularning standart elementlari. */
export const LIST_DEFAULTS: ListDict = Object.assign({}, ...modules.map((m) => m.lists));

/** Rasm kalitlarining standart fotosi (`${k}:img` bo'sh bo'lsa): public/img dagi kompaniya fotolari. */
export const IMAGE_DEFAULTS: Record<string, string> = Object.assign(
  {},
  ...modules.map((m) => ('images' in m ? (m as { images: Record<string, string> }).images : {})),
);

/** Admin panelda guruhlash uchun: kalit prefiksi → sahifa nomi. */
export const PAGE_LABELS: Record<PageId, string> = {
  common: 'Umumiy: aloqa, header, footer, formalar',
  home: 'Bosh sahifa',
  katalog: 'Katalog',
  kalkulyator: 'Kalkulyator',
  'nega-biz': 'Nega biz',
  ishlarimiz: 'Ishlarimiz',
  'muddatli-tolov': 'Muddatli toʻlov',
  shourum: 'Shourum',
  jamoa: 'Asoschi va jamoa',
};

const PREFIX_TO_PAGE: Record<string, PageId> = {
  common: 'common',
  home: 'home',
  katalog: 'katalog',
  kalk: 'kalkulyator',
  why: 'nega-biz',
  works: 'ishlarimiz',
  inst: 'muddatli-tolov',
  show: 'shourum',
  team: 'jamoa',
};

export const pageOfKey = (key: string): PageId => PREFIX_TO_PAGE[key.split('.')[0]] ?? 'common';

/** site_content jadvalida ro'yxat qaysi kalitda saqlanadi. */
export const listStorageKey = (name: string) => `list:${name}`;
