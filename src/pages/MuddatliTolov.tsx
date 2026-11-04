import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { EMPTY_PRICE_CONFIG, money } from '@/lib/pricing';
import { useTween } from '@/lib/motion';
import { ListEditLink, T } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const STEP_NUM: React.CSSProperties = {
  display: 'inline-flex',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'var(--graphite)',
  color: 'var(--brass)',
  font: "700 15px var(--font)",
  alignItems: 'center',
  justifyContent: 'center',
};

function InstallmentCalc() {
  const { data: cfg } = usePriceSettings();
  const { t } = useLanguage();
  const { tx } = useText();
  const uid = useId();
  const ic = cfg?.installment ?? EMPTY_PRICE_CONFIG.installment;
  const monthsList = ic.months.length ? ic.months : EMPTY_PRICE_CONFIG.installment.months;

  // null — foydalanuvchi hali tegmagan: sozlamalardagi standart qiymat ishlatiladi
  const [sumV, setSumV] = useState<number | null>(null);
  const [firstV, setFirstV] = useState<number | null>(null);
  const [moV, setMoV] = useState<number | null>(null);

  const sum = clamp(sumV ?? ic.sumDefault, ic.sumMin, ic.sumMax);
  const firstPct = clamp(firstV ?? ic.firstDefault, ic.firstMin, ic.firstMax);
  const fallbackMonths = monthsList.includes(ic.defaultMonths) ? ic.defaultMonths : monthsList[monthsList.length - 1];
  const months = moV !== null && monthsList.includes(moV) ? moV : fallbackMonths;

  // Ustama — bank sharti; admin kiritmagan bo'lsa 0
  const markup = ic.markup[String(months)] ?? 0;
  const first = (sum * firstPct) / 100;
  const rest = sum - first;
  const total = rest * (1 + markup / 100);
  const perMonth = total / months;
  const shownMonth = useTween(perMonth);
  const som = (n: number) => `${money(n)} ${t.common.sum}`;

  return (
    <section className="sec" style={{ paddingTop: 48 }} aria-labelledby={`${uid}-t`}>
      <div className="wrap">
        <T k="inst.calc.title" as="h2" className="h2" id={`${uid}-t`} style={{ fontSize: 28, marginBottom: 20 }} />
        <div className="icalc">
          <div className="l">
            <label htmlFor={`${uid}-s`} style={{ font: "600 14px var(--font)" }}>
              {tx('inst.calc.sum')}
            </label>
            <div className="amt">{som(sum)}</div>
            <input
              id={`${uid}-s`}
              type="range"
              min={ic.sumMin}
              max={ic.sumMax}
              step={ic.sumStep}
              value={sum}
              aria-valuetext={som(sum)}
              onChange={(e) => setSumV(+e.target.value)}
            />
            <label htmlFor={`${uid}-f`} style={{ font: "600 14px var(--font)", display: 'block', marginTop: 18 }}>
              {tx('inst.calc.first')}
            </label>
            <div style={{ font: "700 18px var(--font)", marginTop: 4 }}>{tx('inst.calc.firstValue', { pct: firstPct, sum: som(first) })}</div>
            <input
              id={`${uid}-f`}
              type="range"
              min={ic.firstMin}
              max={ic.firstMax}
              step={ic.firstStep}
              value={firstPct}
              aria-valuetext={tx('inst.calc.firstValue', { pct: firstPct, sum: som(first) })}
              onChange={(e) => setFirstV(+e.target.value)}
            />
            <div id={`${uid}-m`} style={{ font: "600 14px var(--font)", marginTop: 18 }}>
              {tx('inst.calc.term')}
            </div>
            <div className="months" role="group" aria-labelledby={`${uid}-m`}>
              {monthsList.map((n) => (
                <button key={n} type="button" aria-pressed={months === n} onClick={() => setMoV(n)}>
                  {tx('inst.calc.monthOption', { n })}
                </button>
              ))}
            </div>
            <T k="inst.calc.note" as="p" className="demo" style={{ color: 'var(--muted)' }} />
          </div>
          <div className="r" aria-live="polite">
            <T k="inst.calc.perMonth" style={{ color: 'var(--mist)' }} />
            <div className="big">
              <span aria-hidden="true">{som(shownMonth)}</span>
              <span className="sr">{som(perMonth)}</span>
            </div>
            <span style={{ color: 'var(--mist)' }}>{tx('inst.calc.during', { n: months })}</span>
            <LeadButton
              topicKey="inst.calc.apply"
              style={{ marginTop: 20 }}
              opts={{ calc: { sum, firstPct, first: Math.round(first), months, monthly: Math.round(perMonth) } }}
            />
            <Link className="btn btn-line" to="/kalkulyator">
              <T k="inst.calc.toCalc" />
            </Link>
          </div>
        </div>
        <table className="plan" style={{ marginTop: 20 }}>
          <caption style={{ textAlign: 'left', font: "700 18px var(--font)", padding: '0 0 12px' }}>{tx('inst.plan.caption')}</caption>
          <thead>
            <tr>
              <th>{tx('inst.plan.month')}</th>
              <th>{tx('inst.plan.payment')}</th>
              <th>{tx('inst.plan.rest')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(months, 12) }, (_, i) => (
              <tr key={i}>
                <td>{tx('inst.plan.row', { n: i + 1 })}</td>
                <td>{som(perMonth)}</td>
                <td>{som(Math.max(total - perMonth * (i + 1), 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Steps() {
  const { items, f } = useList('inst.steps');
  const uid = useId();
  return (
    <section className="sec" style={{ background: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="inst.steps.title" as="h2" className="h2" id={uid} />
            <T k="inst.steps.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="inst.steps" />
        <div className="need">
          {items.map((it, i) => (
            <div key={i}>
              <span className="n" style={STEP_NUM}>
                {i + 1}
              </span>
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { items, f } = useList('inst.faq');
  const uid = useId();
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap faq">
        <div>
          <T k="inst.faq.title" as="h2" className="h2" id={uid} />
        </div>
        <div>
          <ListEditLink name="inst.faq" />
          {items.map((it, i) => (
            <details key={i} open={i === 0}>
              <summary>{f(it, 'q')}</summary>
              <p>{f(it, 'a')}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MuddatliTolov() {
  const { t } = useLanguage();
  usePageSEO('inst');
  return (
    <>
      <PageHead prefix="inst" crumb={t.nav.installment} kpis />
      <InstallmentCalc />
      <Steps />
      <Faq />
    </>
  );
}
