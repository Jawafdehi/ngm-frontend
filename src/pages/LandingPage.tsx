import { Link } from 'react-router-dom';

const CARDS: { icon: string; title: string; body: string; to: string; cta: string }[] = [
  {
    icon: '⚖️',
    title: 'Court Cases',
    body: "Search Nepal's Supreme, High, and District courts by case number for full case histories, hearings, and party information.",
    to: '/search',
    cta: 'Search cases',
  },
  {
    icon: '📚',
    title: 'Document Archive',
    body: 'Browse CIAA press releases & annual reports, Kanun Patrika, court orders, and PPMO records — decades of the public record.',
    to: '/browse',
    cta: 'Open archive',
  },
  {
    icon: '📂',
    title: 'CIAA Cases',
    body: 'Explore the structured CIAA corruption-case dataset by fiscal year — charge sheets, press releases, and appeal tracking.',
    to: '/dataset',
    cta: 'View dataset',
  },
  {
    icon: '📡',
    title: 'Pipeline Status',
    body: 'Track per-court coverage and the health of the data pipeline across all 97 courts of Nepal.',
    to: '/status',
    cta: 'Check status',
  },
];

export default function LandingPage() {
  return (
    <div className="fade-in">
      <section className="hero">
        <p className="hero-eyebrow">A Jawafdehi platform · Accountability for Nepal</p>
        <h2>Nepal&apos;s public governance record, open to all.</h2>
        <p>
          NGM systematically collects, archives, and indexes Nepal&apos;s judicial and
          governance records — making information that is legally public, but practically
          inaccessible, searchable and citable for citizens, journalists, and researchers.
        </p>
      </section>

      <section className="landing-cards">
        {CARDS.map((c) => (
          <div className="landing-card" key={c.to}>
            <div className="landing-card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <Link to={c.to} className="landing-card-link">
              {c.cta} &rarr;
            </Link>
          </div>
        ))}
      </section>

      <section className="landing-about">
        <h3>About NGM</h3>
        <p>
          <strong>Nepal Governance Modernization (NGM)</strong> is an open-data platform that
          scrapes, archives, and indexes judicial and governance records from Nepal&apos;s
          institutional public endpoints — the Supreme Court, the Special Court, all High
          Courts, and all 77 District Courts, alongside the CIAA, the PPMO, and the Kanun
          Patrika legal gazette.
        </p>
        <p>
          Every document keeps a link back to its official source, so anyone can verify it.
          The archive is free, open, and citable — no paywalls, no sign-up.
        </p>
        <p>
          NGM is one of the open civic platforms built by{' '}
          <a href="https://jawafdehi.org" target="_blank" rel="noopener noreferrer">
            Jawafdehi
          </a>
          , a volunteer-led, non-profit accountability initiative for Nepal.
        </p>
      </section>
    </div>
  );
}
