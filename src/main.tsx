import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
// unicode-range bilan: brauzer faqat sahifadagi belgilar uchun kerakli to'plamni yuklaydi (UZ → lotin, RU → kirill)
import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import '@fontsource/onest/700.css';
import App from './App.tsx';
// Tailwind (index.css) faqat admin qismida yuklanadi: AdminLayout, Auth, tahrirlash vositalari
import './styles/chorrom.css';
import { getInitialData } from './lib/initialData';
import { markHydrated } from './lib/hydration';

const container = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Build vaqtida React bilan oldindan chizilgan sahifa (scripts/prerender.mjs) shu manzil uchun bo'lsa — hydrate,
// aks holda (admin, 404, SPA fallback) oddiy render.
const data = getInitialData();
if (container.hasChildNodes() && data?.route === window.location.pathname) {
  hydrateRoot(container, app);
  // Odatda App ichidagi HydrationGate belgilaydi; bu — chunk yuklanmay qolgan holat uchun
  setTimeout(markHydrated, 5000);
} else {
  markHydrated();
  container.innerHTML = '';
  createRoot(container).render(app);
}
