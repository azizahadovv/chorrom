import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { fetchPriceSettings, PRICE_SETTINGS_KEY } from '@/hooks/usePriceSettings';
import { CalcKindsEditor } from '@/components/admin/CalcKindsEditor';
import { RowsEditor, slug, type Row } from '@/components/admin/RowsEditor';
import { EMPTY_PRICE_CONFIG, type PriceConfig } from '@/lib/pricing';

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
    if (cfg.kinds.some((k) => !k.label.uz.trim())) {
      toast({ variant: 'destructive', title: 'Saqlanmadi', description: 'Kalkulyatordagi har bir mahsulotga nom bering.' });
      return;
    }
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
            <Label>Tezkor karta: eng kichik maydon, m²</Label>
            <Input type="number" step="any" value={cfg.minArea} onChange={(e) => patch({ minArea: +e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Tezkor karta koeffitsiyenti</Label>
            <Input type="number" step="any" value={cfg.quickCoef} onChange={(e) => patch({ quickCoef: +e.target.value })} />
            <p className="text-xs text-muted-foreground">Narx = m² × toʻplam narxi × shu son</p>
          </div>
        </div>
      </Section>

      <Section
        title="Kalkulyatordagi mahsulotlar"
        description="Saytdagi kalkulyatorda tanlanadigan har bir mahsulot: modellar, narxlar, turlar va qoʻshimchalar. Yangi turdagi mahsulot chiqsa “Yangi mahsulot qoʻshish” tugmasini bosing, nomi va modellarini kiriting, “Saqlash”dan keyin saytda paydo boʻladi."
      >
        <CalcKindsEditor kinds={cfg.kinds} onChange={(kinds) => patch({ kinds })} />
      </Section>

      <Section title="Laminatsiya ranglari" description="Barcha mahsulotlar uchun umumiy: kalkulyatordagi ranglar va katalogdagi “Laminatsiya va ranglar” bloki.">
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
