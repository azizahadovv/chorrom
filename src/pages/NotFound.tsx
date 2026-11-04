import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';

export default function NotFound() {
  const { t } = useLanguage();
  useSEO({ title: `404 — ${t.notFound.title}`, noindex: true });
  return (
    <section className="pagehead" style={{ paddingBottom: 120 }}>
      <div className="wrap">
        <h1>{t.notFound.title}</h1>
        <p className="lead">{t.notFound.text}</p>
        <div className="ctas" style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <Link className="btn btn-brass" to="/">
            {t.notFound.home}
          </Link>
          <Link className="btn btn-line" to="/katalog">
            {t.nav.catalog}
          </Link>
        </div>
      </div>
    </section>
  );
}
