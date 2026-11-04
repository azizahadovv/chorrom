import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { ListEditLink, Photo, T, usePhotoEdit } from '@/components/site/Content';
import { LazyImage } from '@/components/LazyImage';
import { LeadStatus, PhoneField, useLeadSubmit } from '@/components/site/Lead';
import { Icon } from '@/components/site/Icons';
import { usePageSEO } from '@/components/site/PageHead';

/**
 * Pagehead PageHead komponenti bilan bir xil belgilanishda, lekin KPI'larda manzil va ish vaqti
 * umumiy aloqa kalitlaridan olinadi (yagona manba), qolganlari `show.kpis` ro'yxatidan.
 */
function Head() {
  const { t } = useLanguage();
  const { show } = useText();
  const { items, f } = useList('show.kpis');
  return (
    <section className="pagehead">
      <div className="wrap">
        <nav className="crumbs" aria-label={t.nav.breadcrumbs}>
          <Link to="/">{t.nav.home}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t.nav.showroom}</span>
        </nav>
        <div className="row">
          <div>
            <T k="show.head.title" as="h1" />
            <T k="show.head.lead" as="p" className="lead" />
          </div>
          <div className="ctas">
            <a className="btn btn-brass" href="#tashrif">
              <T k="show.head.cta" />
            </a>
          </div>
        </div>
        <ListEditLink name="show.kpis" dark />
        <div className="kpis">
          {show('common.contact.addressShort') && (
            <div>
              <T k="common.contact.addressShort" as="b" />
              <T k="show.kpi.city" />
            </div>
          )}
          {show('common.contact.hours') && (
            <div>
              <T k="common.contact.hours" as="b" />
              <T k="show.kpi.hours" />
            </div>
          )}
          {items.map((it, i) => (
            <div key={i}>
              <b>{f(it, 'value')}</b>
              <span>{f(it, 'text')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function See() {
  const { items, f } = useList('show.see');
  const uid = useId();
  return (
    <section className="sec" aria-labelledby={uid}>
      <div className="wrap">
        <div className="head">
          <div>
            <T k="show.see.title" as="h2" className="h2" id={uid} />
          </div>
        </div>
        <ListEditLink name="show.see" />
        <div className="see">
          {items.map((it, i) => (
            <div key={i}>
              <Icon name={it.icon} color="var(--brass2)" size={36} />
              <h3>{f(it, 'title')}</h3>
              {f(it, 'text') && <p>{f(it, 'text')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pagehead ostidagi katta shourum fotosi */
function ShowroomPhoto() {
  const photo = usePhotoEdit('show.photo');
  if (!photo.src) return null;
  return (
    <section className="showph" aria-label={photo.alt} {...photo.editProps}>
      <LazyImage src={photo.src} alt={photo.alt} sizes="100vw" style={{ objectPosition: '50% 40%' }} />
    </section>
  );
}

function Founder() {
  const uid = useId();
  return (
    <section className="sec fd fd-show" aria-labelledby={uid}>
      <div className="wrap">
        <Photo k="show.founder.photo" />
        <div>
          <T k="show.founder.title" as="h2" id={uid} />
          <T k="show.founder.letter" paras className="letter" />
          <div className="sig">
            <T k="show.founder.name" as="b" />
            <T k="show.founder.role" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MapScheme() {
  const { tx, show } = useText();
  return (
    <div className="map2" role="img" aria-label={tx('show.map.aria')}>
      <svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="600" height="460" fill="var(--map)" />
        <path d="M0 290 L600 250" stroke="var(--white)" strokeWidth="22" />
        <path d="M220 0 L280 460" stroke="var(--white)" strokeWidth="16" />
        <path d="M0 120 L600 140" stroke="var(--white)" strokeWidth="10" />
        <path d="M430 0 L460 460" stroke="var(--white)" strokeWidth="10" />
        <g style={{ fontFamily: 'var(--font)' }} fontSize="13" fill="var(--muted2)">
          {show('show.map.mainStreet') && (
            <text x="20" y="282">
              {tx('show.map.mainStreet')}
            </text>
          )}
          {show('show.map.street') && (
            <text x="290" y="40">
              {tx('show.map.street')}
            </text>
          )}
        </g>
        <circle cx="330" cy="200" r="22" fill="var(--brass)" stroke="var(--white)" strokeWidth="6" />
        <rect x="358" y="176" width="190" height="48" rx="10" fill="var(--graphite)" />
        <text x="374" y="198" style={{ fontFamily: 'var(--font)' }} fontWeight="700" fontSize="15" fill="var(--white)">
          {tx('show.map.name')}
        </text>
        {show('common.contact.addressShort') && (
          <text x="374" y="215" style={{ fontFamily: 'var(--font)' }} fontSize="12" fill="var(--mist)">
            {tx('common.contact.addressShort')}
          </text>
        )}
      </svg>
    </div>
  );
}

function SlotGroup({
  name,
  labelKey,
  value,
  onChange,
}: {
  name: string;
  labelKey: string;
  value: number;
  onChange: (i: number) => void;
}) {
  const { items, f } = useList(name);
  const uid = useId();
  return (
    <div>
      <T k={labelKey} as="div" id={uid} style={{ font: "600 14px var(--font)", marginBottom: 8 }} />
      <ListEditLink name={name} />
      {items.length > 0 && (
        <div className="slots" role="group" aria-labelledby={uid}>
          {items.map((it, i) => (
            <button key={i} type="button" aria-pressed={value === i} onClick={() => onChange(i)}>
              {f(it, 'label')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Visit() {
  const { t } = useLanguage();
  const { tx, filled } = useText();
  const days = useList('show.days');
  const times = useList('show.times');
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { status, submit } = useLeadSubmit();
  const uid = useId();
  const mapUrl = filled('common.contact.mapUrl');

  // Ro'yxat qisqarsa tanlov chegaradan chiqmasin
  const dayIdx = Math.min(day, days.items.length - 1);
  const timeIdx = Math.min(time, times.items.length - 1);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = days.items[dayIdx] ? days.f(days.items[dayIdx], 'label') : '';
    const tm = times.items[timeIdx] ? times.f(times.items[timeIdx], 'label') : '';
    const ok = await submit({
      name,
      phone,
      topic: tx('show.book.title'),
      details: { day: d, time: tm },
    });
    if (ok) {
      setName('');
      setPhone('');
    }
  };

  return (
    <section className="sec" id="tashrif" aria-labelledby={`${uid}-t`}>
      <div className="wrap">
        <div className="visit">
          <MapScheme />
          <form className="book" aria-labelledby={`${uid}-t`} onSubmit={onSubmit} noValidate>
            <T k="show.book.title" as="h2" className="h2" id={`${uid}-t`} style={{ fontSize: 30 }} />
            <T k="show.book.text" as="p" style={{ color: 'var(--muted)' }} />
            <SlotGroup name="show.days" labelKey="show.book.day" value={dayIdx} onChange={setDay} />
            <SlotGroup name="show.times" labelKey="show.book.time" value={timeIdx} onChange={setTime} />
            <label htmlFor={`${uid}-n`} style={{ font: "600 13px var(--font)" }}>
              {t.form.name}
            </label>
            <input id={`${uid}-n`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor={`${uid}-p`} style={{ font: "600 13px var(--font)" }}>
              {t.form.phone}
            </label>
            <PhoneField id={`${uid}-p`} value={phone} onChange={setPhone} invalid={status === 'phone'} />
            <button className="btn btn-ink" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.form.sending : tx('show.book.submit')}
            </button>
            <LeadStatus status={status} />
            {mapUrl && (
              <a className="link" href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
                <T k="show.book.mapLink" />
              </a>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default function Shourum() {
  usePageSEO('show');
  return (
    <>
      <Head />
      <ShowroomPhoto />
      <See />
      <Founder />
      <Visit />
    </>
  );
}
