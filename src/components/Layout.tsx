import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV: { to: string; label: string; match: (p: string) => boolean }[] = [
  { to: '/', label: 'Home', match: (p) => p === '/' },
  { to: '/search', label: 'Court Cases', match: (p) => p.startsWith('/search') || p.startsWith('/case') },
  { to: '/browse', label: 'Archive', match: (p) => p.startsWith('/browse') },
  { to: '/dataset', label: 'CIAA Cases', match: (p) => p === '/dataset' },
  { to: '/status', label: 'Status', match: (p) => p === '/status' },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="brand" aria-label="Jawafdehi NGM — home">
            <img
              src="https://jawafdehi.org/assets/logo-dark.svg"
              alt="Jawafdehi"
              className="brand-wordmark"
              height={28}
            />
            <span className="brand-sep" aria-hidden="true" />
            <span className="brand-sub">
              <span className="brand-tag">NGM</span>
              <span className="brand-tagline">Nepal Governance Modernization</span>
            </span>
          </Link>
          <nav className="header-nav">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`nav-link ${n.match(pathname) ? 'active' : ''}`}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="https://jawafdehi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link nav-parent"
            >
              Jawafdehi&nbsp;&#8599;
            </a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-brand">Jawafdehi&nbsp;·&nbsp;NGM</p>
          <p>Nepal&apos;s public governance &amp; judicial record — open data for accountability.</p>
          <p className="footer-meta">
            A project of{' '}
            <a href="https://jawafdehi.org" target="_blank" rel="noopener noreferrer">
              Jawafdehi
            </a>
            . Case data licensed CC&nbsp;BY-NC&nbsp;4.0 · &copy; {new Date().getFullYear()} Jawafdehi Initiative.
          </p>
        </div>
      </footer>
    </div>
  );
}
