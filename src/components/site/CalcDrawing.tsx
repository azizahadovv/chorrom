import type { CalcType, DrawingId } from '@/lib/pricing';

const GLASS_GRAD = 'kalk-glass';
const LINE = { stroke: 'var(--graphite)', strokeOpacity: 0.35 };

const panesOf = (t?: Pick<CalcType, 'id' | 'panes'>) => Math.min(Math.max(t?.panes ?? (Math.round(+(t?.id ?? 1)) || 1), 1), 6);

/** Tur tugmasidagi kichik ikonka (prototipdagi SVG'lar). */
export function TypeIcon({ type }: { type: CalcType }) {
  const stroke = { stroke: 'var(--graphite)', strokeWidth: 2 };
  if (type.id === 'b') {
    return (
      <svg width="64" height="52" viewBox="0 0 64 52" aria-hidden="true">
        <rect x="1" y="1" width="62" height="50" fill="none" {...stroke} />
        <path d="M24 1v50M24 30h39" {...stroke} />
      </svg>
    );
  }
  const n = panesOf(type);
  const w = n === 1 ? 40 : n === 2 ? 60 : 26 * n;
  const d = Array.from({ length: n - 1 }, (_, i) => `M${(w * (i + 1)) / n} 1v50`).join('');
  return (
    <svg width={w} height="52" viewBox={`0 0 ${w} 52`} aria-hidden="true">
      <rect x="1" y="1" width={w - 2} height="50" fill="none" {...stroke} />
      {d && <path d={d} {...stroke} />}
    </svg>
  );
}

interface Box {
  x: number;
  y: number;
  W: number;
  H: number;
}

/** O'lcham chiziqlari: pastda eni, o'ngda ikkinchi o'lcham. */
function Dims({ x, y, W, H, w, h, mm }: Box & { w: number; h: number; mm: string }) {
  return (
    <g style={{ fontFamily: 'var(--font)' }} fontSize="13" fill="var(--muted)">
      <line x1={x} y1={y + H + 34} x2={x + W} y2={y + H + 34} stroke="var(--muted)" />
      <text x={x + W / 2} y={y + H + 54} textAnchor="middle">
        {w} {mm}
      </text>
      <line x1={x + W + 28} y1={y} x2={x + W + 28} y2={y + H} stroke="var(--muted)" />
      <text x={x + W + 38} y={y + H / 2}>
        {h} {mm}
      </text>
    </g>
  );
}

type Pane = [number, number, number, number, number | 'd' | 'w'];

/** Prototipdagi draw() — JSX ko'rinishida. */
function WindowShape({ x, y, W, H, typeId, panes: count, color, sill }: Box & { typeId: string; panes: number; color: string; sill: boolean }) {
  const panes: Pane[] = [];
  let lower: { x: number; y: number; w: number; h: number } | null = null;
  if (typeId === 'b') {
    const dw = W * 0.38;
    panes.push([x, y, dw, H, 'd']);
    panes.push([x + dw, y, W - dw, H * 0.58, 'w']);
    lower = { x: x + dw, y: y + H * 0.58, w: W - dw, h: H * 0.42 };
  } else {
    const pw = W / count;
    for (let i = 0; i < count; i++) panes.push([x + i * pw, y, pw, H, i]);
  }
  const f = 12;
  return (
    <>
      <rect x={x} y={y} width={W} height={H} rx="3" fill={color} {...LINE} />
      {lower && <rect x={lower.x} y={lower.y} width={lower.w} height={lower.h} fill={color} stroke="var(--graphite)" strokeOpacity=".3" />}
      {panes.map(([px, py, pw, ph, k], i) => {
        const handle = i % 2 === 0 || k === 'd';
        const hx = px + pw - f - 6;
        return (
          <g key={i}>
            <rect x={px + f} y={py + f} width={Math.max(pw - 2 * f, 0)} height={Math.max(ph - 2 * f, 0)} fill={`url(#${GLASS_GRAD})`} {...LINE} />
            {handle && (
              <>
                <rect x={hx - 3} y={py + ph / 2 - 14} width="6" height="28" rx="3" fill="var(--brass)" />
                <path
                  d={`M${px + f} ${py + f} L${px + pw - f} ${py + ph / 2} L${px + f} ${py + ph - f}`}
                  fill="none"
                  stroke="var(--graphite)"
                  strokeOpacity=".25"
                  strokeDasharray="4 4"
                />
              </>
            )}
          </g>
        );
      })}
      {sill && <rect x={x - 10} y={y + H} width={W + 20} height="12" fill="var(--frame)" stroke="var(--graphite)" strokeOpacity=".25" />}
    </>
  );
}

function DoorShape({ x, y, W, H, panes, color }: Box & { panes: number; color: string }) {
  const pw = W / panes;
  const f = 10;
  return (
    <>
      <rect x={x} y={y} width={W} height={H} rx="2" fill={color} {...LINE} />
      {Array.from({ length: panes }, (_, i) => {
        const lx = x + i * pw;
        const glassH = (H - 2 * f) * 0.62;
        const hx = i % 2 === 0 ? lx + pw - f - 9 : lx + f + 3;
        return (
          <g key={i}>
            <rect x={lx + f} y={y + f} width={Math.max(pw - 2 * f, 0)} height={H - 2 * f} fill={color} {...LINE} />
            <rect x={lx + f + 8} y={y + f + 8} width={Math.max(pw - 2 * f - 16, 0)} height={glassH} fill={`url(#${GLASS_GRAD})`} {...LINE} />
            <rect x={hx} y={y + H * 0.56} width="6" height="34" rx="3" fill="var(--brass)" />
          </g>
        );
      })}
      <line x1={x - 24} y1={y + H} x2={x + W + 24} y2={y + H} stroke="var(--graphite)" strokeOpacity=".45" strokeWidth="2" />
    </>
  );
}

function SlidingShape({ x, y, W, H, panes, color }: Box & { panes: number; color: string }) {
  const f = 8;
  const lap = 10;
  const pw = (W - 2 * f + lap * (panes - 1)) / panes;
  return (
    <>
      <rect x={x} y={y} width={W} height={H} rx="2" fill={color} {...LINE} />
      {Array.from({ length: panes }, (_, i) => {
        const px = x + f + i * (pw - lap);
        const dir = i % 2 === 0 ? 1 : -1;
        const cx = px + pw / 2;
        const cy = y + H / 2;
        return (
          <g key={i}>
            <rect x={px} y={y + f} width={pw} height={H - 2 * f} fill={color} {...LINE} />
            <rect x={px + 6} y={y + f + 6} width={Math.max(pw - 12, 0)} height={H - 2 * f - 12} fill={`url(#${GLASS_GRAD})`} {...LINE} />
            <path
              d={`M${cx - 18 * dir} ${cy}H${cx + 18 * dir}m${-7 * dir} -6l${7 * dir} 6l${-7 * dir} 6`}
              fill="none"
              stroke="var(--graphite)"
              strokeOpacity=".5"
              strokeWidth="1.5"
            />
            <rect x={dir > 0 ? px + 9 : px + pw - 13} y={cy - 16} width="4" height="32" rx="2" fill="var(--brass)" />
          </g>
        );
      })}
    </>
  );
}

function GateShape({ x, y, W, H, h, color }: Box & { h: number; color: string }) {
  const n = Math.min(Math.max(Math.round(h / 500), 3), 10);
  const ph = H / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y + i * ph} width={W} height={ph} fill={color} {...LINE} />
      ))}
      <rect x={x + W / 2 - 18} y={y + H - ph / 2 - 3} width="36" height="6" rx="3" fill="var(--brass)" />
      <line x1={x - 24} y1={y + H} x2={x + W + 24} y2={y + H} stroke="var(--graphite)" strokeOpacity=".45" strokeWidth="2" />
    </>
  );
}

function ShowerShape({ x, y, W, H }: Box) {
  const f = 5;
  const split = W * 0.46;
  return (
    <>
      <rect x={x} y={y} width={W} height={H} rx="2" fill="var(--graphite)" />
      <rect x={x + f} y={y + f} width={split - f} height={H - 2 * f} fill={`url(#${GLASS_GRAD})`} />
      <rect x={x + split + f} y={y + f} width={W - split - 2 * f} height={H - 2 * f} fill={`url(#${GLASS_GRAD})`} />
      <rect x={x + split + 12} y={y + H / 2 - 22} width="5" height="44" rx="2.5" fill="var(--brass)" />
      <rect x={x - 8} y={y + H} width={W + 16} height="10" fill="var(--frame)" stroke="var(--graphite)" strokeOpacity=".25" />
    </>
  );
}

function MeshShape({ x, y, W, H, color }: Box & { color: string }) {
  const f = 8;
  return (
    <>
      <defs>
        <pattern id="kalk-mesh" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M7 0H0V7" fill="none" stroke="var(--graphite)" strokeOpacity=".28" strokeWidth=".8" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={W} height={H} rx="2" fill={color} {...LINE} />
      <rect x={x + f} y={y + f} width={W - 2 * f} height={H - 2 * f} fill="var(--stage1)" />
      <rect x={x + f} y={y + f} width={W - 2 * f} height={H - 2 * f} fill="url(#kalk-mesh)" {...LINE} />
      <rect x={x + W / 2 - 13} y={y + H - f - 2} width="26" height="5" rx="2.5" fill="var(--brass)" />
    </>
  );
}

function PlainShape({ x, y, W, H, color }: Box & { color: string }) {
  const f = 12;
  return (
    <>
      <rect x={x} y={y} width={W} height={H} rx="3" fill={color} {...LINE} />
      <rect x={x + f} y={y + f} width={Math.max(W - 2 * f, 0)} height={Math.max(H - 2 * f, 0)} fill={`url(#${GLASS_GRAD})`} {...LINE} />
    </>
  );
}

/** Pergola old tomondan: tepada chiqishiga mos tom, ikki ustun. */
function PergolaShape({ x, y, W, depth, postH, color }: Omit<Box, 'H'> & { depth: number; postH: number; color: string }) {
  const inset = W * 0.1;
  const louvres = 8;
  return (
    <>
      <rect x={x + inset} y={y + 2} width="6" height={depth + postH - 22} fill={color} stroke="var(--graphite)" strokeOpacity=".2" />
      <rect x={x + W - inset - 6} y={y + 2} width="6" height={depth + postH - 22} fill={color} stroke="var(--graphite)" strokeOpacity=".2" />
      <polygon points={`${x + inset},${y} ${x + W - inset},${y} ${x + W},${y + depth} ${x},${y + depth}`} fill={`url(#${GLASS_GRAD})`} {...LINE} />
      {Array.from({ length: louvres - 1 }, (_, i) => {
        const t = (i + 1) / louvres;
        return (
          <line
            key={i}
            x1={x + inset + t * (W - 2 * inset)}
            y1={y}
            x2={x + t * W}
            y2={y + depth}
            stroke="var(--graphite)"
            strokeOpacity=".3"
          />
        );
      })}
      <rect x={x} y={y + depth} width={W} height="9" fill={color} {...LINE} />
      <rect x={x} y={y + depth + 9} width="10" height={postH} fill={color} {...LINE} />
      <rect x={x + W - 10} y={y + depth + 9} width="10" height={postH} fill={color} {...LINE} />
      <line x1={x - 24} y1={y + depth + 9 + postH} x2={x + W + 24} y2={y + depth + 9 + postH} stroke="var(--graphite)" strokeOpacity=".45" strokeWidth="2" />
    </>
  );
}

/** Tanlangan mahsulot chizmasi: o'lchamga moslashadi. Har bir shablon admin'da mahsulotga biriktiriladi. */
export function CalcDrawing({
  drawing,
  w,
  h,
  type,
  color,
  sill,
  mm,
  label,
}: {
  drawing: DrawingId;
  w: number;
  h: number;
  type?: CalcType;
  color: string;
  sill: boolean;
  mm: string;
  label: string;
}) {
  const panes = panesOf(type);
  const isPergola = drawing === 'pergola';
  // Eng keng holatda ham o'ngda "12000 mm" yozuviga joy qoladi
  const sc = Math.min(350 / w, 340 / h);
  const W = isPergola ? 350 : w * sc;
  const H = h * sc;
  const x = (520 - W) / 2 - 20;
  const y = 24;
  // Pergolada h — tomning chiqishi: chizmada balandlik emas, tom chuqurligi
  const depth = Math.min(Math.max((h / w) * 120, 36), 120);
  const postH = 340 - depth - 9;
  const box = { x, y, W, H };
  return (
    <svg viewBox="0 0 520 460" width="520" height="460" role="img" aria-label={label}>
      <defs>
        <linearGradient id={GLASS_GRAD} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--glass1)" />
          <stop offset=".55" stopColor="var(--glass2)" />
          <stop offset="1" stopColor="var(--glass3)" />
        </linearGradient>
      </defs>
      {drawing === 'window' && <WindowShape {...box} typeId={type?.id ?? ''} panes={panes} color={color} sill={sill} />}
      {drawing === 'door' && <DoorShape {...box} panes={panes} color={color} />}
      {drawing === 'sliding' && <SlidingShape {...box} panes={panes} color={color} />}
      {drawing === 'gate' && <GateShape {...box} h={h} color={color} />}
      {drawing === 'shower' && <ShowerShape {...box} />}
      {drawing === 'mesh' && <MeshShape {...box} color={color} />}
      {drawing === 'plain' && <PlainShape {...box} color={color} />}
      {isPergola && <PergolaShape x={x} y={y} W={W} depth={depth} postH={postH} color={color} />}
      {isPergola ? <Dims x={x} y={y} W={W} H={340} w={w} h={h} mm={mm} /> : <Dims {...box} w={w} h={h} mm={mm} />}
    </svg>
  );
}
