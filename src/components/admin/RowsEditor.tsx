import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { money, type LText } from '@/lib/pricing';

type ColType = 'text' | 'number' | 'percent' | 'color' | 'ltext' | 'bool' | 'unit';
export interface Col {
  key: string;
  label: string;
  type: ColType;
  hint?: string;
  width?: string;
}

export type Row = Record<string, unknown>;

const UNIT_LABELS: Record<string, string> = {
  per_m: 'soʻm × eni (metr)',
  per_sash: 'soʻm × tavaqa',
  fixed: 'soʻm, bir marta',
  pct: 'ulush (0.12 = +12%)',
};

export const slug = () => Math.random().toString(36).slice(2, 8);

/** Jadval ko'rinishidagi universal tahrirlovchi (qatorlar qo'shish/o'chirish bilan). */
export function RowsEditor({
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
