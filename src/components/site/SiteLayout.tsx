import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useText } from '@/hooks/useContent';
import { useCatalog } from '@/hooks/useCatalog';
import { Logo } from '@/components/Logo';
import { BurgerIcon } from './Icons';
import { LeadButton, LeadProvider } from './Lead';
import { T } from './Content';
import { useSiteMotion } from './useSiteMotion';

export const NAV = [
  { to: '/katalog', key: 'catalog' },
  { to: '/kalkulyator', key: 'calculator' },
  { to: '/nega-biz', key: 'why' },
  { to: '/ishlarimiz', key: 'works' },
  { to: '/muddatli-tolov', key: 'installment' },
  { to: '/shourum', key: 'showroom' },
] as const;

export const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`;

function LangSwitch() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="lang" role="group" aria-label={t.nav.language}>
      {(['uz', 'ru'] as const).map((l) => (
        <button key={l} type="button" className={language === l ? 'on' : ''} aria-pressed={language === l} onClick={() => setLanguage(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Telegram havolasi admin kiritgan bo'lsa — to'g'ridan-to'g'ri, aks holda ariza oynasi. */
export function TelegramLink({ className, children }: { className?: string; children: ReactNode }) {
  const { filled, tx } = useText();
  const url = filled('common.contact.telegramUrl');
  if (url)
    return (
      <a className={className} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  return (
    <LeadButton className={className} topic={tx('common.topic.telegram')}>
      {children}
    </LeadButton>
  );
}

function Header() {
  const { t } = useLanguage();
  const { tx } = useText();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const phone = tx('common.contact.phone');
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="util">
        <div className="wrap">
          <T k="common.contact.address" />
          <div className="r">
            <T k="common.contact.hoursLabel" />
            <span className="keep">
              <a href={telHref(phone)}>{phone}</a>
            </span>
            <LangSwitch />
          </div>
        </div>
      </div>
      <header className="hdr">
        <div className="wrap">
          <Link className="logo" to="/">
            <Logo variant="dark" tagline={tx('common.logo.tagline')} decorative />
            <span className="sr">{t.nav.homeAria}</span>
          </Link>
          <nav className="main" aria-label={t.nav.mainMenu}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}>
                {t.nav[n.key]}
              </NavLink>
            ))}
          </nav>
          <div className="r">
            <a className="tel" href={telHref(phone)}>
              <small>{t.common.callUs}</small>
              <b>{phone}</b>
            </a>
            <LeadButton topicKey="common.header.cta" />
            <button
              className="burger"
              type="button"
              aria-label={t.nav.menu}
              aria-expanded={open}
              aria-controls="mnav"
              onClick={() => setOpen((o) => !o)}
            >
              <BurgerIcon />
            </button>
          </div>
        </div>
        <nav className="mnav" id="mnav" aria-label={t.nav.mobileMenu} data-open={open}>
          <NavLink to="/" end>
            {t.nav.home}
          </NavLink>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}>
              {t.nav[n.key]}
            </NavLink>
          ))}
        </nav>
      </header>
    </>
  );
}

function Footer() {
  const { t } = useLanguage();
  const { tx, show } = useText();
  const { categories } = useCatalog();
  const phone = tx('common.contact.phone');
  const email = tx('common.contact.email');
  return (
    <footer>
      <div className="wrap">
        <div className="g">
          <div>
            <Logo variant="dark" tagline={false} width={198} />
            <T k="common.footer.about" as="p" style={{ marginTop: 16, maxWidth: 300 }} />
          </div>
          <div>
            <T k="common.footer.catalog" as="h2" />
            {categories.map((c) => (
              <Link key={c.slug} to={`/katalog#${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <T k="common.footer.company" as="h2" />
            <Link to="/jamoa">
              <T k="common.footer.team" />
            </Link>
            <Link to="/kalkulyator">{t.nav.calculator}</Link>
            <Link to="/muddatli-tolov">{t.nav.installment}</Link>
            <Link to="/nega-biz">
              <T k="common.footer.warranty" />
            </Link>
            <Link to="/ishlarimiz">{t.nav.works}</Link>
            <Link to="/jamoa#ish">
              <T k="common.footer.jobs" />
            </Link>
          </div>
          <div>
            <T k="common.footer.contact" as="h2" />
            <a href={telHref(phone)}>{phone}</a>
            {show('common.contact.email') && <a href={`mailto:${email}`}>{email}</a>}
            <Link to="/shourum">
              <T k="common.footer.showroom" />
            </Link>
            {show('common.contact.telegram') && (
              <TelegramLink className="flink">
                Telegram: <T k="common.contact.telegram" />
              </TelegramLink>
            )}
          </div>
        </div>
        <div className="bt">
          <T k="common.footer.copyright" />
          <T k="common.footer.privacy" />
        </div>
      </div>
    </footer>
  );
}

function MobileSticky() {
  const { t } = useLanguage();
  const { tx } = useText();
  return (
    <nav className="sticky" aria-label={t.nav.quickContact}>
      <a href={telHref(tx('common.contact.phone'))}>{t.common.call}</a>
      <TelegramLink>{t.common.telegram}</TelegramLink>
      <LeadButton className="main" topicKey="common.lead.defaultTopic">
        <T k="common.sticky.measure" />
      </LeadButton>
    </nav>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  useSiteMotion(root);
  return (
    <div className="ch" ref={root}>
      <LeadProvider>
        <a className="skip" href="#main">
          {t.common.skipToContent}
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileSticky />
      </LeadProvider>
    </div>
  );
}
