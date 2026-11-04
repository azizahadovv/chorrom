import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { ListEditLink, Photo, PhotoBox, T } from '@/components/site/Content';
import { LeadButton } from '@/components/site/Lead';
import { PageHead, usePageSEO } from '@/components/site/PageHead';
import { LogoMark } from '@/components/Logo';

function Timeline() {
  const { items, f } = useList('team.timeline');
  const { tx } = useText();
  return (
    <>
      <ListEditLink name="team.timeline" />
      {items.length > 0 && (
        <div className="tl" aria-label={tx('team.owner.tlAria')}>
          {items.map((it, i) => (
            <div key={i}>
              <b>{f(it, 'year')}</b>
              <p>{f(it, 'text')}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Owner() {
  const { show, lang } = useText();
  const uid = useId();
  const [open, close] = lang === 'ru' ? ['«', '»'] : ['“', '”'];
  return (
    <section className="sec" aria-labelledby={show('team.owner.name') ? uid : undefined}>
      <div className="wrap owner">
        <Photo k="team.owner.photo" />
        <div>
          <T k="team.owner.label" style={{ font: "600 13px var(--font)", color: 'var(--muted)' }} />
          <T k="team.owner.name" as="h2" id={uid} />
          <T k="team.owner.role" as="p" className="sub" style={{ marginTop: 8 }} />
          <T k="team.owner.letter" paras className="letter" />
          {show('team.owner.quote') && (
            <p className="quote">
              {open}
              <T k="team.owner.quote" />
              {close}
            </p>
          )}
          <Timeline />
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link className="btn btn-ink" to="/shourum">
              <T k="team.owner.cta1" />
            </Link>
            <LeadButton topicKey="team.owner.askTopic" className="btn btn-ghost">
              <T k="team.owner.cta2" />
            </LeadButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rules() {
  const { items, f } = useList('team.rules');
  const uid = useId();
  return (
    <section className="sec dark" style={{ background: 'var(--graphite)', color: 'var(--white)' }} aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="team.rules.title" as="h2" className="h2" id={uid} />
          </div>
        </div>
        <ListEditLink name="team.rules" dark />
        <div className="values">
          {items.map((it, i) => (
            <div key={i}>
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Members() {
  const { items, f } = useList('team.members');
  const uid = useId();
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="team.members.title" as="h2" className="h2" id={uid} />
            <T k="team.members.text" as="p" className="sub" />
          </div>
        </div>
        <ListEditLink name="team.members" />
        {items.length > 0 && (
          <div className="team">
            {items.map((it, i) => {
              const name = f(it, 'name');
              return (
                <div className="mem" key={i}>
                  <PhotoBox src={it.photo} label={f(it, 'photoLabel')} alt={name} width={400} height={520} />
                  <div className="b">
                    <b>{name}</b>
                    {f(it, 'role') && <div className="role">{f(it, 'role')}</div>}
                    {f(it, 'text') && <p>{f(it, 'text')}</p>}
                    {f(it, 'exp') && <span className="exp">{f(it, 'exp')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Footer /jamoa#ish ga havola qiladi */}
        <div className="hire" id="ish" style={{ marginTop: 40 }}>
          <div>
            <T k="team.hire.title" as="h3" />
            <T k="team.hire.text" as="p" />
          </div>
          <LeadButton topicKey="team.hire.topic" className="btn btn-ink">
            <T k="team.hire.cta" />
          </LeadButton>
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const { tx } = useText();
  return (
    <section className="gu" aria-label={tx('team.gu.aria')}>
      <div className="wrap">
        <LogoMark size={120} />
        <div>
          <T k="team.gu.title" as="h2" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <LeadButton topicKey="common.lead.defaultTopic" className="btn btn-brass">
              <T k="team.gu.cta1" />
            </LeadButton>
            <Link className="btn btn-line" to="/shourum">
              <T k="team.gu.cta2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Jamoa() {
  usePageSEO('team');
  const { t } = useLanguage();
  return (
    <>
      <PageHead prefix="team" crumb={t.nav.team} kpis />
      <Owner />
      <Rules />
      <Members />
      <Offer />
    </>
  );
}
