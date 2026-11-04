import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useText } from '@/hooks/useContent';
import { formatPhone, submitLead, type LeadInput } from '@/lib/leads';
import { T } from './Content';

type Status = 'idle' | 'sending' | 'ok' | 'error' | 'phone';

/** Har qanday ariza formasi uchun yuborish holati. */
export function useLeadSubmit() {
  const [status, setStatus] = useState<Status>('idle');
  const submit = useCallback(async (input: LeadInput) => {
    setStatus('sending');
    const res = await submitLead(input);
    setStatus(res.ok ? 'ok' : res.reason === 'phone' ? 'phone' : 'error');
    return res.ok;
  }, []);
  const reset = useCallback(() => setStatus('idle'), []);
  return { status, submit, reset };
}

/** Holat xabari: muvaffaqiyat yoki xato. */
export function LeadStatus({ status, className = 'ok' }: { status: Status; className?: string }) {
  const { t } = useLanguage();
  if (status === 'ok')
    return (
      <div className={`${className} show`} role="status">
        {t.form.success}
      </div>
    );
  if (status === 'phone' || status === 'error')
    return (
      <p className="ferr" role="alert">
        {status === 'phone' ? t.form.phoneInvalid : t.form.submitError}
      </p>
    );
  return null;
}

interface PhoneFieldProps {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}

export function PhoneField({ value, onChange, id, invalid, placeholder }: PhoneFieldProps) {
  const { t } = useLanguage();
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      required
      placeholder={placeholder ?? t.form.phonePlaceholder}
      aria-invalid={invalid || undefined}
      value={value}
      onFocus={() => !value && onChange('+998 ')}
      onChange={(e) => onChange(e.target.value.trim() === '' ? '' : formatPhone(e.target.value))}
    />
  );
}

interface LeadOptions {
  calc?: unknown;
  details?: Record<string, unknown>;
}

interface LeadCtx {
  /** topic — ko'rsatiladigan sarlavha (joriy tilda); u arizaga mavzu bo'lib yoziladi. */
  openLead: (topic?: string, opts?: LeadOptions) => void;
}

const Ctx = createContext<LeadCtx | null>(null);

export function useLead() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLead must be used within LeadProvider');
  return ctx;
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [topic, setTopic] = useState('');
  const [opts, setOpts] = useState<LeadOptions>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { status, submit, reset } = useLeadSubmit();
  const { tx } = useText();
  const { t } = useLanguage();
  const uid = useId();

  const openLead = useCallback(
    (tp?: string, o?: LeadOptions) => {
      setTopic(tp || tx('common.lead.defaultTopic'));
      setOpts(o ?? {});
      reset();
      ref.current?.showModal();
    },
    [reset, tx],
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // Fon ustiga bosilganda yopish
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener('click', onClick);
    return () => d.removeEventListener('click', onClick);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit({ name, phone, topic, calc: opts.calc, details: opts.details });
    if (ok) {
      setName('');
      setPhone('');
    }
  };

  return (
    <Ctx.Provider value={{ openLead }}>
      {children}
      <dialog ref={ref} aria-labelledby={`${uid}-t`}>
        <div style={{ position: 'relative' }}>
          <button className="x" type="button" aria-label={t.common.close} onClick={() => ref.current?.close()}>
            ×
          </button>
          <form className="dlg-lead" onSubmit={onSubmit} noValidate>
            <h3 id={`${uid}-t`}>{topic}</h3>
            <T k="common.lead.text" as="p" style={{ color: 'var(--muted)' }} />
            <label htmlFor={`${uid}-n`} style={{ font: "600 13px var(--font)" }}>
              {t.form.name}
            </label>
            <input id={`${uid}-n`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor={`${uid}-p`} style={{ font: "600 13px var(--font)" }}>
              {t.form.phone}
            </label>
            <PhoneField id={`${uid}-p`} value={phone} onChange={setPhone} invalid={status === 'phone'} />
            <button className="btn btn-brass" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.form.sending : tx('common.lead.submit')}
            </button>
            <LeadStatus status={status} className="ok" />
          </form>
        </div>
      </dialog>
    </Ctx.Provider>
  );
}

/** Ariza oynasini ochadigan havola/tugma (prototipdagi data-lead). */
export function LeadButton({
  topicKey,
  topic,
  className = 'btn btn-brass',
  children,
  opts,
  style,
}: {
  topicKey?: string;
  topic?: string;
  className?: string;
  children?: ReactNode;
  opts?: LeadOptions;
  style?: React.CSSProperties;
}) {
  const { openLead } = useLead();
  const { tx, editing } = useText();
  const label = topic ?? (topicKey ? tx(topicKey) : undefined);
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={(e) => {
        // Tahrirlash rejimida ichki matn bosilsa muharrir ochiladi, oyna emas
        if (editing && (e.target as HTMLElement).closest('.ch-edit')) return;
        openLead(label, opts);
      }}
    >
      {children ?? (topicKey ? <T k={topicKey} /> : label)}
    </button>
  );
}
