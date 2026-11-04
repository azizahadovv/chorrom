import { createElement, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useEditMode } from '@/hooks/useEditMode';
import { useText } from '@/hooks/useContent';
import { TEXT_DEFAULTS } from '@/content/registry';
import { hasPlaceholder, isFilled } from '@/content/placeholder';
import { LazyImage } from '@/components/LazyImage';

type Tag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'b' | 'small' | 'div' | 'q' | 'strong' | 'summary' | 'figcaption' | 'dt' | 'dd';

interface TProps {
  /** src/content ichidagi kalit, masalan "home.hero.title". */
  k: string;
  as?: Tag;
  className?: string;
  id?: string;
  vars?: Record<string, string | number>;
  /** Matnni bo'sh qator bo'yicha <p> paragraflarga bo'lish (har bir placeholderli paragraf alohida yashiriladi). */
  paras?: boolean;
  style?: React.CSSProperties;
}

/**
 * Tahrirlanadigan matn. Mehmon: admin qiymati yoki standart, [placeholder] bo'lsa umuman chizilmaydi.
 * Admin tahrirlash rejimida: bosilsa o'ng paneldagi muharrir ochiladi.
 */
export function T({ k, as = 'span', className, id, vars, paras, style }: TProps) {
  const { tx, editing, lang } = useText();
  const { selectElement, selectedElement } = useEditMode();
  const value = tx(k, vars);

  if (!editing) {
    if (paras) {
      const list = value.split(/\n\s*\n/).filter((p) => isFilled(p));
      if (!list.length) return null;
      return createElement(as === 'span' ? 'div' : as, { className, id, style }, list.map((p, i) => <p key={i}>{p}</p>));
    }
    if (!isFilled(value)) return null;
    return createElement(as, { className, id, style }, value);
  }

  const open = () =>
    selectElement({
      type: 'text',
      contentKey: k,
      currentValue: tx(k),
      fallback: TEXT_DEFAULTS[k]?.[lang] ?? '',
      multiline: TEXT_DEFAULTS[k]?.multiline || (TEXT_DEFAULTS[k]?.[lang]?.length ?? 0) > 90,
    });
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };
  const cls = [
    className,
    'ch-edit',
    hasPlaceholder(value) || !value ? 'ch-edit-ph' : '',
    selectedElement?.contentKey === k ? 'ch-edit-on' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const body: ReactNode = paras
    ? value.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)
    : value || '…';
  return createElement(
    paras && as === 'span' ? 'div' : as,
    {
      className: cls,
      id,
      style,
      role: 'button',
      tabIndex: 0,
      title: `Tahrirlash: ${k}`,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        open();
      },
      onKeyDown,
    },
    body,
  );
}

interface PhotoProps {
  /** Rasm o'rnidagi yozuv kaliti ("Foto: ..."). Rasm manzili `${k}:img` kalitida saqlanadi. */
  k: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Birinchi ekrandagi foto (LCP): oldindan chizilgan HTML'da, yuqori ustuvorlik bilan */
  priority?: boolean;
}

/** Admin rasm yuklamaguncha prototipdagi kabi nomlangan placeholder ko'rsatiladi. */
export function Photo({ k, className = 'ph', alt, width = 800, height = 600, priority }: PhotoProps) {
  const { tx, image, editing } = useText();
  const { selectElement } = useEditMode();
  const src = image(k);
  const label = tx(k);
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    selectElement({ type: 'image', contentKey: `${k}:img`, currentValue: src, fallback: '' });
  };
  return (
    <PhotoBox
      src={src}
      label={label}
      alt={alt ?? label.replace(/^(Foto|Surat|Фото):\s*/, '').replace(/ surati$/, '')}
      className={className}
      width={width}
      height={height}
      onEdit={editing ? open : undefined}
      priority={priority}
    />
  );
}

interface PhotoBoxProps {
  src?: string;
  label: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  onEdit?: (e: React.MouseEvent) => void;
  /** Keng ekranda birinchi ekranga tushadi (LCP) */
  desktopPriority?: boolean;
  priority?: boolean;
}

export function PhotoBox({ src, label, alt, className = 'ph', width = 800, height = 600, onEdit, desktopPriority, priority }: PhotoBoxProps) {
  const editProps = onEdit
    ? { role: 'button', tabIndex: 0, onClick: onEdit, title: 'Rasmni almashtirish', 'data-edit-photo': 'true' }
    : {};
  if (src) {
    return (
      <div className={`${className} ph-img`} {...editProps}>
        <LazyImage src={src} alt={alt || label} width={width} height={height} className="ph-photo" desktopPriority={desktopPriority} priority={priority} />
      </div>
    );
  }
  return (
    <div className={className} {...editProps}>
      {label && <span>{label}</span>}
    </div>
  );
}

/**
 * Tahrirlanadigan foto (kalit + ':img'): manzil, alt matni (kalitning o'zi) va tahrirlash rejimida
 * o'rab turgan elementga qo'yiladigan bosish xususiyatlari.
 */
export function usePhotoEdit(k: string) {
  const { tx, image, editing } = useText();
  const { selectElement } = useEditMode();
  const src = image(k);
  const editProps = editing
    ? {
        role: 'button',
        tabIndex: 0,
        title: 'Rasmni almashtirish',
        'data-edit-photo': 'true',
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          selectElement({ type: 'image', contentKey: `${k}:img`, currentValue: src, fallback: '' });
        },
      }
    : {};
  return { src, alt: tx(k), editProps };
}

/** Tahrirlash rejimida ro'yxat yonida admin paneldagi muharrirga havola. */
export function ListEditLink({ name, dark }: { name: string; dark?: boolean }) {
  const { isEditMode, canEdit } = useEditMode();
  if (!isEditMode || !canEdit) return null;
  return (
    <Link to={`/admin/lists?l=${encodeURIComponent(name)}`} target="_blank" className={`ch-list-edit${dark ? ' dark' : ''}`}>
      ✎ Roʻyxatni tahrirlash
    </Link>
  );
}
