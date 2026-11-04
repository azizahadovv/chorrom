import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { useSEO } from '@/hooks/useSEO';
import { ListEditLink, T } from './Content';

/** Sahifa <title> va meta description: `${prefix}.seo.title` / `${prefix}.seo.description` kalitlaridan. */
export function usePageSEO(prefix: string) {
  const { tx } = useText();
  useSEO({ title: tx(`${prefix}.seo.title`), description: tx(`${prefix}.seo.description`) });
}

interface PageHeadProps {
  /** Kalit prefiksi: `${prefix}.head.title`, `${prefix}.head.lead`; kpis ro'yxati `${prefix}.kpis`. */
  prefix: string;
  /** Breadcrumb'dagi joriy sahifa nomi */
  crumb: string;
  /** O'ng tomondagi tugmalar (bo'lsa sarlavha bilan bir qatorda) */
  ctas?: ReactNode;
  kpis?: boolean;
}

export function PageHead({ prefix, crumb, ctas, kpis }: PageHeadProps) {
  const { t } = useLanguage();
  const text = (
    <div>
      <T k={`${prefix}.head.title`} as="h1" />
      <T k={`${prefix}.head.lead`} as="p" className="lead" />
    </div>
  );
  return (
    <section className="pagehead">
      <div className="wrap">
        <nav className="crumbs" aria-label={t.nav.breadcrumbs}>
          <Link to="/">{t.nav.home}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb}</span>
        </nav>
        {ctas ? (
          <div className="row">
            {text}
            <div className="ctas">{ctas}</div>
          </div>
        ) : (
          <>
            <T k={`${prefix}.head.title`} as="h1" />
            <T k={`${prefix}.head.lead`} as="p" className="lead" />
          </>
        )}
        {kpis && <Kpis name={`${prefix}.kpis`} />}
      </div>
    </section>
  );
}

function Kpis({ name }: { name: string }) {
  const { items, f } = useList(name);
  if (!items.length) return <ListEditLink name={name} dark />;
  return (
    <>
      <ListEditLink name={name} dark />
      <div className="kpis">
        {items.map((it, i) => (
          <div key={i}>
            <b>{f(it, 'value')}</b>
            <span>{f(it, 'text')}</span>
          </div>
        ))}
      </div>
    </>
  );
}
