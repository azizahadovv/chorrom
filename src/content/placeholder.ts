import type { FieldDef, Lang, ListItem } from './types';

/**
 * Halollik qoidasi: prototipdagi [N], [Ism], [reyting], [Hamkor bank] kabi joylar
 * admin to'ldirmaguncha mehmonlarga ko'rsatilmaydi.
 */
const PLACEHOLDER_RE = /\[[^\]\n]+\]/;

export const hasPlaceholder = (value: string | null | undefined): boolean =>
  !!value && PLACEHOLDER_RE.test(value);

/** Matn mehmonga ko'rsatishga tayyormi: bo'sh emas va placeholdersiz. */
export const isFilled = (value: string | null | undefined): boolean =>
  !!value && value.trim() !== '' && !hasPlaceholder(value);

export const fieldValue = (item: ListItem, field: FieldDef | string, lang: Lang): string => {
  const def = typeof field === 'string' ? { key: field, localized: undefined } : field;
  if (def.localized === false) return item[def.key] ?? '';
  return item[`${def.key}_${lang}`] ?? item[`${def.key}_uz`] ?? item[def.key] ?? '';
};

/**
 * Ro'yxat elementi mehmonga ko'rinadimi: majburiy maydonlarning hammasi to'ldirilgan bo'lishi kerak.
 * Majburiy bo'lmagan maydondagi placeholder esa faqat o'sha maydonni yashiradi.
 */
export const isItemVisible = (item: ListItem, fields: FieldDef[], lang: Lang): boolean =>
  item.hidden !== 'true' &&
  fields.filter((f) => f.required).every((f) => isFilled(fieldValue(item, f, lang)));
