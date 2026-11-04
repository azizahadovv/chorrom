import { useCallback, useMemo } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useLanguage } from '@/hooks/useLanguage';
import { useEditMode } from '@/hooks/useEditMode';
import { IMAGE_DEFAULTS, LIST_DEFAULTS, TEXT_DEFAULTS, listStorageKey } from '@/content/registry';
import { fieldValue, isFilled, isItemVisible } from '@/content/placeholder';
import type { ListItem } from '@/content/types';

const interpolate = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : s;

/**
 * Sahifa matnlari: kodagi standart (src/content) + admin kiritgan qiymat (site_content).
 * `show(k)` — mehmonga ko'rsatish mumkinmi ([N] kabi to'ldirilmagan joylar yashiriladi).
 */
export function useText() {
  const { content } = useSiteContent();
  const { language } = useLanguage();
  const { isEditMode, canEdit } = useEditMode();
  const editing = isEditMode && canEdit;

  const raw = useCallback(
    (k: string): string => {
      const row = content[k];
      const db = row ? (language === 'uz' ? row.value_uz : row.value_ru) : null;
      if (db) return db;
      const def = TEXT_DEFAULTS[k];
      if (!def && import.meta.env.DEV) console.warn(`[content] noma'lum kalit: ${k}`);
      return def?.[language] || def?.uz || '';
    },
    [content, language],
  );

  const tx = useCallback(
    (k: string, vars?: Record<string, string | number>) => interpolate(raw(k), vars),
    [raw],
  );

  const show = useCallback((k: string) => editing || isFilled(raw(k)), [editing, raw]);

  /** Kalit to'ldirilgan bo'lsa qiymat, aks holda bo'sh satr (atributlar, havolalar uchun). */
  const filled = useCallback((k: string) => (isFilled(raw(k)) ? raw(k) : ''), [raw]);

  /** Admin yuklagan rasm manzili (kalit + ':img'), bo'lmasa kompaniya fotosi (IMAGE_DEFAULTS). */
  const image = useCallback((k: string) => content[`${k}:img`]?.value_uz || IMAGE_DEFAULTS[k] || '', [content]);

  return { tx, show, filled, image, editing, lang: language };
}

/** Tahrirlanadigan ro'yxat: admin saqlagan JSON bo'lsa o'sha, bo'lmasa kodagi standart. */
export function useList(name: string) {
  const { content } = useSiteContent();
  const { language } = useLanguage();
  const { isEditMode, canEdit } = useEditMode();
  const editing = isEditMode && canEdit;
  const def = LIST_DEFAULTS[name];
  const stored = content[listStorageKey(name)]?.value_uz;

  const all: ListItem[] = useMemo(() => {
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed as ListItem[];
      } catch {
        /* buzilgan JSON — standartga qaytamiz */
      }
    }
    return def?.items ?? [];
  }, [stored, def]);

  const items = useMemo(
    () => (editing ? all : all.filter((it) => isItemVisible(it, def?.fields ?? [], language))),
    [all, def, editing, language],
  );

  /** Element maydoni joriy tilda; placeholder bo'lsa mehmonga bo'sh qaytadi. */
  const f = useCallback(
    (item: ListItem, key: string) => {
      const field = def?.fields.find((x) => x.key === key) ?? key;
      const v = fieldValue(item, field, language);
      return editing || isFilled(v) ? v : '';
    },
    [def, language, editing],
  );

  return { items, all, f, editing, def, lang: language };
}
