import { useId, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useList, useText } from '@/hooks/useContent';
import { ListEditLink, T } from './Content';
import { LeadStatus, PhoneField, useLeadSubmit } from './Lead';
import { TelegramLink, telHref } from './SiteLayout';

/** Sahifa oxiridagi "Ustani bepul chaqiring" bloki: ariza formasi + aloqa ma'lumotlari. */
export function FinSection() {
  const { t } = useLanguage();
  const { tx, show } = useText();
  const { items, f } = useList('common.finPick');
  const [pick, setPick] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { status, submit } = useLeadSubmit();
  const uid = useId();
  const phoneText = tx('common.contact.phone');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const what = items[pick] ? f(items[pick], 'label') : '';
    const ok = await submit({
      name,
      phone,
      topic: tx('common.fin.title') + (what ? `: ${what}` : ''),
      details: what ? { need: what } : undefined,
    });
    if (ok) {
      setName('');
      setPhone('');
    }
  };

  return (
    <section className="fin" aria-labelledby={`${uid}-t`}>
      <div className="wrap">
        <div>
          <T k="common.fin.title" as="h2" className="h2" id={`${uid}-t`} />
          <T k="common.fin.text" as="p" className="sub" style={{ color: 'var(--mist)' }} />
          <form className="lead" onSubmit={onSubmit} noValidate>
            <ListEditLink name="common.finPick" dark />
            {items.length > 0 && (
              <div className="pick" role="group" aria-label={tx('common.fin.pickAria')}>
                {items.map((it, i) => (
                  <button key={i} type="button" aria-pressed={pick === i} onClick={() => setPick(i)}>
                    {f(it, 'label')}
                  </button>
                ))}
              </div>
            )}
            <label htmlFor={`${uid}-n`} className="sr">
              {t.form.name}
            </label>
            <input id={`${uid}-n`} placeholder={t.form.name} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor={`${uid}-p`} className="sr">
              {t.form.phone}
            </label>
            <PhoneField id={`${uid}-p`} value={phone} onChange={setPhone} invalid={status === 'phone'} />
            <button className="btn btn-brass" style={{ minHeight: 58 }} type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.form.sending : tx('common.fin.submit')}
            </button>
            <LeadStatus status={status} />
          </form>
        </div>
        <div>
          <div className="ci" style={{ paddingTop: 0 }}>
            <T k="common.fin.phoneLabel" as="small" />
            <b>
              <a href={telHref(phoneText)}>{phoneText}</a>
            </b>
          </div>
          {show('common.contact.telegram') && (
            <div className="ci">
              <T k="common.fin.telegramLabel" as="small" />
              <b>
                <TelegramLink className="flink">
                  <T k="common.contact.telegram" />
                </TelegramLink>
              </b>
            </div>
          )}
          <div className="ci">
            <T k="common.fin.addressLabel" as="small" />
            <T k="common.contact.address" as="b" />
          </div>
          <div className="ci" style={{ border: 0 }}>
            <T k="common.fin.hoursLabel" as="small" />
            <T k="common.contact.hours" as="b" />
          </div>
        </div>
      </div>
    </section>
  );
}
