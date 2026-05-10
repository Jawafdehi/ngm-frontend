import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="fade-in">
      <section className="hero">
        <h2>Judicial Data Archive</h2>
        <p>
          Explore structured governance and judicial records from Nepal's
          institutional public endpoints, systematically tracked by the NGM
          Scrapers.
        </p>
      </section>

      <section className="landing-cards">
        <div className="landing-card">
          <div className="landing-card-icon">&#x1F4CB;</div>
          <h3>Court Case Search</h3>
          <p>
            Search across all courts of Nepal — Supreme, High Courts, and
            District Courts — by case number for detailed case histories,
            hearings, and party information.
          </p>
          <Link to="/search" className="landing-card-link">
            Search Cases &rarr;
          </Link>
        </div>

        <div className="landing-card">
          <div className="landing-card-icon">&#x1F4DA;</div>
          <h3>Document Archive</h3>
          <p>
            Browse Kanun Patrika, CIAA Annual Reports, CIAA Press Releases,
            and Court Orders spanning decades of Nepal's judicial record.
          </p>
          <Link to="/browse" className="landing-card-link">
            Browse Archive &rarr;
          </Link>
        </div>

        <div className="landing-card">
          <div className="landing-card-icon">&#x1F4CA;</div>
          <h3>Dataset Viewer</h3>
          <p>
            Explore the structured CIAA corruption cases dataset with
            fiscal-year breakdowns, press releases, charge sheets, and
            appeal tracking.
          </p>
          <Link to="/dataset" className="landing-card-link">
            View Dataset &rarr;
          </Link>
        </div>

        <div className="landing-card">
          <div className="landing-card-icon">&#x1F4E1;</div>
          <h3>Scraper Status</h3>
          <p>
            Monitor per-court coverage, last scrape timestamps, and data gap
            indicators. Transparency into our data pipeline health.
          </p>
          <Link to="/status" className="landing-card-link">
            Check Status &rarr;
          </Link>
        </div>
      </section>

      <section className="landing-about">
        <h3>About NGM</h3>
        <p>
          <strong>Nepal Governance Modernization (NGM)</strong> is an open-data
          initiative that systematically scrapes, archives, and indexes judicial
          and governance records from Nepal's institutional public endpoints.
          Our scrapers run continuously against the Supreme Court, Special Court,
          all seven High Courts, and all 77 District Courts.
        </p>
        <p>
          The goal is to make Nepal's judicial data discoverable, searchable,
          and citable — empowering citizens, journalists, researchers, and
          accountability advocates with structured access to information that is
          legally public but practically inaccessible.
        </p>
        <p>
          NGM is a project of{' '}
          <a href="https://jawafdehi.org" target="_blank" rel="noopener noreferrer">
            Jawafdehi.org
          </a>
          , a non-profit open-governance platform.
        </p>
      </section>
    </div>
  );
}
