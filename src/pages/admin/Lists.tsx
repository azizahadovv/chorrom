import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';
import { LIST_DEFAULTS, PAGE_LABELS, listStorageKey } from '@/content/registry';
import { hasPlaceholder, isItemVisible } from '@/content/placeholder';
import type { FieldDef, ListItem, PageId } from '@/content/types';

async function uploadImage(file: File, prefix: string) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `site-content/${prefix.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

function FieldInput({
  field,
  item,
  onChange,
  listName,
}: {
  field: FieldDef;
  item: ListItem;
  onChange: (key: string, value: string) => void;
  listName: string;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (field.type === 'image') {
    const src = item[field.key] ?? '';
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <div className="flex items-center gap-3">
          {src ? (
            <img src={src} alt="" className="h-16 w-24 rounded object-cover border" />
          ) : (
            <div className="h-16 w-24 rounded border border-dashed grid place-items-center text-xs text-muted-foreground">rasm yoʻq</div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium border rounded-md px-3 h-9">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Yuklash
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  toast({ variant: 'destructive', title: 'Rasm 5 MB dan katta' });
                  return;
                }
                setBusy(true);
                try {
                  onChange(field.key, await uploadImage(file, listName));
                } catch (err) {
                  toast({ variant: 'destructive', title: 'Yuklanmadi', description: (err as Error).message });
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {src && (
            <Button variant="ghost" size="sm" onClick={() => onChange(field.key, '')}>
              Olib tashlash
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-1">
        <Label>{field.label}</Label>
        <select
          className="h-10 w-full rounded-md border px-2 bg-background"
          value={item[field.key] ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const Comp = field.type === 'textarea' ? Textarea : Input;
  const keys = field.localized ? [`${field.key}_uz`, `${field.key}_ru`] : [field.key];
  return (
    <div className="space-y-1">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      <div className={field.localized ? 'grid gap-2 md:grid-cols-2' : ''}>
        {keys.map((k) => (
          <div key={k} className="relative">
            {field.localized && <span className="absolute right-2 top-2 text-[10px] font-semibold text-muted-foreground">{k.endsWith('_uz') ? 'UZ' : 'RU'}</span>}
            <Comp
              value={item[k] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(k, e.target.value)}
              type={field.type === 'color' ? 'color' : undefined}
              rows={field.type === 'textarea' ? 3 : undefined}
              className={hasPlaceholder(item[k]) ? 'border-amber-400 bg-amber-50' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Lists() {
  const [params, setParams] = useSearchParams();
  const { content, refreshContent } = useSiteContent();
  const { toast } = useToast();
  const names = useMemo(() => Object.keys(LIST_DEFAULTS), []);
  const selected = params.get('l') && LIST_DEFAULTS[params.get('l')!] ? params.get('l')! : names[0];
  const def = LIST_DEFAULTS[selected];
  const stored = content[listStorageKey(selected)]?.value_uz;
  const [items, setItems] = useState<ListItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const [focusNew, setFocusNew] = useState(false);

  // Yangi element qo'shilgach — unga o'tib, birinchi maydonga kursor qo'yiladi
  useEffect(() => {
    if (!focusNew) return;
    setFocusNew(false);
    lastItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lastItemRef.current?.querySelector<HTMLElement>('input:not([type=file]),textarea,select')?.focus({ preventScroll: true });
  }, [focusNew, items.length]);

  useEffect(() => {
    let next = def.items;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) next = parsed;
      } catch {
        /* standart qiymat */
      }
    }
    setItems(next.map((x) => ({ ...x })));
    setDirty(false);
  }, [selected, stored, def]);

  const grouped = useMemo(() => {
    const g: Partial<Record<PageId, string[]>> = {};
    for (const n of names) (g[LIST_DEFAULTS[n].page] ??= []).push(n);
    return g;
  }, [names]);

  const edit = (i: number, key: string, value: string) => {
    setItems((list) => list.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
    setDirty(true);
  };
  const move = (i: number, d: number) => {
    setItems((list) => {
      const next = [...list];
      const [x] = next.splice(i, 1);
      next.splice(i + d, 0, x);
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const json = JSON.stringify(items);
    const { error } = await supabase.from('site_content').upsert(
      { key: listStorageKey(selected), value_uz: json, value_ru: json, content_type: 'json', page: def.page, section: selected },
      { onConflict: 'key' },
    );
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Saqlanmadi', description: error.message });
      return;
    }
    await refreshContent();
    setDirty(false);
    toast({ title: 'Saqlandi', description: 'Saytda darhol yangilandi.' });
  };

  const resetToDefault = async () => {
    if (!window.confirm('Roʻyxat kodagi standart holatiga qaytarilsinmi? Kiritilgan oʻzgarishlar oʻchadi.')) return;
    const { error } = await supabase.from('site_content').delete().eq('key', listStorageKey(selected));
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return;
    }
    await refreshContent();
    toast({ title: 'Standart holatga qaytarildi' });
  };

  const choose = (n: string) => {
    if (dirty && !window.confirm('Saqlanmagan oʻzgarishlar bor. Davom etilsinmi?')) return;
    setParams({ l: n });
    // Menyu uzun: pastdagi ro'yxat tanlansa ham tahrirlash qismi boshidan ko'rinadi
    const top = editorRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80 || top > window.innerHeight * 0.5) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roʻyxatlar</h1>
        <p className="text-muted-foreground max-w-3xl">
          Saytdagi takrorlanadigan bloklar: statistika, ishlar, sharhlar, jamoa, jadvallar, savol-javoblar. Qator qoʻshing, oʻchiring,
          tartibini oʻzgartiring. Sariq maydon — <b>[N]</b> kabi toʻldirilmagan joy: bunday element mehmonlarga koʻrsatilmaydi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <CardContent className="p-3 space-y-4">
            {(Object.keys(grouped) as PageId[]).map((page) => (
              <div key={page}>
                <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-1">{PAGE_LABELS[page]}</p>
                {grouped[page]!.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => choose(n)}
                    className={`block w-full text-left text-sm rounded-md px-2 py-1.5 ${n === selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    {LIST_DEFAULTS[n].label.replace(/^[^:]+:\s*/, '')}
                    {content[listStorageKey(n)] && <span className="ml-1 text-[10px] opacity-70">●</span>}
                  </button>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card ref={editorRef} className="scroll-mt-20">
          {/* Sarlavha va Saqlash tugmasi aylantirganda ham ko'rinib turadi */}
          <CardHeader className="sticky top-16 z-10 flex flex-row flex-wrap items-start justify-between gap-3 rounded-t-lg border-b bg-card">
            <div>
              <CardTitle className="text-lg">{def.label}</CardTitle>
              <CardDescription>
                {stored ? 'Admin tahrirlagan' : 'Kodagi standart qiymatlar'} · {items.length} ta element
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {stored && (
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Standart
                </Button>
              )}
              <Button size="sm" onClick={save} disabled={saving || !dirty}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saqlanmoqda…' : 'Saqlash'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((it, i) => {
              const visibleUz = isItemVisible(it, def.fields, 'uz');
              return (
                <div
                  key={i}
                  ref={i === items.length - 1 ? lastItemRef : undefined}
                  className={`rounded-lg border p-4 space-y-3 scroll-mt-40 ${it.hidden === 'true' ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">#{i + 1}</span>
                    {!visibleUz && <Badge className="bg-amber-100 text-amber-900">Saytda koʻrinmaydi</Badge>}
                    <div className="ml-auto flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Yuqoriga" disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Pastga" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={it.hidden === 'true' ? 'Koʻrsatish' : 'Yashirish'}
                        onClick={() => edit(i, 'hidden', it.hidden === 'true' ? '' : 'true')}
                      >
                        {it.hidden === 'true' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Oʻchirish"
                        onClick={() => {
                          setItems((l) => l.filter((_, j) => j !== i));
                          setDirty(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {def.fields.map((f) => (
                      <FieldInput key={f.key} field={f} item={it} listName={selected} onChange={(k, v) => edit(i, k, v)} />
                    ))}
                  </div>
                </div>
              );
            })}
            <Button
              variant="outline"
              onClick={() => {
                setItems((l) => [...l, {}]);
                setDirty(true);
                setFocusNew(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Element qoʻshish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
