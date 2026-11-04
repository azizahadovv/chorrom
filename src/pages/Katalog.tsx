import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { useCatalog } from '@/hooks/useCatalog';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { pick } from '@/lib/pricing';
import { ListEditLink, T } from '@/components/site/Content';
import { PageHead, usePageSEO } from '@/components/site/PageHead';
import { ProductCard, SpecProvider } from '@/components/site/ProductCard';

type Sort = 'pop' | 'asc' | 'desc';

function toggle(set: Set<string>, v: string, on: boolean) {
  const next = new Set(set);
  if (on) next.add(v);
  else next.delete(v);
  return next;
}

function Products() {
  const { tx } = useText();
  const { categories, products, isLoading } = useCatalog();
  const { items: places, f } = useList('katalog.places');
  const { hash } = useLocation();
  const uid = useId();
  const [groups, setGroups] = useState<Set<string>>(new Set());
  const [placeSet, setPlaceSet] = useState<Set<string>>(new Set());
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [sort, setSort] = useState<Sort>('pop');

  // URL hash (#pvx, #al ...) filtrni oldindan qo'yadi
  useEffect(() => {
    const h = decodeURIComponent(hash.slice(1));
    if (h && categories.some((c) => c.slug === h)) setGroups(new Set([h]));
  }, [hash, categories]);

  const list = useMemo(() => {
    const lo = (+min || 0) * 1000;
    const hi = max ? +max * 1000 : Infinity;
    const res = products.filter(
      (p) =>
        (!groups.size || groups.has(p.group)) &&
        (!placeSet.size || placeSet.has(p.place)) &&
        // Narxi kiritilmagan mahsulot faqat narx filtri bo'sh bo'lganda ko'rinadi
        (p.price ? p.price >= lo && p.price <= hi : !min && !max),
    );
    if (sort === 'asc') res.sort((a, b) => a.price - b.price);
    if (sort === 'desc') res.sort((a, b) => b.price - a.price);
    return res;
  }, [products, groups, placeSet, min, max, sort]);

  const reset = () => {
    setGroups(new Set());
    setPlaceSet(new Set());
    setMin('');
    setMax('');
  };

  return (
    <section className="sec" style={{ paddingTop: 48 }} aria-labelledby={`${uid}-h`}>
      {/* Sarlavhalar ketma-ketligi (h1 → h2 → h3) uchun ko'rinmas sarlavha */}
      <h2 className="sr" id={`${uid}-h`}>
        {tx('katalog.productsAria')}
      </h2>
      <div className="wrap cat-layout">
        <aside className="filters" aria-label={tx('katalog.filters.aria')}>
          <div>
            <T k="katalog.filters.system" as="h3" />
            <div className="checks">
              {categories.map((c) => (
                <label key={c.slug}>
                  <input type="checkbox" checked={groups.has(c.slug)} onChange={(e) => setGroups(toggle(groups, c.slug, e.target.checked))} />{' '}
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <T k="katalog.filters.place" as="h3" />
            <ListEditLink name="katalog.places" />
            <div className="checks">
              {places.map((pl) => (
                <label key={pl.value}>
                  <input
                    type="checkbox"
                    checked={placeSet.has(pl.value)}
                    onChange={(e) => setPlaceSet(toggle(placeSet, pl.value, e.target.checked))}
                  />{' '}
                  {f(pl, 'label')}
                </label>
              ))}
            </div>
          </div>
          <div>
            <T k="katalog.filters.price" as="h3" />
            <div className="range">
              <label htmlFor={`${uid}-min`} className="sr">
                {tx('katalog.filters.min')}
              </label>
              <input id={`${uid}-min`} type="number" inputMode="numeric" min={0} placeholder={tx('katalog.filters.min')} value={min} onChange={(e) => setMin(e.target.value)} />
              <label htmlFor={`${uid}-max`} className="sr">
                {tx('katalog.filters.max')}
              </label>
              <input id={`${uid}-max`} type="number" inputMode="numeric" min={0} placeholder={tx('katalog.filters.max')} value={max} onChange={(e) => setMax(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-ghost" type="button" style={{ minHeight: 44 }} onClick={reset}>
            {tx('katalog.filters.reset')}
          </button>
        </aside>
        <div>
          <div className="sortbar">
            <span className="count" aria-live="polite">
              {isLoading ? '' : tx('katalog.count', { n: list.length })}
            </span>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--muted)' }}>
              {tx('katalog.sort.label')}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="pop">{tx('katalog.sort.pop')}</option>
                <option value="asc">{tx('katalog.sort.asc')}</option>
                <option value="desc">{tx('katalog.sort.desc')}</option>
              </select>
            </label>
          </div>
          <div className="cards c3">
            {list.length ? list.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 3} />) : !isLoading && <div className="empty">{tx('katalog.empty')}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Guide() {
  const { items, f } = useList('katalog.guide');
  const uid = useId();
  if (!items.length) return null;
  return (
    <section className="sec" style={{ background: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="katalog.guide.title" as="h2" className="h2" id={uid} />
            <T k="katalog.guide.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="katalog.guide" />
        <div className="guide">
          {items.map((it, i) => (
            <div className="gcard" key={i}>
              <h3>{f(it, 'title')}</h3>
              <p>{f(it, 'text')}</p>
              {f(it, 'tag') && <span className="tag">{f(it, 'tag')}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Laminatsiya ranglari narx sozlamalaridan (kalkulyator bilan bitta manba). */
function Colors() {
  const { data: cfg } = usePriceSettings();
  const { language } = useLanguage();
  const uid = useId();
  const colors = cfg?.lamination ?? [];
  if (!colors.length) return null;
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="katalog.colors.title" as="h2" className="h2" id={uid} />
            <T k="katalog.colors.text" as="p" className="sub" />
          </div>
          <Link className="link" to="/kalkulyator">
            <T k="katalog.colors.link" />
          </Link>
        </div>
        <div className="colors">
          {colors.map((c) => (
            <div className="color" key={c.id}>
              <div className="s" style={{ background: c.hex }} />
              <div className="t">
                {pick(c.name, language)}
                <small>{pick(c.note, language)}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Katalog() {
  usePageSEO('katalog');
  const { t } = useLanguage();
  return (
    <SpecProvider>
      <PageHead
        prefix="katalog"
        crumb={t.nav.catalog}
        ctas={
          <Link className="btn btn-brass" to="/kalkulyator">
            <T k="katalog.head.cta" />
          </Link>
        }
      />
      <Products />
      <Guide />
      <Colors />
    </SpecProvider>
  );
}
