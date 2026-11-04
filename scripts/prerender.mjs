// Build'dan keyin: har bir sahifani React (dist-ssr/entry-server.js) bilan oldindan chizadi va
// dist/<sahifa>/index.html ga yozadi. Brauzer HTML'ni JS kutmasdan ko'rsatadi, keyin React hydrate qiladi.
// Xato bo'lsa build buzilmaydi: oddiy SPA (dist/index.html) qoladi.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// React'ning production server build'i ishlatilsin
process.env.NODE_ENV = 'production';

const DIST = resolve('dist');
const SSR_ENTRY = resolve('dist-ssr/entry-server.js');

// Ma'lumot CHORROM backend'idan (Java). Build serverda bo'lsa: PRERENDER_API_URL=http://127.0.0.1:<port>
const API = (process.env.PRERENDER_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

async function api(path) {
  try {
    const res = await fetch(API + path, { signal: AbortSignal.timeout(15000) });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

async function loadData() {
  const [content, prices, catalog] = await Promise.all([
    api('/api/public/content'),
    api('/api/public/prices'),
    api('/api/public/catalog'),
  ]);
  if (!content) console.warn(`[prerender] ${API} javob bermadi — standart kontent bilan chiziladi`);
  return {
    content: content ?? [],
    prices: prices?.data ?? null,
    catalog: catalog ?? null,
  };
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// JSON'ni <script> ichiga xavfsiz joylash
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const safeJson = (v) =>
  JSON.stringify(v)
    .split('<').join('\u003c')
    .split(LS).join('\u2028')
    .split(PS).join('\u2029');

// Vite manifest: marshrut sahifasi komponenti → uning chunk'i va statik importlari
const PAGE_FILES = {
  '/katalog': 'src/pages/Katalog.tsx',
  '/kalkulyator': 'src/pages/Kalkulyator.tsx',
  '/nega-biz': 'src/pages/NegaBiz.tsx',
  '/ishlarimiz': 'src/pages/Ishlarimiz.tsx',
  '/muddatli-tolov': 'src/pages/MuddatliTolov.tsx',
  '/shourum': 'src/pages/Shourum.tsx',
  '/jamoa': 'src/pages/Jamoa.tsx',
};
let manifest = null;
function routeChunks(route) {
  const file = PAGE_FILES[route];
  if (!file) return [];
  if (!manifest) {
    const p = resolve(DIST, '.vite/manifest.json');
    manifest = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  }
  const out = new Set();
  const walk = (key) => {
    const entry = manifest[key];
    if (!entry || entry.isEntry || out.has('/' + entry.file)) return;
    out.add('/' + entry.file);
    (entry.imports ?? []).forEach(walk);
  };
  walk(file);
  return [...out];
}

async function main() {
  if (!existsSync(SSR_ENTRY)) {
    console.warn('[prerender] dist-ssr topilmadi — o\'tkazib yuborildi');
    return;
  }
  const { render, headFor, ROUTES } = await import(pathToFileURL(SSR_ENTRY).href);
  // Toza shablon (Vite chiqargan index.html) bir marta saqlanadi: skript qayta ishga tushsa ham buzilmaydi
  const TEMPLATE = resolve('dist-ssr/template.html');
  if (!existsSync(TEMPLATE)) writeFileSync(TEMPLATE, readFileSync(resolve(DIST, 'index.html'), 'utf8'));
  let template = readFileSync(TEMPLATE, 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error('index.html shabloni toza emas — avval vite build');

  // CSS HTML ichiga joylanadi (alohida so'rov chizishni to'xtatmaydi). Web-shriftlar (@font-face url) esa
  // alohida faylga chiqariladi: matn avval o'lchami moslangan zaxira shriftda chiziladi, shriftlar keyin keladi.
  let fontsHref = '';
  template = template.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g, (_m, href) => {
    let css = readFileSync(resolve(DIST, '.' + href), 'utf8');
    const webFaces = (css.match(/@font-face\{[^}]*\}/g) ?? []).filter((f) => f.includes('url('));
    if (webFaces.length) {
      for (const f of webFaces) css = css.replace(f, '');
      const body = webFaces.join('');
      fontsHref = `/assets/fonts-${createHash('md5').update(body).digest('hex').slice(0, 8)}.css`;
      writeFileSync(resolve(DIST, '.' + fontsHref), body);
    }
    return `<style>${css}</style>`;
  });

  // React ilovasi (hydrate) va shriftlar sahifa to'liq chizilgandan keyin yuklanadi.
  // __ROUTE_CHUNKS__ — shu sahifaning lazy chunk'lari (parallel modulepreload), har sahifa uchun alohida qo'yiladi.
  template = template.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, (_m, src) => {
    const loader = [
      '(function(){function go(){',
      fontsHref ? `var l=document.createElement('link');l.rel='stylesheet';l.href='${fontsHref}';document.head.appendChild(l);` : '',
      "__ROUTE_CHUNKS__.forEach(function(h){var p=document.createElement('link');p.rel='modulepreload';p.crossOrigin='';p.href=h;document.head.appendChild(p);});",
      `var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${src}';document.head.appendChild(s);}`,
      // birinchi chizish (FCP) bo'lgach yuklaymiz; eski brauzerlar uchun load + taymer
      'var done=0;function once(){if(!done){done=1;setTimeout(go,0);}}',
      "try{new PerformanceObserver(function(l){if(l.getEntriesByName('first-contentful-paint').length)once();}).observe({type:'paint',buffered:true});}catch(e){}",
      "addEventListener('load',function(){setTimeout(once,1500);});})();",
    ].join('');
    return `<script>${loader}</script>`;
  });

  const base = await loadData();
  let ok = 0;
  for (const route of Object.keys(ROUTES)) {
    const data = { ...base, route };
    const appHtml = await render(route, data);
    const { title, description } = headFor(route, data);
    const canonical = `https://chorrom.uz${route === '/' ? '' : route}`;
    let page = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${escapeAttr(description)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(title)}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${escapeAttr(description)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div><script>window.__CH_DATA__=${safeJson(data)}</script>`);
    page = page.replace('__ROUTE_CHUNKS__', JSON.stringify(routeChunks(route)));
    const out = route === '/' ? resolve(DIST, 'index.html') : resolve(DIST, route.slice(1), 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    // /katalog (oxirida "/" siz) so'rovi uchun: hostinglar katalog.html ni beradi
    if (route !== '/') writeFileSync(resolve(DIST, route.slice(1) + '.html'), page);
    ok++;
  }
  console.log(`[prerender] ${ok} ta sahifa oldindan chizildi`);
}

// Supabase auth taymerlari jarayonni ushlab turmasin
main()
  .catch((err) => {
    console.error('[prerender] xato, SPA rejimida qoladi:', err);
  })
  .finally(() => process.exit(0));
