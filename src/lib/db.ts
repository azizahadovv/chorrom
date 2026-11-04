/* eslint-disable @typescript-eslint/no-explicit-any -- jadval qatorlari dinamik (supabase-js bilan mos interfeys) */
// Admin panel uchun jadval mijozi: supabase-js'dagi from().select().eq()... uslubi saqlangan,
// so'rovlar esa backend'ning /api/db/<jadval>/<amal> endpoint'iga (ruxsatlar serverda) boradi.
import { apiFetch, ApiError, uploadImage } from './api';

type Op = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'ilike' | 'is';
interface Filter {
  column: string;
  op: Op;
  value: unknown;
}

export interface DbError {
  message: string;
  code?: string;
  status?: number;
}

export interface DbResult<T = any> {
  data: T;
  error: DbError | null;
  count: number | null;
}

type Action = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

class Query<T = any> implements PromiseLike<DbResult<T>> {
  private action: Action = 'select';
  private columns = '*';
  private filters: Filter[] = [];
  private orFilters: Filter[] = [];
  private orders: { column: string; ascending: boolean }[] = [];
  private rangeVal: [number, number] | null = null;
  private limitVal: number | null = null;
  private countMode: 'exact' | null = null;
  private head = false;
  private payload: unknown = null;
  private onConflict: string | null = null;
  private mode: 'many' | 'single' | 'maybe' = 'many';

  constructor(private table: string) {}

  select(columns = '*', opts?: { count?: 'exact'; head?: boolean }) {
    // insert/update'dan keyingi .select() — natijani qaytarish (backend doim qaytaradi)
    if (this.action === 'select') this.columns = columns;
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(rows: unknown) {
    this.action = 'insert';
    this.payload = rows;
    return this;
  }
  upsert(rows: unknown, opts?: { onConflict?: string }) {
    this.action = 'upsert';
    this.payload = rows;
    this.onConflict = opts?.onConflict ?? 'id';
    return this;
  }
  update(values: unknown) {
    this.action = 'update';
    this.payload = values;
    return this;
  }
  delete() {
    this.action = 'delete';
    return this;
  }

  private add(column: string, op: Op, value: unknown) {
    this.filters.push({ column, op, value });
    return this;
  }
  eq(c: string, v: unknown) {
    return this.add(c, 'eq', v);
  }
  neq(c: string, v: unknown) {
    return this.add(c, 'neq', v);
  }
  gt(c: string, v: unknown) {
    return this.add(c, 'gt', v);
  }
  gte(c: string, v: unknown) {
    return this.add(c, 'gte', v);
  }
  lt(c: string, v: unknown) {
    return this.add(c, 'lt', v);
  }
  lte(c: string, v: unknown) {
    return this.add(c, 'lte', v);
  }
  in(c: string, v: unknown[]) {
    return this.add(c, 'in', v);
  }
  ilike(c: string, pattern: string) {
    return this.add(c, 'ilike', pattern);
  }
  is(c: string, v: null | boolean) {
    return this.add(c, 'is', v);
  }
  /** PostgREST ko'rinishi: "name_uz.ilike.%x%,slug.ilike.%x%" */
  or(expr: string) {
    for (const part of expr.split(',')) {
      const [column, op, ...rest] = part.split('.');
      this.orFilters.push({ column, op: op as Op, value: rest.join('.') });
    }
    return this;
  }
  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }
  range(from: number, to: number) {
    this.rangeVal = [from, to];
    return this;
  }
  limit(n: number) {
    this.limitVal = n;
    return this;
  }
  single() {
    this.mode = 'single';
    return this;
  }
  maybeSingle() {
    this.mode = 'maybe';
    return this;
  }

  private async run(): Promise<DbResult<T>> {
    const body: Record<string, unknown> = { filters: this.filters, or: this.orFilters };
    if (this.action === 'select') {
      Object.assign(body, {
        select: this.columns,
        order: this.orders,
        range: this.rangeVal,
        limit: this.mode === 'many' ? this.limitVal : 2,
        count: this.countMode,
        head: this.head,
      });
    } else if (this.action === 'insert' || this.action === 'upsert') {
      body.rows = this.payload;
      if (this.onConflict) body.onConflict = this.onConflict;
    } else if (this.action === 'update') {
      body.values = this.payload;
    }
    try {
      const res = await apiFetch<{ data: any; count?: number }>(`/api/db/${this.table}/${this.action}`, {
        method: 'POST',
        json: body,
      });
      let data = res.data;
      if (this.mode !== 'many') {
        const rows = (data as unknown[]) ?? [];
        if (!rows.length && this.mode === 'single') {
          return { data: null as T, error: { message: 'Topilmadi', code: 'PGRST116' }, count: null };
        }
        data = rows[0] ?? null;
      }
      return { data, error: null, count: res.count ?? null };
    } catch (e) {
      const err = e as ApiError;
      return { data: null as T, error: { message: err.message, status: err.status }, count: null };
    }
  }

  then<R1 = DbResult<T>, R2 = never>(
    onfulfilled?: ((value: DbResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

// storage.upload(path) → getPublicUrl(path): yuklangan faylning haqiqiy URL'i shu yerda eslab qolinadi
const uploaded = new Map<string, string>();

export const db = {
  from: <T = any>(table: string) => new Query<T>(table),

  storage: {
    from: (_bucket: string) => ({
      async upload(path: string, file: File, _opts?: unknown) {
        try {
          const folder = path.split('/')[0] || 'site';
          const url = await uploadImage(file, folder);
          uploaded.set(path, url);
          return { data: { path }, error: null };
        } catch (e) {
          return { data: null, error: { message: (e as Error).message } };
        }
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: uploaded.get(path) ?? path } };
      },
      /** Fayllar serverda qoladi (boshqa joyda ishlatilgan bo'lishi mumkin) */
      async remove(_paths: string[]) {
        return { data: null, error: null };
      },
    }),
  },
};
