import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { usePriceSettings } from '@/hooks/usePriceSettings';
import { DIMS_KEY, defaultOf, money, monthly, pick, quickPrice } from '@/lib/pricing';
import { useTween } from '@/lib/motion';
import { LazyImage } from '@/components/LazyImage';
import { ListEditLink, T, usePhotoEdit } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { FinSection } from '@/components/site/FinSection';
import { telHref } from '@/components/site/SiteLayout';
import { usePageSEO } from '@/components/site/PageHead';

function Hero() {
  const { items, f } = useList('home.facts');
  const photo = usePhotoEdit('home.hero.photo');
  return (
    <section className="v4hero" aria-labelledby="h1">
      <div className="txt">
        <div>
          <T k="home.hero.title" as="h1" id="h1" />
          <T k="home.hero.lead" as="p" className="l" />
          <div className="ctas">
            <LeadButton topicKey="common.lead.defaultTopic">
              <T k="home.hero.cta1" />
            </LeadButton>
            <Link className="btn btn-line" to="/kalkulyator">
              <T k="home.hero.cta2" />
            </Link>
          </div>
        </div>
        <ListEditLink name="home.facts" dark />
        {items.length > 0 && (
          <div className="facts4">
            {items.map((it, i) => (
              <div key={i}>
                <b>{f(it, 'title')}</b>
                {f(it, 'text')}
              </div>
            ))}
          </div>
        )}
      </div>
      <figure {...photo.editProps}>
        {photo.src ? (
          <LazyImage src={photo.src} alt={photo.alt} priority sizes="(max-width: 1080px) 100vw, 58vw" />
        ) : (
          <span className="ph fill">{photo.alt}</span>
        )}
        <T k="home.hero.caption" as="figcaption" />
      </figure>
    </section>
  );
}

function Works() {
  const { items, f } = useList('home.works');
  const uid = useId();
  if (!items.length) return null;
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <T k="home.works.title" as="h2" className="h2" id={uid} />
          <Link className="link" to="/ishlarimiz">
            <T k="home.works.link" />
          </Link>
        </div>
        <ListEditLink name="home.works" />
        <div className="mosaic">
          {items.map((it, i) => (
            <figure className={'abc'[i] ?? ''} key={i}>
              <LazyImage src={it.photo} alt={f(it, 'alt') || f(it, 'title')} sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 40vw" />
              <figcaption>
                {f(it, 'title')}
                {f(it, 'place') && <small>{f(it, 'place')}</small>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rows() {
  const { items, f } = useList('home.rows');
  const { tx } = useText();
  const uid = useId();
  if (!items.length) return null;
  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head" style={{ marginBottom: 28 }}>
          <T k="home.rows.title" as="h2" className="h2" id={uid} />
        </div>
        <ListEditLink name="home.rows" />
        <div className="rows">
          {items.map((it, i) => (
            <Link className="rowi" to={it.href || '/katalog'} key={i}>
              <div>
                <h3>{f(it, 'title')}</h3>
                {f(it, 'text') && <p>{f(it, 'text')}</p>}
              </div>
              <div className="pr">
                {tx('home.rows.priceLabel')}
                <b>{tx('home.rows.priceValue')}</b>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const { data: cfg } = usePriceSettings();
  const { language, t } = useLanguage();
  const { tx } = useText();
  const navigate = useNavigate();
  const uid = useId();
  const [w, setW] = useState('1400');
  const [h, setH] = useState('1500');
  // Tanlanmagan bo'lsa standart to'plam darhol (oldindan chizilgan HTML'da ham narx ko'rinsin)
  const [chosenPack, setPack] = useState('');
  const pack = chosenPack || (cfg ? defaultOf(cfg.packs) : '');
  const total = cfg ? quickPrice(cfg, +w, +h, pack) : 0;
  const shown = useTween(total);
  const perMonth = tx('home.quick.monthly', { sum: money(monthly(total, 12, cfg)) });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(DIMS_KEY, JSON.stringify([w, h]));
    } catch {
      /* localStorage yopiq bo'lishi mumkin */
    }
    navigate('/kalkulyator', { state: { dims: [w, h] } });
  };

  return (
    <section className="sec offer" aria-labelledby={uid}>
      <div className="wrap">
        <div>
          <T k="home.offer.title" as="h2" className="h2" id={uid} />
          <T k="home.offer.text" as="p" className="sub" />
          <form className="ocalc" aria-label={tx('home.quick.aria')} onSubmit={onSubmit}>
            <div className="fld">
              <label htmlFor={`${uid}-w`}>{tx('home.quick.width')}</label>
              <input id={`${uid}-w`} type="number" inputMode="numeric" min={400} max={4000} step={10} value={w} onChange={(e) => setW(e.target.value)} />
            </div>
            <div className="fld">
              <label htmlFor={`${uid}-h`}>{tx('home.quick.height')}</label>
              <input id={`${uid}-h`} type="number" inputMode="numeric" min={400} max={3000} step={10} value={h} onChange={(e) => setH(e.target.value)} />
            </div>
            {cfg && cfg.packs.length > 0 && (
              <div className="fld full">
                <label htmlFor={`${uid}-s`}>{tx('home.quick.pack')}</label>
                <select id={`${uid}-s`} value={pack} onChange={(e) => setPack(e.target.value)}>
                  {cfg.packs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {pick(p.label, language)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn btn-ink full" type="submit">
              {tx('home.quick.submit')}
            </button>
          </form>
        </div>
        <div>
          {total > 0 ? (
            <>
              {/* Raqam silliq sanaladi; ekran o'quvchiga faqat yakuniy qiymat aytiladi */}
              <div className="bigp" aria-hidden="true">
                {money(shown)} <small>{t.common.sum}</small>
              </div>
              <p style={{ marginTop: 14, fontSize: 17 }} aria-hidden="true">
                {tx('home.quick.or')} <b>{perMonth}</b> {tx('home.quick.monthlyTail')}
              </p>
              <p className="sr" aria-live="polite">
                {money(total)} {t.common.sum}, {tx('home.quick.or')} {perMonth} {tx('home.quick.monthlyTail')}
              </p>
            </>
          ) : (
            <div className="bigp" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>
              {t.common.priceOnRequest}
            </div>
          )}
          {(!cfg || cfg.isSample) && (
            <p className="demo" style={{ color: 'var(--muted)', marginTop: 10 }}>
              {t.common.sampleNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ShowroomBand() {
  const { tx } = useText();
  const photo = usePhotoEdit('home.showroom.photo');
  const uid = useId();
  const phone = tx('common.contact.phone');
  return (
    <section className="sband" aria-labelledby={uid}>
      <div className="bg" {...photo.editProps}>
        {photo.src && <LazyImage src={photo.src} alt="" sizes="100vw" style={{ objectPosition: '50% 40%' }} />}
      </div>
      <div className="card4">
        <T k="home.showroom.title" as="h2" id={uid} />
        <T k="home.showroom.text" as="p" />
        <dl>
          <T k="home.showroom.address" as="dt" />
          <T k="common.contact.address" as="dd" />
          <T k="home.showroom.hours" as="dt" />
          <T k="common.contact.hours" as="dd" />
          <T k="home.showroom.phone" as="dt" />
          <dd>
            <a href={telHref(phone)}>{phone}</a>
          </dd>
        </dl>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <Link className="btn btn-brass" to="/shourum">
            <T k="home.showroom.cta1" />
          </Link>
          <Link className="btn btn-line" to="/jamoa">
            <T k="home.showroom.cta2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const { items, f } = useList('home.steps');
  const uid = useId();
  if (!items.length) return null;
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <T k="home.steps.title" as="h2" className="h2" id={uid} />
          <Link className="link" to="/nega-biz">
            <T k="home.steps.link" />
          </Link>
        </div>
        <ListEditLink name="home.steps" />
        <div className="steps4">
          {items.map((it, i) => (
            <div key={i}>
              <span className="n">{i + 1}</span>
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  usePageSEO('home');
  return (
    <>
      <Hero />
      <Works />
      <Rows />
      <Offer />
      <ShowroomBand />
      <Steps />
      <FinSection />
    </>
  );
}
