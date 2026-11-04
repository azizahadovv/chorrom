import { postLead } from '@/lib/rest';

/** Raqamlardan +998 XX XXX XX XX ko'rinishini yasaydi (yozish paytida). */
export function formatPhone(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return '+998' + (parts.length ? ' ' + parts.join(' ') : ' ');
}

/** +998XXXXXXXXX yoki null (noto'g'ri raqam). */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.length === 9) d = '998' + d;
  return /^998\d{9}$/.test(d) ? '+' + d : null;
}

export interface LeadInput {
  name?: string;
  phone: string;
  topic: string;
  /** Qaysi sahifadan yuborildi (pathname) */
  page?: string;
  /** Kalkulyator hisobi yoki boshqa tafsilotlar */
  calc?: unknown;
  details?: Record<string, unknown>;
}

export interface LeadResult {
  ok: boolean;
  reason?: 'phone' | 'error';
}

/** Arizani backend'ga yuboradi (u bazaga yozadi va Telegram xabarnomasini jo'natadi). */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, reason: 'phone' };
  try {
    // Telegram xabarnomasini backend o'zi yuboradi
    await postLead({
      name: input.name?.trim().slice(0, 120) || null,
      phone,
      topic: input.topic.slice(0, 200),
      page: (input.page ?? window.location.pathname + window.location.hash).slice(0, 300),
      calc: input.calc ?? null,
      details: input.details ?? null,
    });
  } catch (error) {
    console.error('Lead submit failed', error);
    return { ok: false, reason: 'error' };
  }
  return { ok: true };
}
