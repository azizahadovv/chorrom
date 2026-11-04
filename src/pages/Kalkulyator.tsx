import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { useCatalog } from '@/hooks/useCatalog';
import {
  DIMS_KEY,
  EMPTY_PRICE_CONFIG,
  defaultOf,
  money,
  monthly,
  pick,
  windowPrice,
  type WindowSelection,
} from '@/lib/pricing';
import { useTween } from '@/lib/motion';
import { ListEditLink, T } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';

/** Prototipdagi input boshlang'ich qiymatlari (mm). */
const DEFAULT_DIMS: [string, string] = ['1400', '1500'];
/** Prototipda ikki tavaqali deraza standart tanlangan. */
const DEFAULT_TYPE = '2';
/** Laminatsiya ro'yxati bo'sh bo'lsa chizmadagi rom rangi. */
const FRAME_FALLBACK = 'var(--frame)';
/** Chizmadagi deraza tokchasi: shu id'li qo'shimcha tanlansa chiziladi. */
const SILL_ID = 'sill';
const GLASS_GRAD = 'kalk-glass';

const isPair = (d: unknown): d is [unknown, unknown] => Array.isArray(d) && d.length >= 2 && d[0] != null && d[1] != null;

/** O'lcham: bosh sahifadagi tezkor kartadan (router state) yoki localStorage'dan. */
function readDims(state: unknown, useStorage: boolean): [string, string] {
  const fromState = (state as { dims?: unknown } | null)?.dims;
  if (isPair(fromState)) return [String(fromState[0]), String(fromState[1])];
  if (!useStorage) return DEFAULT_DIMS;
  try {
    const d: unknown = JSON.parse(localStorage.getItem(DIMS_KEY) || 'null');
    if (isPair(d)) return [String(d[0]), String(d[1])];
  } catch {
    /* localStorage yopiq yoki buzilgan JSON */
  }
  return DEFAULT_DIMS;
}

const resolve = <X extends { id: string }>(list: X[], id: string, fallback = '') =>
  list.find((x) => x.id === id) ?? list.find((x) => x.id === fallback) ?? list[0];

/** Tur tugmasidagi kichik ikonka (prototipdagi SVG'lar). */
function TypeIcon({ id }: { id: string }) {
  const stroke = { stroke: 'var(--graphite)', strokeWidth: 2 };
  if (id === 'b') {
    return (
      <svg width="64" height="52" viewBox="0 0 64 52" aria-hidden="true">
        <rect x="1" y="1" width="62" height="50" fill="none" {...stroke} />
        <path d="M24 1v50M24 30h39" {...stroke} />
      </svg>
    );
  }
  const n = Math.min(Math.max(Math.round(+id) || 1, 1), 6);
  const w = n === 1 ? 40 : n === 2 ? 60 : 26 * n;
  const d = Array.from({ length: n - 1 }, (_, i) => `M${(w * (i + 1)) / n} 1v50`).join('');
  return (
    <svg width={w} height="52" viewBox={`0 0 ${w} 52`} aria-hidden="true">
      <rect x="1" y="1" width={w - 2} height="50" fill="none" {...stroke} />
      {d && <path d={d} {...stroke} />}
    </svg>
  );
}

type Pane = [number, number, number, number, number | 'd' | 'w'];

/** Prototipdagi draw() — JSX ko'rinishida. */
function WindowDrawing({
  w,
  h,
  typeId,
  color,
  sill,
  mm,
  label,
}: {
  w: number;
  h: number;
  typeId: string;
  color: string;
  sill: boolean;
  mm: string;
  label: string;
}) {
  const sc = Math.min(400 / w, 340 / h);
  const W = w * sc;
  const H = h * sc;
  const x = (520 - W) / 2 - 10;
  const y = 24;
  const panes: Pane[] = [];
  let lower: { x: number; y: number; w: number; h: number } | null = null;
  if (typeId === 'b') {
    const dw = W * 0.38;
    panes.push([x, y, dw, H, 'd']);
    panes.push([x + dw, y, W - dw, H * 0.58, 'w']);
    lower = { x: x + dw, y: y + H * 0.58, w: W - dw, h: H * 0.42 };
  } else {
    const n = Math.max(Math.round(+typeId) || 1, 1);
    const pw = W / n;
    for (let i = 0; i < n; i++) panes.push([x + i * pw, y, pw, H, i]);
  }
  const f = 12;
  return (
    <svg viewBox="0 0 520 460" width="520" height="460" role="img" aria-label={label}>
      <defs>
        <linearGradient id={GLASS_GRAD} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--glass1)" />
          <stop offset=".55" stopColor="var(--glass2)" />
          <stop offset="1" stopColor="var(--glass3)" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={W} height={H} rx="3" fill={color} stroke="var(--graphite)" strokeOpacity=".35" />
      {lower && (
        <rect x={lower.x} y={lower.y} width={lower.w} height={lower.h} fill={color} stroke="var(--graphite)" strokeOpacity=".3" />
      )}
      {panes.map(([px, py, pw, ph, k], i) => {
        const handle = i % 2 === 0 || k === 'd';
        const hx = px + pw - f - 6;
        return (
          <g key={i}>
            <rect
              x={px + f}
              y={py + f}
              width={Math.max(pw - 2 * f, 0)}
              height={Math.max(ph - 2 * f, 0)}
              fill={`url(#${GLASS_GRAD})`}
              stroke="var(--graphite)"
              strokeOpacity=".35"
            />
            {handle && (
              <>
                <rect x={hx - 3} y={py + ph / 2 - 14} width="6" height="28" rx="3" fill="var(--brass)" />
                <path
                  d={`M${px + f} ${py + f} L${px + pw - f} ${py + ph / 2} L${px + f} ${py + ph - f}`}
                  fill="none"
                  stroke="var(--graphite)"
                  strokeOpacity=".25"
                  strokeDasharray="4 4"
                />
              </>
            )}
          </g>
        );
      })}
      {sill && <rect x={x - 10} y={y + H} width={W + 20} height="12" fill="var(--frame)" stroke="var(--graphite)" strokeOpacity=".25" />}
      <g style={{ fontFamily: 'var(--font)' }} fontSize="13" fill="var(--muted)">
        <line x1={x} y1={y + H + 34} x2={x + W} y2={y + H + 34} stroke="var(--muted)" />
        <text x={x + W / 2} y={y + H + 54} textAnchor="middle">
          {w} {mm}
        </text>
        <line x1={x + W + 28} y1={y} x2={x + W + 28} y2={y + H} stroke="var(--muted)" />
        <text x={x + W + 38} y={y + H / 2}>
          {h} {mm}
        </text>
      </g>
    </svg>
  );
}

function Configurator() {
  const { data } = usePriceSettings();
  const cfg = data ?? EMPTY_PRICE_CONFIG;
  const { language, t } = useLanguage();
  const { tx } = useText();
  const location = useLocation();
  const { products } = useCatalog();
  const uid = useId();

  const [typeId, setTypeId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [glassId, setGlassId] = useState('');
  const [furnitureId, setFurnitureId] = useState('');
  const [lamId, setLamId] = useState('');
  /** null — admin belgilagan standart qo'shimchalar */
  const [extras, setExtras] = useState<string[] | null>(null);
  // Avval router state (yoki standart) — server render bilan bir xil; localStorage esa mount'dan keyin
  const [dims, setDims] = useState<[string, string]>(() => readDims(location.state, false));
  useEffect(() => {
    if (!location.state) setDims(readDims(null, true));
    // faqat birinchi mount'da
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<WindowSelection[]>([]);
  const [presetId, setPresetId] = useState('');

  // Katalogdan kelganda (#mahsulot-id): profil turi va seriyasini qo'yish
  const appliedHash = useRef('');
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || appliedHash.current === location.hash) return;
    const p = products.find((x) => x.id === id && x.calc);
    if (!p?.calc) return;
    appliedHash.current = location.hash;
    setMaterialId(p.calc.material);
    setSeriesId(p.calc.series);
    setPresetId(p.id);
  }, [location.hash, products]);

  const type = resolve(cfg.types, typeId, DEFAULT_TYPE);
  const material = resolve(cfg.materials, materialId);
  const series = material ? resolve(material.series, seriesId, material.defaultSeries) : undefined;
  const glass = resolve(cfg.glass, glassId, defaultOf(cfg.glass));
  const fur = resolve(cfg.furniture, furnitureId, defaultOf(cfg.furniture));
  const lam = resolve(cfg.lamination, lamId);
  const extraIds = extras ?? cfg.extras.filter((e) => e.isDefault).map((e) => e.id);
  const [w, h] = dims;

  const sel: WindowSelection = {
    typeId: type?.id ?? '',
    materialId: material?.id ?? '',
    seriesId: series?.id ?? '',
    glassId: glass?.id ?? '',
    furnitureId: fur?.id ?? '',
    laminationId: lam?.id ?? '',
    extras: extraIds,
    widthMm: +w || 0,
    heightMm: +h || 0,
    qty,
  };

  const describe = (s: WindowSelection) => {
    const ty = cfg.types.find((x) => x.id === s.typeId);
    const ser = cfg.materials.find((m) => m.id === s.materialId)?.series.find((x) => x.id === s.seriesId);
    const lm = cfg.lamination.find((x) => x.id === s.laminationId);
    const { one, m2 } = windowPrice(cfg, s);
    return {
      name: tx('kalk.items.name', { type: pick(ty?.label, language) }),
      desc: tx('kalk.items.desc', {
        w: s.widthMm,
        h: s.heightMm,
        series: ser?.name || '—',
        lam: pick(lm?.name, language) || '—',
        qty: s.qty,
      }),
      sum: one * s.qty,
      m2: m2 * s.qty,
    };
  };

  const cur = describe(sel);
  const rows = items.map(describe);
  const total = cur.sum + rows.reduce((s, r) => s + r.sum, 0);
  const months = cfg.installment.defaultMonths;
  const perMonth = monthly(total, months, cfg);
  const shownTotal = useTween(total);
  const priced = !!data && total > 0;
  const sample = !data || data.isSample;
  const m2Text = cur.m2.toFixed(2).replace('.', ',');

  const toggleExtra = (id: string) =>
    setExtras(extraIds.includes(id) ? extraIds.filter((x) => x !== id) : [...extraIds, id]);

  const addItem = () => {
    setItems((prev) => [...prev, sel]);
    setQty(1);
  };

  // Ariza bilan leads jadvaliga yoziladigan hisob
  const summary = {
    page: '/kalkulyator',
    lang: language,
    items: rows.map((r) => ({ name: r.name, desc: r.desc, sum: Math.round(r.sum) })),
    current: {
      ...sel,
      name: cur.name,
      desc: cur.desc,
      material: pick(material?.label, language),
      series: series?.name ?? '',
      glass: pick(glass?.label, language),
      furniture: pick(fur?.label, language),
      lamination: pick(lam?.name, language),
      extrasLabels: cfg.extras.filter((e) => extraIds.includes(e.id)).map((e) => pick(e.label, language)),
      m2: +cur.m2.toFixed(2),
      sum: Math.round(cur.sum),
    },
    total: Math.round(total),
    monthly: priced ? { months, sum: Math.round(perMonth) } : null,
    priced,
    isSample: sample,
  };

  const presetName = products.find((p) => p.id === presetId)?.name;

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
        <div className="box">
          <div className="types" role="group" aria-label={tx('kalk.types.title')}>
            <T k="kalk.types.title" as="h3" />
            {cfg.types.map((ty) => (
              <button
                key={ty.id}
                type="button"
                className="tbtn"
                aria-pressed={ty.id === type?.id}
                onClick={() => setTypeId(ty.id)}
              >
                <TypeIcon id={ty.id} />
                {pick(ty.label, language)}
              </button>
            ))}
          </div>

          <div className="stage">
            <WindowDrawing
              w={Math.max(+w || 0, 0) || 1000}
              h={Math.max(+h || 0, 0) || 1000}
              typeId={type?.id ?? ''}
              color={lam?.hex || FRAME_FALLBACK}
              sill={extraIds.includes(SILL_ID)}
              mm={tx('kalk.unit.mm')}
              label={tx('kalk.draw.aria')}
            />
            <div className="dims">
              <div className="fld">
                <label htmlFor={`${uid}-w`}>{tx('kalk.dims.width')}</label>
                <input
                  id={`${uid}-w`}
                  type="number"
                  inputMode="numeric"
                  min={400}
                  max={4000}
                  step={10}
                  value={w}
                  onChange={(e) => setDims([e.target.value, h])}
                />
              </div>
              <div className="fld">
                <label htmlFor={`${uid}-h`}>{tx('kalk.dims.height')}</label>
                <input
                  id={`${uid}-h`}
                  type="number"
                  inputMode="numeric"
                  min={400}
                  max={3000}
                  step={10}
                  value={h}
                  onChange={(e) => setDims([w, e.target.value])}
                />
              </div>
            </div>
          </div>

          <div className="opts">
            {cfg.materials.length > 0 && (
              <div>
                <T k="kalk.opts.material" as="h3" />
                <div className="seg" role="group" aria-label={tx('kalk.opts.material')}>
                  {cfg.materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={m.id === material?.id}
                      onClick={() => {
                        setMaterialId(m.id);
                        setSeriesId('');
                      }}
                    >
                      {pick(m.label, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {material && material.series.length > 0 && (
              <div>
                <h3>
                  <label htmlFor={`${uid}-ser`}>{tx('kalk.opts.series')}</label>
                </h3>
                <select id={`${uid}-ser`} value={series?.id ?? ''} onChange={(e) => setSeriesId(e.target.value)}>
                  {material.series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {cfg.glass.length > 0 && (
              <div>
                <h3>
                  <label htmlFor={`${uid}-gl`}>{tx('kalk.opts.glass')}</label>
                </h3>
                <select id={`${uid}-gl`} value={glass?.id ?? ''} onChange={(e) => setGlassId(e.target.value)}>
                  {cfg.glass.map((g) => (
                    <option key={g.id} value={g.id}>
                      {pick(g.label, language)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {cfg.furniture.length > 0 && (
              <div>
                <h3>
                  <label htmlFor={`${uid}-fur`}>{tx('kalk.opts.furniture')}</label>
                </h3>
                <select id={`${uid}-fur`} value={fur?.id ?? ''} onChange={(e) => setFurnitureId(e.target.value)}>
                  {cfg.furniture.map((x) => (
                    <option key={x.id} value={x.id}>
                      {pick(x.label, language)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {cfg.lamination.length > 0 && (
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
                        onClick={() => setLamId(l.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {cfg.extras.length > 0 && (
              <div>
                <T k="kalk.opts.extras" as="h3" />
                <div className="checks">
                  {cfg.extras.map((e) => (
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
                <button type="button" aria-label={tx('kalk.qty.minus')} onClick={() => setQty((n) => Math.max(1, n - 1))}>
                  −
                </button>
                <output>{qty}</output>
                <button type="button" aria-label={tx('kalk.qty.plus')} onClick={() => setQty((n) => Math.min(50, n + 1))}>
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
                    ? tx('kalk.total.metaMulti', { n: rows.length + 1, m2: m2Text })
                    : tx('kalk.total.metaOne', { m2: m2Text })}
                </span>
                .
                {priced && (
                  <>
                    {' '}
                    {tx('kalk.total.monthlyPre', { months })} <b>{tx('kalk.total.monthly', { sum: money(perMonth) })}</b>.
                  </>
                )}
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
                  {data && r.sum > 0 ? (
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
  return (
    <>
      <PageHead prefix="kalk" crumb={t.nav.calculator} kpis />
      <Configurator />
      <Factors />
    </>
  );
}
