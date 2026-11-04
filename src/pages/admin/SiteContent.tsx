import { useMemo, useState } from 'react';
import { ExternalLink, ImagePlus, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';
import { IMAGE_DEFAULTS, PAGE_LABELS, TEXT_DEFAULTS, pageOfKey } from '@/content/registry';
import { hasPlaceholder } from '@/content/placeholder';
import type { PageId } from '@/content/types';

const PAGE_URL: Record<PageId, string> = {
  common: '/',
  home: '/',
  katalog: '/katalog',
  kalkulyator: '/kalkulyator',
  'nega-biz': '/nega-biz',
  ishlarimiz: '/ishlarimiz',
  'muddatli-tolov': '/muddatli-tolov',
  shourum: '/shourum',
  jamoa: '/jamoa',
};

// Rasm yuklanadigan kalitlar: standart fotosi borlar va nomi .photo bilan tugaydiganlar (mahsulot rasmi bundan mustasno)
const isPhotoKey = (k: string) => k in IMAGE_DEFAULTS || (k.endsWith('.photo') && !k.startsWith('katalog.'));

function Row({ k }: { k: string }) {
  const { content, refreshContent } = useSiteContent();
  const { toast } = useToast();
  const def = TEXT_DEFAULTS[k];
  const row = content[k];
  const [uz, setUz] = useState<string | null>(null);
  const [ru, setRu] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const curUz = uz ?? row?.value_uz ?? def.uz;
  const curRu = ru ?? row?.value_ru ?? def.ru;
  const dirty = uz !== null || ru !== null;
  const long = def.multiline || def.uz.length > 90;
  const Comp = long ? Textarea : Input;
  const img = content[`${k}:img`]?.value_uz || IMAGE_DEFAULTS[k];

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from('site_content')
      .upsert({ key: k, value_uz: curUz, value_ru: curRu, content_type: 'text', page: pageOfKey(k) }, { onConflict: 'key' });
    setBusy(false);
    if (error) return toast({ variant: 'destructive', title: 'Saqlanmadi', description: error.message });
    await refreshContent();
    setUz(null);
    setRu(null);
    toast({ title: 'Saqlandi' });
  };

  const reset = async () => {
    if (!window.confirm('Standart matnga qaytarilsinmi?')) return;
    const { error } = await supabase.from('site_content').delete().eq('key', k);
    if (error) return toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    await refreshContent();
    setUz(null);
    setRu(null);
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `site-content/${k.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      const { error: e2 } = await supabase
        .from('site_content')
        .upsert({ key: `${k}:img`, value_uz: url, value_ru: url, content_type: 'image', page: pageOfKey(k) }, { onConflict: 'key' });
      if (e2) throw e2;
      await refreshContent();
      toast({ title: 'Rasm saqlandi' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Yuklanmadi', description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-xs text-muted-foreground">{k}</code>
        {row && <Badge variant="secondary">oʻzgartirilgan</Badge>}
        {(hasPlaceholder(curUz) || hasPlaceholder(curRu)) && (
          <Badge className="bg-amber-100 text-amber-900">toʻldirilmagan — saytda koʻrinmaydi</Badge>
        )}
        <div className="ml-auto flex gap-1">
          {row && (
            <Button variant="ghost" size="sm" onClick={reset} aria-label="Standartga qaytarish">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" onClick={save} disabled={!dirty || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {(
          [
            ['UZ', curUz, setUz],
            ['RU', curRu, setRu],
          ] as const
        ).map(([lang, val, set]) => (
          <div key={lang} className="relative">
            <span className="absolute right-2 top-2 text-[10px] font-semibold text-muted-foreground z-10">{lang}</span>
            <Comp
              value={val}
              rows={long ? 4 : undefined}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.value)}
              className={hasPlaceholder(val) ? 'border-amber-400 bg-amber-50' : ''}
            />
          </div>
        ))}
      </div>
      {isPhotoKey(k) && (
        <div className="flex items-center gap-3">
          {img && <img src={img} alt="" className="h-14 w-20 rounded object-cover border" />}
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium border rounded-md px-3 h-9">
            <ImagePlus className="h-4 w-4" /> {img ? 'Rasmni almashtirish' : 'Rasm yuklash'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
      )}
    </div>
  );
}

export default function SiteContent() {
  const keys = useMemo(() => Object.keys(TEXT_DEFAULTS), []);
  const [page, setPage] = useState<PageId>('home');
  const [q, setQ] = useState('');
  const { content } = useSiteContent();

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s)
      return keys.filter(
        (k) =>
          k.toLowerCase().includes(s) ||
          TEXT_DEFAULTS[k].uz.toLowerCase().includes(s) ||
          TEXT_DEFAULTS[k].ru.toLowerCase().includes(s) ||
          (content[k]?.value_uz ?? '').toLowerCase().includes(s),
      );
    return keys.filter((k) => pageOfKey(k) === page);
  }, [keys, page, q, content]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sayt matnlari</h1>
          <p className="text-muted-foreground max-w-3xl">
            Saytdagi har bir matn shu yerda (UZ va RU). Tezroq usul: saytni oching, pastdagi “Tahrirlash” tugmasini yoqing va matn ustiga
            bosing. Takrorlanadigan bloklar “Roʻyxatlar” boʻlimida, narxlar “Narxlar” boʻlimida.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={`${PAGE_URL[page]}?edit=true`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" /> Saytda tahrirlash
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(Object.keys(PAGE_LABELS) as PageId[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={page === p && !q ? 'default' : 'outline'}
            onClick={() => {
              setPage(p);
              setQ('');
            }}
          >
            {PAGE_LABELS[p]}
          </Button>
        ))}
        <div className="relative w-full sm:w-72 sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Matn yoki kalit boʻyicha qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-2">{shown.length} ta matn</p>
          {shown.map((k) => (
            <Row key={k} k={k} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
