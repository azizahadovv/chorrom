import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { flushSync } from 'react-dom';
import { Navigate, Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createTransitionHistory } from '@/lib/motion';
import { markHydrated, whenHydrated } from '@/lib/hydration';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider } from '@/hooks/useAuth';
import { EditModeProvider } from '@/hooks/useEditMode';
import { SiteContentProvider } from '@/hooks/useSiteContent';
import { SystemSettingsProvider } from '@/hooks/useSystemSettings';
import { useEditMode } from '@/hooks/useEditMode';
import type { RolePermissions } from '@/lib/permissions';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SiteLayout } from '@/components/site/SiteLayout';
import Index from './pages/Index';

/** Sahifa bilan bitta Suspense ichida: effekti sahifa gidratsiya bo'lib bo'lgach ishlaydi. */
function HydrationGate() {
  useEffect(markHydrated, []);
  return null;
}

// Admin tahrirlash vositalari faqat tahrirlash huquqi bo'lgan foydalanuvchiga yuklanadi
const AdminToolsChunk = lazy(() => import('@/components/AdminTools'));

function AdminTools() {
  const { canEdit } = useEditMode();
  if (!canEdit) return null;
  return (
    <Suspense fallback={null}>
      <AdminToolsChunk />
    </Suspense>
  );
}

// Sahifa chunk'lari: View Transition oldidan oldindan yuklash uchun ham ishlatiladi
const PAGE_LOADERS = {
  '/katalog': () => import('./pages/Katalog'),
  '/kalkulyator': () => import('./pages/Kalkulyator'),
  '/nega-biz': () => import('./pages/NegaBiz'),
  '/ishlarimiz': () => import('./pages/Ishlarimiz'),
  '/muddatli-tolov': () => import('./pages/MuddatliTolov'),
  '/shourum': () => import('./pages/Shourum'),
  '/jamoa': () => import('./pages/Jamoa'),
};
const Katalog = lazy(PAGE_LOADERS['/katalog']);
const Kalkulyator = lazy(PAGE_LOADERS['/kalkulyator']);
const NegaBiz = lazy(PAGE_LOADERS['/nega-biz']);
const Ishlarimiz = lazy(PAGE_LOADERS['/ishlarimiz']);
const MuddatliTolov = lazy(PAGE_LOADERS['/muddatli-tolov']);
const Shourum = lazy(PAGE_LOADERS['/shourum']);
const Jamoa = lazy(PAGE_LOADERS['/jamoa']);
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminAuth = lazy(() => import('./pages/admin/Auth'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Leads = lazy(() => import('./pages/admin/Leads'));
const Prices = lazy(() => import('./pages/admin/Prices'));
const Lists = lazy(() => import('./pages/admin/Lists'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const ProductsNew = lazy(() => import('./pages/admin/ProductsNew'));
const SiteContent = lazy(() => import('./pages/admin/SiteContent'));
const Admins = lazy(() => import('./pages/admin/Admins'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    },
  });

const queryClient = createQueryClient();
whenHydrated(() => queryClient.invalidateQueries());

// Admin qismi (ruxsat tekshiruvi, mavzular, tooltip) alohida chunk'da — mehmon uchun yuklanmaydi
const ProtectedRoute = lazy(() => import('@/components/admin/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute })));

const guard = (module: keyof RolePermissions, el: JSX.Element) => (
  <ProtectedRoute module={module}>{el}</ProtectedRoute>
);

type RouterComponent = (props: { children: ReactNode }) => JSX.Element;

/** Butun ilova daraxti. Brauzerda BrowserRouter, build vaqtidagi server render'da StaticRouter bilan. */
export const AppTree = ({ Router, client }: { Router: RouterComponent; client: QueryClient }) => (
  <QueryClientProvider client={client}>
        <SystemSettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <SiteContentProvider>
                <EditModeProvider>
                    <Router>
                      <ScrollToTop />
                      <Suspense fallback={null}>
                        <Routes>
                          <Route path="/admin/auth" element={<AdminAuth />} />
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={guard('dashboard', <Dashboard />)} />
                            <Route path="leads" element={guard('leads', <Leads />)} />
                            <Route path="prices" element={guard('prices', <Prices />)} />
                            <Route path="lists" element={guard('siteContent', <Lists />)} />
                            <Route path="content" element={guard('siteContent', <SiteContent />)} />
                            <Route path="categories" element={guard('categories', <Categories />)} />
                            <Route path="products" element={guard('products', <ProductsNew />)} />
                            <Route path="admins" element={guard('admins', <Admins />)} />
                            <Route path="settings" element={guard('telegram', <Settings />)} />
                            <Route path="system" element={guard('systemSettings', <SystemSettings />)} />
                          </Route>

                          <Route
                            path="*"
                            element={
                              <>
                              <SiteLayout>
                                <Suspense fallback={<div data-page-loading style={{ minHeight: '60vh' }} />}>
                                  <Routes>
                                    <Route path="/" element={<Index />} />
                                    <Route path="/katalog" element={<Katalog />} />
                                    <Route path="/kalkulyator" element={<Kalkulyator />} />
                                    <Route path="/nega-biz" element={<NegaBiz />} />
                                    <Route path="/ishlarimiz" element={<Ishlarimiz />} />
                                    <Route path="/muddatli-tolov" element={<MuddatliTolov />} />
                                    <Route path="/shourum" element={<Shourum />} />
                                    <Route path="/jamoa" element={<Jamoa />} />
                                    {/* Eski (mebel shablonidagi) manzillar */}
                                    <Route path="/catalog" element={<Navigate to="/katalog" replace />} />
                                    <Route path="/product/:id" element={<Navigate to="/katalog" replace />} />
                                    <Route path="/about" element={<Navigate to="/jamoa" replace />} />
                                    <Route path="/contact" element={<Navigate to="/shourum" replace />} />
                                    <Route path="/faq" element={<Navigate to="/muddatli-tolov" replace />} />
                                    <Route path="/cart" element={<Navigate to="/kalkulyator" replace />} />
                                    <Route path="/checkout" element={<Navigate to="/kalkulyator" replace />} />
                                    <Route path="/thank-you" element={<Navigate to="/" replace />} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                  <HydrationGate />
                                </Suspense>
                              </SiteLayout>
                              {/* Admin tahrirlash vositalari .ch uslublaridan tashqarida */}
                              <AdminTools />
                              </>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </Router>
                </EditModeProvider>
              </SiteContentProvider>
            </AuthProvider>
          </LanguageProvider>
        </SystemSettingsProvider>
  </QueryClientProvider>
);

const history = typeof window !== 'undefined' ? createTransitionHistory(PAGE_LOADERS, flushSync) : null;
const TransitionRouter = ({ children }: { children: ReactNode }) => <HistoryRouter history={history!}>{children}</HistoryRouter>;

const App = () => <AppTree Router={TransitionRouter} client={queryClient} />;

export default App;
