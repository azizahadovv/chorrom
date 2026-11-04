import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Phone, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { money } from '@/lib/pricing';

interface Lead {
  id: string;
  name: string | null;
  phone: string;
  topic: string;
  page: string | null;
  calc: Record<string, unknown> | null;
  details: Record<string, unknown> | null;
  status: 'new' | 'in_progress' | 'done' | 'spam';
  note: string | null;
  notified_at: string | null;
  created_at: string;
}

const STATUS: Record<Lead['status'], { label: string; cls: string }> = {
  new: { label: 'Yangi', cls: 'bg-amber-100 text-amber-900' },
  in_progress: { label: 'Jarayonda', cls: 'bg-blue-100 text-blue-900' },
  done: { label: 'Yakunlangan', cls: 'bg-green-100 text-green-900' },
  spam: { label: 'Spam', cls: 'bg-gray-200 text-gray-700' },
};

const fmtPhone = (p: string) => p.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2 $3 $4');
const fmtDate = (s: string) =>
  new Date(s).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Hisob JSON'ini o'qiladigan ko'rinishda chiqarish (raqamlar so'mda). */
function CalcView({ value }: { value: unknown }) {
  if (value == null) return null;
  const render = (v: unknown, depth = 0): JSX.Element => {
    if (Array.isArray(v))
      return (
        <ol className="list-decimal pl-5 space-y-1">
          {v.map((x, i) => (
            <li key={i}>{render(x, depth + 1)}</li>
          ))}
        </ol>
      );
    if (v && typeof v === 'object')
      return (
        <dl className={depth ? 'pl-3 border-l' : ''}>
          {Object.entries(v as Record<string, unknown>).map(([k, x]) => (
            <div key={k} className="flex gap-2 text-sm">
              <dt className="text-muted-foreground min-w-[110px]">{k}</dt>
              <dd className="font-medium">{render(x, depth + 1)}</dd>
            </div>
          ))}
        </dl>
      );
    if (typeof v === 'number') return <span>{v >= 10000 ? `${money(v)} soʻm` : v}</span>;
    return <span>{String(v)}</span>;
  };
  return render(value);
}

export default function Leads() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canDelete = hasPermission('leads', 'delete');
  const [status, setStatus] = useState<'all' | Lead['status']>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: leads = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads' as never)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Lead[];
    },
    refetchInterval: 30000,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Lead> }) => {
      const { error } = await supabase.from('leads' as never).update(patch as never).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
      toast({ title: 'Saqlandi' });
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Xatolik', description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads' as never).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Xatolik', description: e.message }),
  });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const digits = s.replace(/\D/g, '');
    return leads.filter(
      (l) =>
        (status === 'all' || l.status === status) &&
        (!s ||
          (l.name ?? '').toLowerCase().includes(s) ||
          l.topic.toLowerCase().includes(s) ||
          (digits.length > 2 && l.phone.includes(digits))),
    );
  }, [leads, status, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Arizalar</h1>
          <p className="text-muted-foreground">
            Saytdagi barcha formalar (bepul oʻlchov, kalkulyator, shourum tashrifi, muddatli toʻlov, ishga ariza) shu yerga tushadi.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Yangilash
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'in_progress', 'done', 'spam'] as const).map((s) => (
          <Button key={s} size="sm" variant={status === s ? 'default' : 'outline'} onClick={() => setStatus(s)}>
            {s === 'all' ? 'Hammasi' : STATUS[s].label} ({counts[s] ?? 0})
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Ism, telefon yoki mavzu" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {isError && (
        <Card>
          <CardContent className="py-6 text-sm">
            Arizalarni yuklab boʻlmadi: server bilan aloqa yoʻq yoki sessiya tugagan. Sahifani yangilang yoki qayta kiring.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : !list.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Arizalar yoʻq</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((l) => {
            const expanded = open === l.id;
            return (
              <Card key={l.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={STATUS[l.status].cls}>{STATUS[l.status].label}</Badge>
                    <span className="text-sm text-muted-foreground">{fmtDate(l.created_at)}</span>
                    <span className="font-semibold">{l.topic}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <Select value={l.status} onValueChange={(v) => update.mutate({ id: l.id, patch: { status: v as Lead['status'] } })}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" aria-label={expanded ? 'Yopish' : 'Batafsil'} onClick={() => setOpen(expanded ? null : l.id)}>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>{l.name || '—'}</span>
                    <a className="inline-flex items-center gap-1 font-medium text-primary underline" href={`tel:${l.phone}`}>
                      <Phone className="h-3.5 w-3.5" />
                      {fmtPhone(l.phone)}
                    </a>
                    {l.page && <span className="text-muted-foreground">{l.page}</span>}
                    {l.details &&
                      Object.entries(l.details).map(([k, v]) => (
                        <span key={k} className="text-muted-foreground">
                          {k}: <b className="text-foreground">{String(v)}</b>
                        </span>
                      ))}
                  </div>
                  {expanded && (
                    <div className="space-y-3 border-t pt-3">
                      {l.calc && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Hisob</p>
                          <CalcView value={l.calc} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold mb-1">Izoh (faqat adminlar koʻradi)</p>
                        <Textarea
                          value={notes[l.id] ?? l.note ?? ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [l.id]: e.target.value }))}
                          rows={2}
                        />
                        <div className="flex justify-between mt-2">
                          <Button size="sm" onClick={() => update.mutate({ id: l.id, patch: { note: notes[l.id] ?? l.note } })}>
                            Izohni saqlash
                          </Button>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => window.confirm('Ariza butunlay oʻchirilsinmi?') && remove.mutate(l.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Oʻchirish
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Telegram: {l.notified_at ? `yuborilgan (${fmtDate(l.notified_at)})` : 'yuborilmagan'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
