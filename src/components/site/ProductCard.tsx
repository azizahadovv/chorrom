import { Fragment, createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { money, monthly } from '@/lib/pricing';
import type { CatalogProduct } from '@/hooks/useCatalog';
import { isFilled } from '@/content/placeholder';
import { LeadButton } from './Lead';
import { PhotoBox, T } from './Content';

/** Kalkulyator mahsulotni taniydi: o'z turini ochadi va modelini oldindan tanlaydi. */
const calcHref = (p: CatalogProduct) => `/kalkulyator#${p.id}`;

function usePlaceName() {
  const { all, lang } = useList('katalog.places');
  return useCallback(
    (code: string) => {
      const it = all.find((x) => x.value === code);
      return it ? it[`label_${lang}`] || it.label_uz : '';
    },
    [all, lang],
  );
}

const SpecCtx = createContext<(p: CatalogProduct) => void>(() => {});

export function ProductCard({ p, priority }: { p: CatalogProduct; priority?: boolean }) {
  const { tx } = useText();
  const placeName = usePlaceName();
  const openSpec = useContext(SpecCtx);
  const { data: cfg } = usePriceSettings();
  const place = placeName(p.place);
  return (
    <article className="card">
      <PhotoBox src={p.image} label={tx('katalog.card.photo', { name: p.name })} alt={p.name} width={600} height={420} desktopPriority={priority} />
      <div className="b">
        <span className="brand">
          {p.groupName}
        </span>
        <h3>{p.name}</h3>
        <div className="chips">
          {p.chips.map((c) => (
            <span className="chip" key={c}>
              {c}
            </span>
          ))}
          {place && <span className="chip">{place}</span>}
        </div>
        <div className="pr">
          {p.price > 0 ? (
            <>
              <small>{tx('katalog.card.perM2')}</small>
              <br />
              <b>{money(p.price)}</b> <small>{tx('katalog.card.from')}</small>
              <br />
              <span className="inst">{tx('katalog.card.monthly', { sum: money(monthly(p.price, 12, cfg)) })}</span>
            </>
          ) : (
            <small>{tx('katalog.card.ask')}</small>
          )}
        </div>
        <button className="more" type="button" onClick={() => openSpec(p)}>
          {tx('katalog.card.more')}
        </button>
        <Link className="btn btn-ink" to={calcHref(p)}>
          {tx('katalog.card.calc')}
        </Link>
      </div>
    </article>
  );
}

/** Kartalar ro'yxatini o'rab oladi va bitta umumiy "Xususiyatlari" oynasini beradi. */
export function SpecProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [p, setP] = useState<CatalogProduct | null>(null);
  const { tx } = useText();
  const { t } = useLanguage();
  const placeName = usePlaceName();
  const open = useCallback((x: CatalogProduct) => {
    setP(x);
    ref.current?.showModal();
  }, []);

  const rows: [string, string][] = p
    ? (
        [
          ['katalog.spec.system', p.groupName],
          ['katalog.spec.chambers', p.specs.chambers],
          ['katalog.spec.thickness', p.specs.thickness],
          ['katalog.spec.suitable', p.specs.suitable || placeName(p.place)],
          ['katalog.spec.uw', p.specs.uw],
          ['katalog.spec.db', p.specs.db],
          ['katalog.spec.warranty', p.specs.warranty ? tx('katalog.spec.warrantyValue', { n: p.specs.warranty }) : ''],
          ['katalog.spec.price', p.price > 0 ? tx('katalog.spec.priceValue', { sum: money(p.price) }) : ''],
        ] as [string, string][]
      ).filter(([, v]) => isFilled(v))
    : [];

  return (
    <SpecCtx.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="specT"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="dlg" style={{ position: 'relative' }}>
          <button className="x" type="button" aria-label={t.common.close} onClick={() => ref.current?.close()}>
            ×
          </button>
          <PhotoBox src={p?.image} label={tx('katalog.spec.photo')} alt={p?.name} />
          <div className="in">
            <span className="brand" style={{ font: "600 12px var(--font)", color: 'var(--muted)' }}>
              {p?.groupName ?? ''}
            </span>
            <h3 id="specT">{p?.name}</h3>
            <div className="spec">
              {rows.map(([k, v]) => (
                <Fragment key={k}>
                  <div>{tx(k)}</div>
                  <div>{v}</div>
                </Fragment>
              ))}
            </div>
            {p && (
              <Link className="btn btn-ink" to={calcHref(p)} onClick={() => ref.current?.close()}>
                {tx('katalog.card.calc')}
              </Link>
            )}
            <LeadButton className="btn btn-ghost" topic={p ? `${tx('common.topic.product')}: ${p.name}` : undefined}>
              <T k="katalog.spec.ask" />
            </LeadButton>
          </div>
        </div>
      </dialog>
    </SpecCtx.Provider>
  );
}
