import { useState, useEffect, useRef } from 'react';

const NGM_STORE = 'https://ngm-store.jawafdehi.org';

interface IndexChild {
  name: string;
  path: string;
  $ref: string;
}

interface IndexNode {
  name: string;
  path: string;
  children?: IndexChild[];
  manuscripts?: unknown[];
  next?: string;
}

interface IndexRoot {
  name: string;
  path: string;
  children: IndexChild[];
}

interface CourtStatus {
  name: string;
  yearCount: number;
  availableYears: string[];
  gaps: string[];
}

const isDev = import.meta.env.DEV;
function proxy(url: string): string {
  if (isDev && url.startsWith(NGM_STORE)) {
    return url.replace(NGM_STORE, '/api');
  }
  return url;
}

function yearLabel(y: string): string {
  const n = parseInt(y, 10);
  if (Number.isNaN(n)) return y;
  return `${y} BS (${n - 57} AD)`;
}

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courts, setCourts] = useState<CourtStatus[]>([]);
  const [scraperSections, setScraperSections] = useState<{ name: string; status: string; count: number }[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function load() {
      try {
        const indexUrl = proxy(`${NGM_STORE}/index-v2.json`);
        const res = await fetch(indexUrl, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch index');
        const root: IndexRoot = await res.json();

        // Extract scraper sections (non-court top-level entries)
        const sections: { name: string; status: string; count: number }[] = [];
        const courtRefs: IndexChild[] = [];

        for (const child of root.children) {
          if (child.name === 'court-orders') {
            courtRefs.push(child);
          } else if (child.name === 'ciaa-annual-reports') {
            sections.push({ name: 'CIAA Annual Reports', status: 'active', count: 0 });
            void fetchCount(child.$ref, controller.signal, sections, sections.length - 1);
          } else if (child.name === 'ciaa-press-releases') {
            sections.push({ name: 'CIAA Press Releases', status: 'active', count: 0 });
            void fetchCount(child.$ref, controller.signal, sections, sections.length - 1);
          } else if (child.name === 'kanun-patrika') {
            sections.push({ name: 'Kanun Patrika', status: 'active', count: 0 });
            void fetchCount(child.$ref, controller.signal, sections, sections.length - 1);
          }
        }
        setScraperSections(sections);

        // Fetch court coverage
        if (courtRefs.length > 0) {
          const courtRes = await fetch(proxy(courtRefs[0].$ref), { signal: controller.signal });
          if (courtRes.ok) {
            const courtNode: IndexNode = await courtRes.json();
            if (courtNode.children) {
              const courtStatuses: CourtStatus[] = [];

              for (let i = 0; i < courtNode.children.length; i++) {
                if (controller.signal.aborted) break;
                const child = courtNode.children[i];
                try {
                  const childRes = await fetch(proxy(child.$ref), { signal: controller.signal });
                  if (childRes.ok) {
                    let years: string[] = [];
                    let totalPages = 1;
                    let childPageUrl: string | undefined = child.$ref;

                    // Collect all years from paginated children
                    while (childPageUrl) {
                      const pageRes = await fetch(proxy(childPageUrl), { signal: controller.signal });
                      if (!pageRes.ok) break;
                      const pageNode: IndexNode = await pageRes.json();
                      if (pageNode.children) {
                        years.push(...pageNode.children.map((c) => c.name));
                      }
                      childPageUrl = pageNode.next;
                      totalPages++;
                      if (totalPages > 50) break; // safety limit
                    }

                    const sorted = years.sort();
                    const gaps = findGaps(sorted);
                    courtStatuses.push({
                      name: child.name,
                      yearCount: years.length,
                      availableYears: sorted,
                      gaps,
                    });
                  }
                } catch {
                  // skip failed court loads
                }
              }

              setCourts(courtStatuses);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load status');
        setLoading(false);
      }
    }

    async function fetchCount(ref: string, signal: AbortSignal, _sections: typeof scraperSections, idx: number) {
      try {
        let url: string | undefined = ref;
        let count = 0;
        let pages = 0;
        while (url && pages < 100) {
          const res = await fetch(proxy(url), { signal });
          if (!res.ok) break;
          const node: IndexNode = await res.json();
          if (node.manuscripts) count += node.manuscripts.length;
          url = node.next;
          pages++;
        }
        setScraperSections((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], count };
          return next;
        });
      } catch {
        // ignore
      }
    }

    load();
    return () => controller.abort();
  }, []);

  function findGaps(sortedYears: string[]): string[] {
    const gaps: string[] = [];
    for (let i = 1; i < sortedYears.length; i++) {
      const prev = parseInt(sortedYears[i - 1], 10);
      const curr = parseInt(sortedYears[i], 10);
      if (!Number.isNaN(prev) && !Number.isNaN(curr) && curr - prev > 1) {
        for (let y = prev + 1; y < curr; y++) {
          gaps.push(String(y));
        }
      }
    }
    return gaps;
  }

  if (loading) {
    return (
      <div className="state-container bounce-in" role="status">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading scraper status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error fade-in" role="alert">
        <p className="error-icon" aria-hidden="true">&#x26A0;&#xFE0F;</p>
        <h2>Unable to Load Status</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="page-hero">
        <h2>Scraper Status Dashboard</h2>
        <p>
          Real-time coverage and health indicators for the NGM data pipeline.
          Monitor per-court archive completeness and scraper run activity.
        </p>
      </section>

      <section className="status-section">
        <h3 className="status-section-title">&#x1F4E6; Data Collections</h3>
        <div className="status-grid">
          {scraperSections.map((s) => (
            <div key={s.name} className="status-card">
              <div className="status-card-header">
                <span className={`status-badge ${s.status}`}>
                  {s.status === 'active' ? '&#x2705; Active' : s.status}
                </span>
              </div>
              <h4>{s.name}</h4>
              <p className="status-metric">
                <strong>{s.count.toLocaleString()}</strong> documents indexed
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="status-section">
        <h3 className="status-section-title">&#x1F3DB;&#xFE0F; Court Coverage ({courts.length} courts)</h3>
        <div className="status-grid">
          {courts.map((court) => (
            <div key={court.name} className="status-card">
              <div className="status-card-header">
                <span className={`status-badge ${court.yearCount > 0 ? 'active' : 'inactive'}`}>
                  {court.yearCount > 0 ? '&#x2705; Covered' : '&#x26AA; No Data'}
                </span>
                <span className="status-badge info">
                  {court.yearCount} year{court.yearCount !== 1 ? 's' : ''}
                </span>
              </div>
              <h4>
                {court.name}
              </h4>
              {court.yearCount > 0 && (
                <div className="status-court-detail">
                  {court.gaps.length > 0 && (
                    <p className="gap-warning">
                      &#x26A0;&#xFE0F; Gap{court.gaps.length > 1 ? 's' : ''}: {court.gaps.slice(0, 10).join(', ')}{court.gaps.length > 10 ? '...' : ''}
                    </p>
                  )}
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                      View all {court.yearCount} years
                    </summary>
                    <div className="year-chips">
                      {court.availableYears.slice(-10).map((y) => (
                        <span key={y} className="year-chip" title={yearLabel(y)}>
                          {y}
                        </span>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="status-section">
        <h3 className="status-section-title">&#x1F4C5; Last Scrape Timestamps</h3>
        <div className="status-timestamps-note">
          <p>
            Per-court scrape timestamps will be available when the backend
            pipeline exposes a dedicated status endpoint. The scrapers currently
            run on a schedule and push data to the NGM Store (R2). A future API
            update will surface last-run metadata for each court scraper.
          </p>
        </div>
      </section>
    </div>
  );
}
