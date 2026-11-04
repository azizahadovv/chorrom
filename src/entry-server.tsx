// Build vaqtida sahifalarni React bilan oldindan chizish (scripts/prerender.mjs chaqiradi).
// Natija: har bir marshrut uchun tayyor HTML, brauzerda esa xuddi shu daraxt hydrate qilinadi.
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Writable } from 'node:stream';
import { AppTree, createQueryClient } from './App';
import { setInitialData, type InitialData } from './lib/initialData';
import { TEXT_DEFAULTS } from './content/registry';

/** Marshrut → kontent kaliti prefiksi (sahifa <title> va description uchun). */
export const ROUTES: Record<string, string> = {
  '/': 'home',
  '/katalog': 'katalog',
  '/kalkulyator': 'kalk',
  '/nega-biz': 'why',
  '/ishlarimiz': 'works',
  '/muddatli-tolov': 'inst',
  '/shourum': 'show',
  '/jamoa': 'team',
};

export function headFor(route: string, data: InitialData) {
  const prefix = ROUTES[route];
  const text = (k: string) => data.content.find((r) => r.key === k)?.value_uz || TEXT_DEFAULTS[k]?.uz || '';
  return { title: text(`${prefix}.seo.title`), description: text(`${prefix}.seo.description`) };
}

export function render(route: string, data: InitialData): Promise<string> {
  setInitialData(data);
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString();
        cb();
      },
      final(cb) {
        resolve(html);
        cb();
      },
    });
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <AppTree Router={({ children }) => <StaticRouter location={route}>{children}</StaticRouter>} client={createQueryClient()} />
      </StrictMode>,
      {
        // lazy sahifalar ham to'liq chizilishini kutamiz
        onAllReady() {
          pipe(sink);
        },
        onShellError: reject,
        onError(err) {
          console.error('[prerender]', route, err);
        },
      },
    );
  });
}
