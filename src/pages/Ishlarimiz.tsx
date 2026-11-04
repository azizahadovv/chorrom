import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { isFilled } from '@/content/placeholder';
import { ListEditLink, Photo, PhotoBox, T } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';
import { LogoMark } from '@/components/Logo';

/** "Issiq alyumin, Antratsit" → belgilar; mehmonga to'ldirilmagan ([Rang]) belgilar ko'rsatilmaydi. */
const splitChips = (value: string, editing: boolean) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && (editing || isFilled(s)));

function Case() {
  const { show } = useText();
  const uid = useId();
  const rows = [
    ['works.case.taskLabel', 'works.case.task'],
    ['works.case.solutionLabel', 'works.case.solution'],
    ['works.case.resultLabel', 'works.case.result'],
  ].filter(([, body]) => show(body));
  return (
    <section className="sec" style={{ paddingTop: 48 }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="case">
          <Photo k="works.case.photo" priority />
          <div className="in">
            <T k="works.case.label" style={{ font: "600 13px var(--font)", color: 'var(--muted)' }} />
            <T k="works.case.title" as="h2" id={uid} />
            <div className="chips" style={{ marginTop: 12 }}>
              <T k="works.case.chip1" className="chip" />
              <T k="works.case.chip2" className="chip" />
              <T k="works.case.chip3" className="chip" />
            </div>
            {rows.length > 0 && (
              <div className="tsr">
                {rows.map(([label, body]) => (
                  <div key={body}>
                    <T k={label} as="b" />
                    <T k={body} as="p" />
                  </div>
                ))}
              </div>
            )}
            <LeadButton topicKey="works.case.topic" className="btn btn-ink" style={{ marginTop: 28 }}>
              <T k="works.case.cta" />
            </LeadButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function AllWorks() {
  const { items, f, editing } = useList('works.items');
  const filters = useList('works.filters');
  const { tx } = useText();
  const uid = useId();
  const [kind, setKind] = useState('all');

  // Mehmonga ishi yo'q turdagi filtr tugmasi ko'rsatilmaydi (bo'sh natija chiqmasin)
  const chips = filters.items.filter((c) => editing || c.value === 'all' || items.some((it) => it.kind === c.value));
  const list = items.filter((it) => kind === 'all' || it.kind === kind);

  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-labelledby={uid}>
      <div className="wrap">
        <T k="works.all.title" as="h2" className="h2" id={uid} style={{ marginBottom: 22 }} />
        <ListEditLink name="works.filters" />
        {chips.length > 1 && (
          <div className="fchips" role="group" aria-label={tx('works.all.filterAria')}>
            {chips.map((c, i) => (
              <button className="tab" type="button" aria-pressed={kind === c.value} onClick={() => setKind(c.value)} key={i}>
                {filters.f(c, 'label')}
              </button>
            ))}
          </div>
        )}
        <ListEditLink name="works.items" />
        <div className="works" id="works">
          {list.map((it, i) => {
            const title = f(it, 'title');
            const place = f(it, 'place');
            const tags = splitChips(f(it, 'chips'), editing);
            return (
              <div className="work" key={i}>
                <PhotoBox src={it.photo} label={f(it, 'photoLabel')} alt={title} width={600} height={600} />
                <h3>{title}</h3>
                {place && <p>{place}</p>}
                {tags.length > 0 && (
                  <div className="chips">
                    {tags.map((tag, j) => (
                      <span className="chip" key={j}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const { items, f, editing } = useList('works.reviews');
  const videos = useList('works.videos');
  const { show } = useText();
  const uid = useId();
  // Haqiqiy sharh qo'shilmaguncha bo'lim mehmonga ko'rsatilmaydi
  if (!editing && !items.length && !videos.items.length) return null;
  return (
    <section className="sec" style={{ background: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="works.reviews.title" as="h2" className="h2" id={uid} />
            <T k="works.reviews.text" as="p" className="sub" />
          </div>
          {show('works.rating.value') && (
            <div
              className="rate"
              style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 14, padding: '10px 16px' }}
            >
              <T k="works.rating.value" as="b" style={{ font: "700 24px var(--font)" }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                <T k="works.rating.source" />
                {show('works.rating.count') && (
                  <>
                    <br />
                    <T k="works.rating.count" />
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        <ListEditLink name="works.videos" />
        <ListEditLink name="works.reviews" />
        <div className="rv">
          {videos.items.map((v, i) => {
            const body = (
              <>
                <div className="play" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="var(--graphite)" />
                  </svg>
                </div>
                <b style={{ font: "700 18px var(--font)" }}>{videos.f(v, 'title')}</b>
                {videos.f(v, 'note') && <span style={{ color: 'var(--mist)', fontSize: 14 }}>{videos.f(v, 'note')}</span>}
              </>
            );
            return v.url ? (
              <a className="vid" href={v.url} target="_blank" rel="noopener noreferrer" key={i}>
                {body}
              </a>
            ) : (
              <div className="vid" key={i}>
                {body}
              </div>
            );
          })}
          {items.map((it, i) => (
            <div className="rcard" key={i}>
              <q>{f(it, 'quote')}</q>
              <div className="who">
                <b>{f(it, 'name')}</b>
                {f(it, 'place') && <span>{f(it, 'place')}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const { tx } = useText();
  return (
    <section className="gu" aria-label={tx('works.gu.aria')}>
      <div className="wrap">
        <LogoMark size={120} />
        <div>
          <T k="works.gu.title" as="h2" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <LeadButton topicKey="common.lead.defaultTopic" className="btn btn-brass">
              <T k="works.gu.cta1" />
            </LeadButton>
            <Link className="btn btn-line" to="/kalkulyator">
              <T k="works.gu.cta2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Ishlarimiz() {
  usePageSEO('works');
  const { t } = useLanguage();
  const { filled, editing } = useText();
  const instagram = filled('common.contact.instagramUrl');
  const ctas =
    instagram || editing ? (
      <a className="btn btn-line" href={instagram || undefined} target="_blank" rel="noopener noreferrer">
        <T k="works.head.instagram" />
      </a>
    ) : undefined;
  return (
    <>
      <PageHead prefix="works" crumb={t.nav.works} ctas={ctas} />
      <Case />
      <AllWorks />
      <Reviews />
      <Offer />
    </>
  );
}
