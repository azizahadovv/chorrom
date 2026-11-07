import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { db as supabase } from '@/lib/db';
import { RowsEditor, slug, type Col, type Row } from '@/components/admin/RowsEditor';
import { blankKind, type CalcKind, type DimLimit, type DrawingId, type KindUnit, type LText } from '@/lib/pricing';

const DRAWINGS: Record<DrawingId, string> = {
  plain: 'Oddiy rom',
  window: 'Deraza',
  door: 'Eshik',
  sliding: 'Surma',
  gate: 'Darvoza',
  pergola: 'Pergola',
  shower: 'Dush kabinasi',
  mesh: 'Setka',
};

const UNITS: Record<KindUnit, { label: string; price: string }> = {
  m2: { label: '1 m² (eni × boʻyi)', price: '1 m² narxi, soʻm' },
  m: { label: '1 metr (faqat eni)', price: '1 metr narxi, soʻm' },
  piece: { label: '1 dona (oʻlchamsiz)', price: '1 dona narxi, soʻm' },
};

const optionCols: Col[] = [
  { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '220px' },
  { key: 'coef', label: 'Koeffitsiyent', type: 'number', hint: '1 = oʻzgarishsiz, 1.12 = +12%', width: '120px' },
  { key: 'isDefault', label: 'Standart', type: 'bool' },
];

const hasPrice = (k: CalcKind) => k.materials.some((m) => m.series.some((s) => s.price > 0));

const kindTitle = (k: CalcKind) => k.label.uz || 'Nomsiz mahsulot';

function LTextFields({ label, value, onChange, inputRef }: { label: string; value: LText; onChange: (v: LText) => void; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>{label} (UZ)</Label>
        <Input ref={inputRef} value={value.uz} onChange={(e) => onChange({ ...value, uz: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>{label} (RU)</Label>
        <Input value={value.ru} onChange={(e) => onChange({ ...value, ru: e.target.value })} />
      </div>
    </div>
  );
}

function DimFields({ title, value, onChange }: { title: string; value: DimLimit; onChange: (v: DimLimit) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(
        [
          ['min', `${title}: min, mm`],
          ['max', `${title}: max, mm`],
          ['def', `${title}: standart, mm`],
        ] as const
      ).map(([key, label]) => (
        <div className="space-y-1" key={key}>
          <Label className="text-xs">{label}</Label>
          <Input type="number" value={value[key]} onChange={(e) => onChange({ ...value, [key]: +e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t pt-5">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function KindForm({ kind, onChange, nameRef }: { kind: CalcKind; onChange: (k: CalcKind) => void; nameRef: React.Ref<HTMLInputElement> }) {
  const patch = (p: Partial<CalcKind>) => onChange({ ...kind, ...p });
  const { data: categories } = useQuery({
    queryKey: ['price-kind-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('slug, name_uz').order('sort_order');
      return (data ?? []) as unknown as { slug: string; name_uz: string }[];
    },
  });
  const unit = UNITS[kind.unit];

  return (
    <div className="space-y-5">
      <LTextFields label="Mahsulot nomi" value={kind.label} onChange={(label) => patch({ label })} inputRef={nameRef} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="kind-unit">Narx nimaga hisoblanadi</Label>
          <select id="kind-unit" className="h-10 w-full rounded-md border px-2 bg-background" value={kind.unit} onChange={(e) => patch({ unit: e.target.value as KindUnit })}>
            {Object.entries(UNITS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="kind-drawing">Chizma</Label>
          <select id="kind-drawing" className="h-10 w-full rounded-md border px-2 bg-background" value={kind.drawing} onChange={(e) => patch({ drawing: e.target.value as DrawingId })}>
            {Object.entries(DRAWINGS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="kind-cat">Katalog kategoriyasi</Label>
          <select id="kind-cat" className="h-10 w-full rounded-md border px-2 bg-background" value={kind.categorySlug ?? ''} onChange={(e) => patch({ categorySlug: e.target.value || undefined })}>
            <option value="">Bogʻlanmagan</option>
            {categories?.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_uz}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Eng kichik hisob maydoni, m²</Label>
          <Input type="number" step="any" value={kind.minArea} onChange={(e) => patch({ minArea: +e.target.value })} />
        </div>
      </div>

      {kind.unit !== 'piece' && (
        <div className="space-y-3">
          <LTextFields label="Birinchi oʻlcham nomi" value={kind.widthLabel} onChange={(widthLabel) => patch({ widthLabel })} />
          <DimFields title="Eni" value={kind.width} onChange={(width) => patch({ width })} />
          {kind.unit === 'm2' && (
            <>
              <LTextFields label="Ikkinchi oʻlcham nomi" value={kind.heightLabel} onChange={(heightLabel) => patch({ heightLabel })} />
              <DimFields title="Boʻyi" value={kind.height} onChange={(height) => patch({ height })} />
            </>
          )}
        </div>
      )}

      <Block title="Modellar va narxlar" hint="Narxi 0 boʻlsa saytda “Narxni menejer aytadi” yoziladi. Kod katalogdagi mahsulot kodi (slug) bilan bir xil boʻlsa, karta narxi va “Narxini hisoblash” shu modelga bogʻlanadi.">
        <LTextFields label="Model tanlash sarlavhasi" value={kind.seriesTitle} onChange={(seriesTitle) => patch({ seriesTitle })} />
        {kind.materials.length > 1 && <LTextFields label="Guruh tanlash sarlavhasi" value={kind.materialTitle} onChange={(materialTitle) => patch({ materialTitle })} />}
        {kind.materials.map((m, mi) => {
          const setM = (p: Partial<typeof m>) => patch({ materials: kind.materials.map((x, j) => (j === mi ? { ...x, ...p } : x)) });
          return (
            <div key={m.id} className="rounded-lg border p-4 space-y-3">
              {kind.materials.length > 1 && <LTextFields label="Guruh nomi" value={m.label} onChange={(label) => setM({ label })} />}
              {m.series.length > 1 && (
                <div className="space-y-1 max-w-sm">
                  <Label>Standart model</Label>
                  <select className="h-10 w-full rounded-md border px-2 bg-background" value={m.defaultSeries ?? ''} onChange={(e) => setM({ defaultSeries: e.target.value })}>
                    <option value="">Birinchisi</option>
                    {m.series.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <RowsEditor
                rows={m.series as unknown as Row[]}
                cols={[
                  { key: 'id', label: 'Kod (katalog bogʻlanishi)', type: 'text', width: '170px' },
                  { key: 'name', label: 'Nomi (UZ)', type: 'text', width: '200px' },
                  { key: 'nameRu', label: 'Nomi (RU)', type: 'text', width: '200px' },
                  { key: 'price', label: unit.price, type: 'number', width: '160px' },
                ]}
                onChange={(rows) => setM({ series: rows as never })}
                newRow={() => ({ id: `model-${slug()}`, name: '', nameRu: '', price: 0 })}
              />
              {kind.materials.length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => patch({ materials: kind.materials.filter((_, j) => j !== mi) })}>
                  <Trash2 className="h-4 w-4 mr-1" /> Guruhni oʻchirish
                </Button>
              )}
            </div>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => patch({ materials: [...kind.materials, { id: `${kind.id}-${slug()}`, label: { uz: '', ru: '' }, series: [] }] })}
        >
          <Plus className="h-4 w-4 mr-1" /> Model guruhi qoʻshish (masalan, PVX / Alyumin)
        </Button>
      </Block>

      <Block title="Turlari" hint="Masalan, tavaqalar soni. Ikkitadan kam boʻlsa saytda bu ustun koʻrinmaydi.">
        <LTextFields label="Sarlavha" value={kind.typesTitle} onChange={(typesTitle) => patch({ typesTitle })} />
        <RowsEditor
          rows={kind.types as unknown as Row[]}
          cols={[
            { key: 'label', label: 'Nomi (UZ / RU)', type: 'ltext', width: '220px' },
            { key: 'coef', label: 'Koeffitsiyent', type: 'number', width: '120px' },
            { key: 'panes', label: 'Chizmada tavaqa', type: 'number', width: '110px' },
            { key: 'meshCount', label: '“Tavaqa uchun” soni', type: 'number', hint: 'Qoʻshimchalar hisobi uchun', width: '130px' },
          ]}
          onChange={(rows) => patch({ types: rows as never })}
          newRow={() => ({ id: `t-${slug()}`, label: { uz: '', ru: '' }, coef: 1, meshCount: 1, panes: 1 })}
        />
      </Block>

      <Block title="Tanlash guruhlari" hint="Masalan, shisha paket yoki furnitura. Har bir variant narxni koeffitsiyentga koʻpaytiradi.">
        {kind.groups.map((g, gi) => {
          const setG = (p: Partial<typeof g>) => patch({ groups: kind.groups.map((x, j) => (j === gi ? { ...x, ...p } : x)) });
          return (
            <div key={g.id} className="rounded-lg border p-4 space-y-3">
              <LTextFields label="Guruh nomi" value={g.label} onChange={(label) => setG({ label })} />
              <RowsEditor
                rows={g.options as unknown as Row[]}
                cols={optionCols}
                defaultFlag
                onChange={(rows) => setG({ options: rows as never })}
                newRow={() => ({ id: `o-${slug()}`, label: { uz: '', ru: '' }, coef: 1 })}
              />
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => patch({ groups: kind.groups.filter((_, j) => j !== gi) })}>
                <Trash2 className="h-4 w-4 mr-1" /> Guruhni oʻchirish
              </Button>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={() => patch({ groups: [...kind.groups, { id: `g-${slug()}`, label: { uz: '', ru: '' }, options: [] }] })}>
          <Plus className="h-4 w-4 mr-1" /> Guruh qoʻshish
        </Button>
      </Block>

      <Block title="Rang va qoʻshimchalar" hint={kind.drawing === 'window' ? '“sill” kodli qoʻshimcha chizmada tokcha boʻlib chiziladi.' : undefined}>
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3 max-w-md">
          <Label htmlFor="kind-lam">Laminatsiya ranglari koʻrsatilsin</Label>
          <Switch id="kind-lam" checked={kind.useLamination} onCheckedChange={(useLamination) => patch({ useLamination })} />
        </div>
        <RowsEditor
          rows={kind.extras as unknown as Row[]}
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
      </Block>
    </div>
  );
}

/** Kalkulyatordagi mahsulotlar: ro'yxat, tartib, yashirish, o'chirish va yangisini qo'shish. */
export function CalcKindsEditor({ kinds, onChange }: { kinds: CalcKind[]; onChange: (kinds: CalcKind[]) => void }) {
  const [selectedId, setSelectedId] = useState('');
  const [focusNew, setFocusNew] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const index = Math.max(
    kinds.findIndex((k) => k.id === selectedId),
    0,
  );
  const kind = kinds[index];

  useEffect(() => {
    if (!focusNew) return;
    setFocusNew(false);
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusNew]);

  const add = () => {
    const k = blankKind(`k-${slug()}`);
    onChange([...kinds, k]);
    setSelectedId(k.id);
    setFocusNew(true);
  };
  const move = (d: number) => {
    const next = [...kinds];
    const [x] = next.splice(index, 1);
    next.splice(index + d, 0, x);
    onChange(next);
  };
  const remove = () => {
    if (!window.confirm(`“${kindTitle(kind)}” kalkulyatordan oʻchirilsinmi? Uning narxlari ham oʻchadi (“Saqlash” bosilgach).`)) return;
    onChange(kinds.filter((_, j) => j !== index));
    setSelectedId('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Button key={k.id} variant={k.id === kind?.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedId(k.id)}>
            {kindTitle(k)}
            {!hasPrice(k) && <Badge className="ml-2 bg-amber-100 text-amber-900 hover:bg-amber-100">narx yoʻq</Badge>}
            {k.hidden && <Badge variant="secondary" className="ml-2">yashirin</Badge>}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Yangi mahsulot qoʻshish
        </Button>
      </div>

      {kind && (
        <div className="rounded-lg border p-4 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="kind-visible" checked={!kind.hidden} onCheckedChange={(v) => onChange(kinds.map((k, j) => (j === index ? { ...k, hidden: !v } : k)))} />
              <Label htmlFor="kind-visible">Saytda koʻrsatilsin</Label>
            </div>
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Chapga surish" disabled={index === 0} onClick={() => move(-1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Oʻngga surish" disabled={index === kinds.length - 1} onClick={() => move(1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
                <Trash2 className="h-4 w-4 mr-1" /> Mahsulotni oʻchirish
              </Button>
            </div>
          </div>
          <KindForm key={kind.id} kind={kind} nameRef={nameRef} onChange={(k) => onChange(kinds.map((x, j) => (j === index ? k : x)))} />
        </div>
      )}
    </div>
  );
}
