import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { ListEditLink, Photo, PhotoBox, T } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';
import { LogoMark } from '@/components/Logo';

function Compare() {
  const { items, f } = useList('why.compare');
  const uid = useId();
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="why.compare.title" as="h2" className="h2" id={uid} />
            <T k="why.compare.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="why.compare" />
        <div className="tbl">
          <div className="tr th">
            <div />
            <T k="why.compare.us" as="div" className="us" />
            <T k="why.compare.them" as="div" className="them" />
          </div>
          {items.map((it, i) => (
            <div className="tr" key={i}>
              <div className="k">{f(it, 'k')}</div>
              <div className="us">{f(it, 'us')}</div>
              <div className="them">{f(it, 'them')}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Akfa() {
  const { items, f } = useList('why.akfa.steps');
  const uid = useId();
  return (
    <section className="sec" style={{ background: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap split">
        <Photo k="why.akfa.photo" />
        <div>
          <T k="why.akfa.title" as="h2" className="h2" id={uid} />
          <T k="why.akfa.text" as="p" className="sub" />
          <ListEditLink name="why.akfa.steps" />
          <div className="mark">
            {items.map((it, i) => (
              <div key={i}>
                <span className="n">{i + 1}</span>
                <p>{f(it, 'text')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Warranty() {
  const { items, f, editing } = useList('why.warranty');
  const uid = useId();
  // Kafolat muddatlari to'ldirilmaguncha (prototipdagi [N] yil) jadval mehmonga ko'rsatilmaydi
  if (!items.length && !editing) return null;
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="why.warranty.title" as="h2" className="h2" id={uid} />
            <T k="why.warranty.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="why.warranty" />
        <div className="wtbl">
          <div className="tr th">
            <T k="why.warranty.colWhat" as="div" />
            <T k="why.warranty.col1" as="div" />
            <T k="why.warranty.col2" as="div" className="hl" />
            <T k="why.warranty.col3" as="div" />
          </div>
          {items.map((it, i) => (
            <div className="tr" key={i}>
              <div className="k">{f(it, 'what')}</div>
              <div>{f(it, 'c1')}</div>
              <div>{f(it, 'c2')}</div>
              <div>{f(it, 'c3')}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Montaj() {
  const { items, f } = useList('why.montaj');
  const uid = useId();
  return (
    <section className="sec dark" style={{ background: 'var(--graphite)', color: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="why.montaj.title" as="h2" className="h2" id={uid} />
            <T k="why.montaj.text" as="p" className="sub" />
          </div>
          <Link className="link" to="/jamoa" style={{ color: 'var(--white)' }}>
            <T k="why.montaj.link" />
          </Link>
        </div>
        <ListEditLink name="why.montaj" dark />
        <div className="mont">
          {items.map((it, i) => (
            <div className="mstep" key={i}>
              <b>{i + 1}</b>
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Docs() {
  const { items, f, editing } = useList('why.docs');
  const uid = useId();
  if (!items.length && !editing) return null;
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="why.docs.title" as="h2" className="h2" id={uid} />
            <T k="why.docs.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="why.docs" />
        <div className="docs">
          {items.map((it, i) =>
            it.image ? (
              <PhotoBox key={i} src={it.image} label={f(it, 'title')} className="doc ph" width={480} height={640} />
            ) : (
              <div className="doc" key={i}>
                {f(it, 'title')}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Guarantee() {
  const { tx } = useText();
  return (
    <section className="gu" aria-label={tx('why.gu.aria')}>
      <div className="wrap">
        <LogoMark size={120} />
        <div>
          <T k="why.gu.title" as="h2" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <LeadButton topicKey="common.lead.defaultTopic" className="btn btn-brass">
              <T k="why.gu.cta1" />
            </LeadButton>
            <Link className="btn btn-line" to="/ishlarimiz">
              <T k="why.gu.cta2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NegaBiz() {
  usePageSEO('why');
  const { t } = useLanguage();
  return (
    <>
      <PageHead prefix="why" crumb={t.nav.why} kpis />
      <Compare />
      <Akfa />
      <Warranty />
      <Montaj />
      <Docs />
      <Guarantee />
    </>
  );
}
