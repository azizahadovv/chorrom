import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { fetchPriceSettings, PRICE_SETTINGS_KEY } from '@/hooks/usePriceSettings';
import { EMPTY_PRICE_CONFIG, money, type LText, type PriceConfig } from '@/lib/pricing';

type ColType = 'text' | 'number' | 'percent' | 'color' | 'ltext' | 'bool' | 'unit';
interface Col {
  key: string;
  label: string;
  type: ColType;
  hint?: string;
  width?: string;
}

type Row = Record<string, unknown>;

const UNIT_LABELS: Record<string, string> = {
  per_m: 'soʻm × eni (metr)',
  per_sash: 'soʻm × tavaqa',
  fixed: 'soʻm, bir marta',
  pct: 'ulush (0.12 = +12%)',
};

const slug = () => Math.random().toString(36).slice(2, 8);

/** Jadval ko'rinishidagi universal tahrirlovchi (qatorlar qo'shish/o'chirish bilan). */
function RowsEditor({
  rows,
  cols,
  onChange,
  newRow,
  defaultFlag,
}: {
  rows: Row[];
  cols: Col[];
  onChange: (rows: Row[]) => void;
  newRow?: () => Row;
  /** isDefault — faqat bitta qator standart bo'lishi mumkin */
  defaultFlag?: boolean;
}) {
  const set = (i: number, key: string, value: unknown) => {
    const next = rows.map((r, j) => {
      if (defaultFlag && key === 'isDefault' && value === true) return { ...r, isDefault: j === i };
      return j === i ? { ...r, [key]: value } : r;
    });
    onChange(next);
  };
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              {cols.map((c) => (
                <th key={c.key} className="font-medium pb-2 pr-2" style={{ minWidth: c.width }}>
                  {c.label}
                  {c.hint && <div className="text-[11px] font-normal">{c.hint}</div>}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top border-t">
                {cols.map((c) => (
                  <td key={c.key} className="py-2 pr-2">
                    <Cell col={c} value={r[c.key]} row={r} onChange={(v) => set(i, c.key, v)} />
                  </td>
                ))}
                <td className="py-2">
                  {newRow && (
                    <Button variant="ghost" size="icon" aria-label="Oʻchirish" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {newRow && (
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, newRow()])}>
          <Plus className="h-4 w-4 mr-1" /> Qoʻshish
        </Button>
      )}
    </div>
  );
}

function Cell({ col, value, row, onChange }: { col: Col; value: unknown; row: Row; onChange: (v: unknown) => void }) {
  switch (col.type) {
    case 'ltext': {
      const v = (value as LText) ?? { uz: '', ru: '' };
      return (
        <div className="space-y-1">
          <Input value={v.uz} placeholder="UZ" onChange={(e) => onChange({ ...v, uz: e.target.value })} />
          <Input value={v.ru} placeholder="RU" onChange={(e) => onChange({ ...v, ru: e.target.value })} />
        </div>
      );
    }
    case 'number':
      return (
        <div>
          <Input type="number" step="any" value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? 0 : +e.target.value)} />
          {typeof value === 'number' && value >= 10000 && <div className="text-[11px] text-muted-foreground mt-1">{money(value)} soʻm</div>}
        </div>
      );
    case 'percent':
      return (
        <div className="flex items-center gap-1">
          <Input type="number" step="any" value={Math.round(((value as number) ?? 0) * 10000) / 100} onChange={(e) => onChange(+e.target.value / 100)} />
          <span>%</span>
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input type="color" aria-label="Rang" value={(value as string) || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border" />
          <Input value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className="w-24" />
        </div>
      );
    case 'bool':
      return <Switch checked={!!value} onCheckedChange={onChange} aria-label={col.label} />;
    case 'unit':
      return (
        <select className="h-10 rounded-md border px-2 bg-background" value={(value as string) ?? 'fixed'} onChange={(e) => onChange(e.target.value)}>
          {Object.entries(UNIT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      );
    default:
      return <Input value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} disabled={col.key === 'id' && row.__locked === true} />;
  }
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const optionCols: Col[] = [
  { key: 'id', label: 'Kod', type: 'text', width: '90px' },
  { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '220px' },
  { key: 'coef', label: 'Koeffitsiyent', type: 'number', hint: '1 = oʻzgarishsiz, 1.12 = +12%', width: '120px' },
  { key: 'isDefault', label: 'Standart', type: 'bool' },
];

export default function Prices() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: PRICE_SETTINGS_KEY, queryFn: fetchPriceSettings });
  const [cfg, setCfg] = useState<PriceConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) setCfg(data ?? structuredClone(EMPTY_PRICE_CONFIG));
  }, [data, isLoading]);

  if (!cfg) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const patch = (p: Partial<PriceConfig>) => setCfg({ ...cfg, ...p });
  const inst = cfg.installment;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('price_settings' as never).upsert({ id: 1, data: cfg } as never);
    setSaving(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Saqlanmadi',
        description: /price_settings/.test(error.message)
          ? 'price_settings jadvali yoʻq: avval migratsiyani qoʻllang.'
          : error.message,
      });
      return;
    }
    qc.invalidateQueries({ queryKey: PRICE_SETTINGS_KEY });
    qc.invalidateQueries({ queryKey: ['catalog'] });
    toast({ title: 'Narxlar saqlandi', description: 'Kalkulyator, katalog va tezkor karta yangilandi.' });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Narxlar</h1>
          <p className="text-muted-foreground max-w-2xl">
            Kalkulyator, katalog kartalari, bosh sahifadagi tezkor hisob va muddatli toʻlov shu sozlamalardan foydalanadi.
            Narx 0 boʻlsa saytda “Narxni menejer aytadi” yoziladi.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </Button>
      </div>

      <Section title="Umumiy">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-3">
            <div>
              <Label htmlFor="sample">Namuna narxlar</Label>
              <p className="text-xs text-muted-foreground">Yoqilgan boʻlsa saytda “Namuna narxlar…” izohi chiqadi. Haqiqiy narxlarni kiritgach oʻchiring.</p>
            </div>
            <Switch id="sample" checked={cfg.isSample} onCheckedChange={(v) => patch({ isSample: v })} />
          </div>
          <div className="space-y-1">
            <Label>Eng kichik hisob maydoni, m²</Label>
            <Input type="number" step="any" value={cfg.minArea} onChange={(e) => patch({ minArea: +e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Tezkor karta koeffitsiyenti</Label>
            <Input type="number" step="any" value={cfg.quickCoef} onChange={(e) => patch({ quickCoef: +e.target.value })} />
            <p className="text-xs text-muted-foreground">Narx = m² × toʻplam narxi × shu son</p>
          </div>
        </div>
      </Section>

      <Section title="Profil seriyalari va 1 m² narxi" description="Katalogdagi mahsulot shu seriyaga bogʻlangan boʻlsa, kartadagi narx ham shu yerdan olinadi.">
        <div className="space-y-6">
          {cfg.materials.map((m, mi) => (
            <div key={m.id} className="rounded-lg border p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Profil turi (UZ)</Label>
                  <Input value={m.label.uz} onChange={(e) => patch({ materials: cfg.materials.map((x, j) => (j === mi ? { ...x, label: { ...x.label, uz: e.target.value } } : x)) })} />
                </div>
                <div className="space-y-1">
                  <Label>Profil turi (RU)</Label>
                  <Input value={m.label.ru} onChange={(e) => patch({ materials: cfg.materials.map((x, j) => (j === mi ? { ...x, label: { ...x.label, ru: e.target.value } } : x)) })} />
                </div>
                <div className="space-y-1">
                  <Label>Standart seriya</Label>
                  <select
                    className="h-10 w-full rounded-md border px-2 bg-background"
                    value={m.defaultSeries ?? ''}
                    onChange={(e) => patch({ materials: cfg.materials.map((x, j) => (j === mi ? { ...x, defaultSeries: e.target.value } : x)) })}
                  >
                    <option value="">Birinchisi</option>
                    {m.series.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <RowsEditor
                rows={m.series as unknown as Row[]}
                cols={[
                  { key: 'id', label: 'Kod (katalog bogʻlanishi)', type: 'text', width: '140px' },
                  { key: 'name', label: 'Seriya nomi', type: 'text', width: '220px' },
                  { key: 'price', label: '1 m² narxi, soʻm', type: 'number', width: '160px' },
                ]}
                onChange={(rows) => patch({ materials: cfg.materials.map((x, j) => (j === mi ? { ...x, series: rows as never } : x)) })}
                newRow={() => ({ id: `seriya-${slug()}`, name: '', price: 0 })}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Deraza turlari" description="Tavaqa turi koeffitsiyenti va chivin toʻri nechta tavaqaga hisoblanishi.">
        <RowsEditor
          rows={cfg.types as unknown as Row[]}
          cols={[
            { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '220px' },
            { key: 'coef', label: 'Koeffitsiyent', type: 'number', width: '120px' },
            { key: 'meshCount', label: 'Chivin toʻri soni', type: 'number', width: '120px' },
          ]}
          onChange={(rows) => patch({ types: rows as never })}
        />
      </Section>

      <Section title="Shisha paket">
        <RowsEditor rows={cfg.glass as unknown as Row[]} cols={optionCols} defaultFlag onChange={(rows) => patch({ glass: rows as never })} newRow={() => ({ id: `g-${slug()}`, label: { uz: '', ru: '' }, coef: 1 })} />
      </Section>

      <Section title="Furnitura">
        <RowsEditor rows={cfg.furniture as unknown as Row[]} cols={optionCols} defaultFlag onChange={(rows) => patch({ furniture: rows as never })} newRow={() => ({ id: `f-${slug()}`, label: { uz: '', ru: '' }, coef: 1 })} />
      </Section>

      <Section title="Laminatsiya ranglari" description="Kalkulyatordagi ranglar va katalogdagi “Laminatsiya va ranglar” bloki.">
        <RowsEditor
          rows={cfg.lamination as unknown as Row[]}
          cols={[
            { key: 'id', label: 'Kod', type: 'text', width: '100px' },
            { key: 'name', label: 'Nomi (UZ / RU)', type: 'ltext', width: '200px' },
            { key: 'hex', label: 'Rang', type: 'color', width: '170px' },
            { key: 'surcharge', label: 'Ustama', type: 'percent', width: '100px' },
            { key: 'note', label: 'Izoh (UZ / RU)', type: 'ltext', width: '200px' },
          ]}
          onChange={(rows) => patch({ lamination: rows as never })}
          newRow={() => ({ id: `rang-${slug()}`, name: { uz: '', ru: '' }, hex: '#CCCCCC', surcharge: 0, note: { uz: '', ru: '' } })}
        />
      </Section>

      <Section title="Qoʻshimchalar" description="“sill” kodli qoʻshimcha kalkulyator chizmasida tokcha boʻlib chiziladi.">
        <RowsEditor
          rows={cfg.extras as unknown as Row[]}
          cols={[
            { key: 'id', label: 'Kod', type: 'text', width: '90px' },
            { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '220px' },
            { key: 'price', label: 'Narx / ulush', type: 'number', width: '140px' },
            { key: 'unit', label: 'Hisoblash', type: 'unit', width: '170px' },
            { key: 'isDefault', label: 'Belgilangan', type: 'bool' },
          ]}
          onChange={(rows) => patch({ extras: rows as never })}
          newRow={() => ({ id: `x-${slug()}`, label: { uz: '', ru: '' }, price: 0, unit: 'fixed' })}
        />
      </Section>

      <Section title="Bosh sahifadagi tezkor karta: toʻplamlar">
        <RowsEditor
          rows={cfg.packs as unknown as Row[]}
          cols={[
            { key: 'id', label: 'Kod', type: 'text', width: '100px' },
            { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '240px' },
            { key: 'price', label: '1 m² narxi, soʻm', type: 'number', width: '160px' },
            { key: 'isDefault', label: 'Standart', type: 'bool' },
          ]}
          defaultFlag
          onChange={(rows) => patch({ packs: rows as never })}
          newRow={() => ({ id: `p-${slug()}`, label: { uz: '', ru: '' }, price: 0 })}
        />
      </Section>

      <Section title="Muddatli toʻlov" description="Ustama foizi bank shartlariga koʻra kiritiladi. Hisob: (summa − boshlangʻich) × (1 + ustama%) ÷ oylar.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-3">
            <Label>Muddatlar (oy, vergul bilan)</Label>
            <Input
              value={inst.months.join(', ')}
              onChange={(e) => {
                const months = e.target.value
                  .split(',')
                  .map((x) => parseInt(x, 10))
                  .filter((x) => x > 0);
                patch({ installment: { ...inst, months } });
              }}
            />
          </div>
          {inst.months.map((mo) => (
            <div className="space-y-1" key={mo}>
              <Label>{mo} oy uchun ustama, %</Label>
              <Input
                type="number"
                step="any"
                value={inst.markup[String(mo)] ?? 0}
                onChange={(e) => patch({ installment: { ...inst, markup: { ...inst.markup, [String(mo)]: +e.target.value } } })}
              />
            </div>
          ))}
          {(
            [
              ['defaultMonths', 'Standart muddat, oy'],
              ['sumMin', 'Summa: min, soʻm'],
              ['sumMax', 'Summa: max, soʻm'],
              ['sumStep', 'Summa: qadam'],
              ['sumDefault', 'Summa: standart'],
              ['firstMin', 'Boshlangʻich: min, %'],
              ['firstMax', 'Boshlangʻich: max, %'],
              ['firstStep', 'Boshlangʻich: qadam, %'],
              ['firstDefault', 'Boshlangʻich: standart, %'],
            ] as const
          ).map(([k, label]) => (
            <div className="space-y-1" key={k}>
              <Label>{label}</Label>
              <Input type="number" value={inst[k]} onChange={(e) => patch({ installment: { ...inst, [k]: +e.target.value } })} />
            </div>
          ))}
        </div>
      </Section>

      <div className="fixed bottom-4 right-4 z-20">
        <Button size="lg" onClick={save} disabled={saving} className="shadow-lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saqlanmoqda…' : 'Narxlarni saqlash'}
        </Button>
      </div>
    </div>
  );
}
