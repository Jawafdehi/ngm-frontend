import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div className="header-content">
          <div className="logo-group">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              NGM
            </Link>
          </div>
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/browse" className={`nav-link ${location.pathname.startsWith('/browse') ? 'active' : ''}`}>
              Archive
            </Link>
            <Link to="/search" className={`nav-link ${location.pathname.startsWith('/search') || location.pathname.startsWith('/case') ? 'active' : ''}`}>
              Court Cases
            </Link>
            <Link to="/dataset" className={`nav-link ${location.pathname === '/dataset' ? 'active' : ''}`}>
              Dataset
            </Link>
            <Link to="/status" className={`nav-link ${location.pathname === '/status' ? 'active' : ''}`}>
              Status
            </Link>
            <a href="https://jawafdehi.org" target="_blank" rel="noopener noreferrer" className="nav-link">
              Jawafdehi
            </a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Jawafdehi.org. Open Data. Open Governance.</p>
      </footer>
    </div>
  );
}
