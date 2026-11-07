import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { useCatalog } from '@/hooks/useCatalog';
import {
  DIMS_KEY,
  EMPTY_PRICE_CONFIG,
  calcPrice,
  defaultOf,
  findKindForProduct,
  money,
  monthly,
  pick,
  seriesName,
  type CalcKind,
  type CalcSelection,
  type PriceConfig,
} from '@/lib/pricing';
import { useTween } from '@/lib/motion';
import { ListEditLink, T } from '@/components/site/Content';
import { CalcDrawing, TypeIcon } from '@/components/site/CalcDrawing';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';

/** Prototipda ikki tavaqali deraza standart tanlangan. */
const DEFAULT_WINDOW_TYPE = '2';
/** Laminatsiya ro'yxati bo'sh bo'lsa chizmadagi rom rangi. */
const FRAME_FALLBACK = 'var(--frame)';
/** Chizmadagi deraza tokchasi: shu id'li qo'shimcha tanlansa chiziladi. */
const SILL_ID = 'sill';

const isPair = (d: unknown): d is [unknown, unknown] => Array.isArray(d) && d.length >= 2 && d[0] != null && d[1] != null;

/** O'lcham: bosh sahifadagi tezkor kartadan (router state) yoki localStorage'dan. Tezkor karta faqat deraza uchun. */
function readDims(state: unknown, useStorage: boolean): [string, string] | null {
  const fromState = (state as { dims?: unknown } | null)?.dims;
  if (isPair(fromState)) return [String(fromState[0]), String(fromState[1])];
  if (!useStorage) return null;
  try {
    const d: unknown = JSON.parse(localStorage.getItem(DIMS_KEY) || 'null');
    if (isPair(d)) return [String(d[0]), String(d[1])];
  } catch {
    /* localStorage yopiq yoki buzilgan JSON */
  }
  return null;
}

const resolve = <X extends { id: string }>(list: X[], id: string | undefined, fallback = '') =>
  list.find((x) => x.id === id) ?? list.find((x) => x.id === fallback) ?? list[0];

/** Mijoz har bir mahsulot uchun tanlagani: boshqa mahsulotga o'tib qaytganda saqlanib qoladi. */
interface Draft {
  typeId?: string;
  materialId?: string;
  seriesId?: string;
  options?: Record<string, string>;
  lamId?: string;
  /** Yo'q — admin belgilagan standart qo'shimchalar */
  extras?: string[];
  dims?: [string, string];
  qty?: number;
}

function Configurator({ cfg, kinds, priced: hasData }: { cfg: PriceConfig; kinds: CalcKind[]; priced: boolean }) {
  const { language, t } = useLanguage();
  const { tx } = useText();
  const location = useLocation();
  const { products } = useCatalog();
  const uid = useId();

  const [kindId, setKindId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  // Avval router state — server render bilan bir xil; localStorage esa mount'dan keyin
  const [quickDims, setQuickDims] = useState(() => readDims(location.state, false));
  useEffect(() => {
    if (!location.state) setQuickDims(readDims(null, true));
    // faqat birinchi mount'da
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [items, setItems] = useState<CalcSelection[]>([]);
  const [preset, setPreset] = useState<{ productId: string; kindId: string } | null>(null);

  const patchDraft = (id: string, p: Draft) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...p } }));

  // Katalogdan kelganda (#mahsulot-id): mahsulot turini ochish, modelini qo'yish
  const appliedHash = useRef('');
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || appliedHash.current === location.hash) return;
    const p = products.find((x) => x.id === id);
    const found = p && findKindForProduct(cfg, p);
    if (!found || found.kind.hidden) return;
    appliedHash.current = location.hash;
    setKindId(found.kind.id);
    if (found.seriesId) patchDraft(found.kind.id, { materialId: found.materialId, seriesId: found.seriesId });
    setPreset({ productId: id, kindId: found.kind.id });
  }, [location.hash, products, cfg]);

  const kind = resolve(kinds, kindId);
  const draft = drafts[kind.id] ?? {};
  const isWindow = kind.drawing === 'window';

  const type = resolve(kind.types, draft.typeId, isWindow ? DEFAULT_WINDOW_TYPE : '');
  const material = resolve(kind.materials, draft.materialId);
  const series = material ? resolve(material.series, draft.seriesId, material.defaultSeries) : undefined;
  const lam = kind.useLamination ? resolve(cfg.lamination, draft.lamId) : undefined;
  const extraIds = draft.extras ?? kind.extras.filter((e) => e.isDefault).map((e) => e.id);
  const options: Record<string, string> = {};
  for (const g of kind.groups) options[g.id] = resolve(g.options, draft.options?.[g.id], defaultOf(g.options))?.id ?? '';
  const [w, h] = draft.dims ?? (isWindow ? quickDims : null) ?? [String(kind.width.def), String(kind.height.def)];
  const qty = draft.qty ?? 1;

  const sel: CalcSelection = {
    kindId: kind.id,
    typeId: type?.id ?? '',
    materialId: material?.id ?? '',
    seriesId: series?.id ?? '',
    options,
    laminationId: lam?.id ?? '',
    extras: extraIds,
    widthMm: +w || 0,
    heightMm: +h || 0,
    qty,
  };

  const measureText = (unit: CalcKind['unit'], measure: number, count: number) => {
    if (unit === 'piece') return tx('kalk.items.qty', { qty: count });
    const n = (measure * count).toFixed(2).replace('.', ',');
    return `${n} ${tx(unit === 'm' ? 'kalk.unit.m' : 'kalk.unit.m2')}`;
  };

  const describe = (s: CalcSelection) => {
    const k = cfg.kinds.find((x) => x.id === s.kindId);
    const ty = k?.types.find((x) => x.id === s.typeId);
    const ser = k?.materials.find((m) => m.id === s.materialId)?.series.find((x) => x.id === s.seriesId);
    const lm = k?.useLamination ? cfg.lamination.find((x) => x.id === s.laminationId) : undefined;
    const { one, measure, unit } = calcPrice(cfg, s);
    const kindName = pick(k?.label, language);
    return {
      name: ty && (k?.types.length ?? 0) > 1 ? `${kindName}: ${pick(ty.label, language)}` : kindName,
      desc: [
        unit !== 'piece' ? `${s.widthMm}×${s.heightMm} ${tx('kalk.unit.mm')}` : '',
        seriesName(ser, language),
        pick(lm?.name, language),
        tx('kalk.items.qty', { qty: s.qty }),
      ]
        .filter(Boolean)
        .join(', '),
      sum: one * s.qty,
      measure: measureText(unit, measure, s.qty),
    };
  };

  const cur = describe(sel);
  const rows = items.map(describe);
  const total = cur.sum + rows.reduce((s, r) => s + r.sum, 0);
  const months = cfg.installment.defaultMonths;
  const perMonth = monthly(total, months, cfg);
  const shownTotal = useTween(total);
  const priced = hasData && total > 0;
  const sample = !hasData || cfg.isSample;
  // Narxi kiritilmagan pozitsiya jami summaga kirmaydi: mijoz buni ko'rishi kerak
  const partial = priced && [cur, ...rows].some((r) => r.sum === 0);

  const toggleExtra = (id: string) =>
    patchDraft(kind.id, { extras: extraIds.includes(id) ? extraIds.filter((x) => x !== id) : [...extraIds, id] });

  const addItem = () => {
    setItems((prev) => [...prev, sel]);
    patchDraft(kind.id, { qty: 1 });
  };

  // Ariza bilan leads jadvaliga yoziladigan hisob
  const summary = {
    page: '/kalkulyator',
    lang: language,
    items: rows.map((r) => ({ name: r.name, desc: r.desc, sum: Math.round(r.sum) })),
    current: {
      kind: pick(kind.label, language),
      name: cur.name,
      desc: cur.desc,
      widthMm: sel.widthMm,
      heightMm: sel.heightMm,
      qty,
      material: pick(material?.label, language),
      series: seriesName(series, language),
      options: Object.fromEntries(
        kind.groups.map((g) => [pick(g.label, language), pick(g.options.find((o) => o.id === options[g.id])?.label, language)]),
      ),
      lamination: pick(lam?.name, language),
      extrasLabels: kind.extras.filter((e) => extraIds.includes(e.id)).map((e) => pick(e.label, language)),
      measure: cur.measure,
      sum: Math.round(cur.sum),
    },
    total: Math.round(total),
    monthly: priced ? { months, sum: Math.round(perMonth) } : null,
    priced,
    isSample: sample,
  };

  const presetName = preset?.kindId === kind.id ? products.find((p) => p.id === preset.productId)?.name : undefined;
  const hasTypes = kind.types.length > 1;
  const widthText = pick(kind.widthLabel, language);
  const heightText = pick(kind.heightLabel, language);

  return (
    <section className="sec cfg" style={{ paddingTop: 48 }} aria-labelledby={`${uid}-t`}>
      <div className="wrap">
        {presetName && (
          <p
            style={{
              marginBottom: 16,
              background: 'var(--brass-tint)',
              border: '1px solid var(--brass)',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 15,
            }}
          >
            {tx('kalk.preset.label')} <b>{presetName}</b>. {tx('kalk.preset.note')}
          </p>
        )}
        <T k="kalk.cfg.title" as="h2" className="h2" id={`${uid}-t`} style={{ fontSize: 28, marginBottom: 20 }} />
        {kinds.length > 1 && (
          <div className="kinds" role="group" aria-label={tx('kalk.cfg.title')}>
            {kinds.map((k) => (
              <button key={k.id} type="button" aria-pressed={k.id === kind.id} onClick={() => setKindId(k.id)}>
                {pick(k.label, language)}
              </button>
            ))}
          </div>
        )}
        <div className={hasTypes ? 'box' : 'box no-types'}>
          {hasTypes && (
            <div className="types" role="group" aria-label={pick(kind.typesTitle, language)}>
              <h3>{pick(kind.typesTitle, language)}</h3>
              {kind.types.map((ty) => (
                <button
                  key={ty.id}
                  type="button"
                  className="tbtn"
                  aria-pressed={ty.id === type?.id}
                  onClick={() => patchDraft(kind.id, { typeId: ty.id })}
                >
                  <TypeIcon type={ty} />
                  {pick(ty.label, language)}
                </button>
              ))}
            </div>
          )}

          <div className="stage">
            <CalcDrawing
              drawing={kind.drawing}
              w={Math.max(+w || 0, 0) || kind.width.def}
              h={Math.max(+h || 0, 0) || kind.height.def}
              type={type}
              color={lam?.hex || FRAME_FALLBACK}
              sill={isWindow && extraIds.includes(SILL_ID)}
              mm={tx('kalk.unit.mm')}
              label={`${tx('kalk.draw.aria')}: ${pick(kind.label, language)}`}
            />
            {kind.unit !== 'piece' && (
              <div className="dims">
                <div className="fld">
                  <label htmlFor={`${uid}-w`}>{widthText}</label>
                  <input
                    id={`${uid}-w`}
                    type="number"
                    inputMode="numeric"
                    min={kind.width.min}
                    max={kind.width.max}
                    step={10}
                    value={w}
                    onChange={(e) => patchDraft(kind.id, { dims: [e.target.value, h] })}
                  />
                </div>
                {kind.unit === 'm2' && (
                  <div className="fld">
                    <label htmlFor={`${uid}-h`}>{heightText}</label>
                    <input
                      id={`${uid}-h`}
                      type="number"
                      inputMode="numeric"
                      min={kind.height.min}
                      max={kind.height.max}
                      step={10}
                      value={h}
                      onChange={(e) => patchDraft(kind.id, { dims: [w, e.target.value] })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="opts">
            {kind.materials.length > 1 && (
              <div>
                <h3>{pick(kind.materialTitle, language)}</h3>
                <div className="seg" role="group" aria-label={pick(kind.materialTitle, language)}>
                  {kind.materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={m.id === material?.id}
                      onClick={() => patchDraft(kind.id, { materialId: m.id, seriesId: '' })}
                    >
                      {pick(m.label, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {material && material.series.length > 1 && (
              <div>
                <h3>
                  <label htmlFor={`${uid}-ser`}>{pick(kind.seriesTitle, language)}</label>
                </h3>
                <select
                  id={`${uid}-ser`}
                  value={series?.id ?? ''}
                  onChange={(e) => patchDraft(kind.id, { seriesId: e.target.value })}
                >
                  {material.series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {seriesName(s, language)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {kind.groups
              .filter((g) => g.options.length > 0)
              .map((g) => (
                <div key={g.id}>
                  <h3>
                    <label htmlFor={`${uid}-g-${g.id}`}>{pick(g.label, language)}</label>
                  </h3>
                  <select
                    id={`${uid}-g-${g.id}`}
                    value={options[g.id]}
                    onChange={(e) => patchDraft(kind.id, { options: { ...draft.options, [g.id]: e.target.value } })}
                  >
                    {g.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {pick(o.label, language)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            {kind.useLamination && cfg.lamination.length > 0 && (
              <div>
                <T k="kalk.opts.lamination" as="h3" />
                <div className="sws" role="group" aria-label={tx('kalk.opts.lamAria')}>
                  {cfg.lamination.map((l) => {
                    const name = pick(l.name, language);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        style={{ background: l.hex }}
                        title={name}
                        aria-label={name}
                        aria-pressed={l.id === lam?.id}
                        onClick={() => patchDraft(kind.id, { lamId: l.id })}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {kind.extras.length > 0 && (
              <div>
                <T k="kalk.opts.extras" as="h3" />
                <div className="checks">
                  {kind.extras.map((e) => (
                    <label key={e.id} htmlFor={`${uid}-x-${e.id}`}>
                      <input
                        type="checkbox"
                        id={`${uid}-x-${e.id}`}
                        checked={extraIds.includes(e.id)}
                        onChange={() => toggleExtra(e.id)}
                      />{' '}
                      {pick(e.label, language)}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <T k="kalk.opts.qty" as="h3" />
              <div className="qty">
                <button type="button" aria-label={tx('kalk.qty.minus')} onClick={() => patchDraft(kind.id, { qty: Math.max(1, qty - 1) })}>
                  −
                </button>
                <output>{qty}</output>
                <button type="button" aria-label={tx('kalk.qty.plus')} onClick={() => patchDraft(kind.id, { qty: Math.min(50, qty + 1) })}>
                  +
                </button>
              </div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={addItem}>
              <T k="kalk.add" />
            </button>
          </div>

          <div className="total" aria-live="polite">
            <div>
              {priced ? (
                <div className="p">
                  {/* Raqam silliq sanaladi; ekran o'quvchiga faqat yakuniy qiymat */}
                  <span aria-hidden="true">{money(shownTotal)}</span>
                  <span className="sr">{money(total)}</span> <small>{t.common.sum}</small>
                </div>
              ) : (
                <div className="p" style={{ fontSize: 28 }}>
                  {t.common.priceOnRequest}
                </div>
              )}
              <div className="meta">
                <span>
                  {rows.length
                    ? tx('kalk.total.metaMulti', { n: rows.length + 1, m: cur.measure })
                    : tx('kalk.total.metaOne', { m: cur.measure })}
                </span>
                .
                {priced && (
                  <>
                    {' '}
                    {tx('kalk.total.monthlyPre', { months })} <b>{tx('kalk.total.monthly', { sum: money(perMonth) })}</b>.
                  </>
                )}
                {partial && <> {tx('kalk.total.partial')}</>}
                {sample && <> {t.common.sampleNote}</>}
              </div>
            </div>
            <div className="a">
              <LeadButton topicKey="kalk.total.send" className="btn btn-line" opts={{ calc: summary }} />
              <LeadButton topicKey="kalk.total.measureTopic" className="btn btn-brass" opts={{ calc: summary }}>
                <T k="kalk.total.measure" />
              </LeadButton>
            </div>
          </div>
        </div>

        <T k="kalk.items.title" as="h2" className="h2" style={{ fontSize: 28, marginTop: 40 }} />
        <div className="items">
          {rows.length === 0 ? (
            <div className="empty" style={{ padding: 22 }}>
              <T k="kalk.items.empty" />
            </div>
          ) : (
            rows.map((r, i) => (
              <div className="item" key={i}>
                <div>
                  <b>
                    №{i + 1} {r.name}
                  </b>
                  <span>{r.desc}</span>
                </div>
                <div className="pr">
                  {hasData && r.sum > 0 ? (
                    <>
                      {money(r.sum)} {t.common.sum}
                    </>
                  ) : (
                    t.common.priceOnRequest
                  )}
                </div>
                <button
                  type="button"
                  aria-label={tx('kalk.items.remove')}
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Factors() {
  const { items, f } = useList('kalk.factors');
  const uid = useId();
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="kalk.factors.title" as="h2" className="h2" id={uid} />
            <T k="kalk.factors.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="kalk.factors" />
        <div className="factors">
          {items.map((it, i) => (
            <div className="factor" key={i}>
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Kalkulyator() {
  usePageSEO('kalk');
  const { t } = useLanguage();
  const { data } = usePriceSettings();
  const cfg = data ?? EMPTY_PRICE_CONFIG;
  const kinds = cfg.kinds.filter((k) => !k.hidden);
  return (
    <>
      <PageHead prefix="kalk" crumb={t.nav.calculator} kpis />
      {kinds.length > 0 && <Configurator cfg={cfg} kinds={kinds} priced={!!data} />}
      <Factors />
    </>
  );
}
