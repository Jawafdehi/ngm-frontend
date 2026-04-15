import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';

// Public R2 base URL for the CIAA dataset
const R2_BASE = import.meta.env.DEV
  ? '/r2-testing/test/ciaa_dataset'
  : 'https://pub-4c5659ae2e0249e99311f6c50897f48a.r2.dev/test/ciaa_dataset';

// Known fiscal years to try loading (full year: "2080")
// Add more as the pipeline produces them
const KNOWN_FISCAL_YEARS = ['2080'];

interface FYIndexCase {
  case_no: string;
  case_title: string;
  match_status: 'confirmed' | 'needs_review' | 'unmatched';
  registration_date_bs?: string;
  registration_date_ad?: string;
  current_status?: string;
  defendant_count?: number;
  press_release_count?: number;
  press_releases?: Array<{ release_id: number; url: string; title: string }>;
  abhiyog_patras?: Array<{ url: string }>;
  faisala_links?: string[];
}

interface FYIndex {
  fiscal_year: string;
  generated_at: string;
  stats: {
    total: number;
    matched: number;
    needs_review: number;
    unmatched: number;
  };
  cases: FYIndexCase[];
}

interface PressRelease {
  release_id: number;
  url: string;
  title: string;
}

interface AbhiyogPatra {
  url: string;
}

interface TableRow extends Record<string, unknown> {
  id: number;
  case_no: string;
  case_title: string;
  fiscal_year: string;
  match_status: string;
  case_url: string;
  registration_date_bs: string;
  registration_date_ad: string;
  current_status: string;
  defendant_count: number;
  press_release_count: number;
  press_releases: PressRelease[];
  abhiyog_patras: AbhiyogPatra[];
  faisala_links: string[];
}

export default function CIAADatasetViewer() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ fy: string; total: number; matched: number; needs_review: number; unmatched: number } | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const allRows: TableRow[] = [];
      const combinedStats = { total: 0, matched: 0, needs_review: 0, unmatched: 0 };
      let lastFY = '';
      let hasFirstBatch = false;

      for (const fy of KNOWN_FISCAL_YEARS) {
        if (signal?.aborted) return;
        
        const url = `${R2_BASE}/ciaa/cases/${fy}/index.json`;
        const res = await fetch(url, { signal });
        if (!res.ok) {
          console.warn(`No index for FY ${fy}: ${res.status}`);
          continue;
        }
        const index: FYIndex = await res.json();
        
        if (signal?.aborted) return;
        
        lastFY = index.fiscal_year;
        combinedStats.total += index.stats.total;
        combinedStats.matched += index.stats.matched;
        combinedStats.needs_review += index.stats.needs_review;
        combinedStats.unmatched += index.stats.unmatched;

        // Set stats immediately
        setStats({ fy: lastFY, ...combinedStats });

        // Filter confirmed cases
        const confirmedCases = index.cases.filter(c => c.match_status === 'confirmed');
        
        // Batch fetch case details (parallel requests, limit concurrency)
        const BATCH_SIZE = 10; // Fetch 10 at a time
        for (let i = 0; i < confirmedCases.length; i += BATCH_SIZE) {
          if (signal?.aborted) return;
          
          const batch = confirmedCases.slice(i, i + BATCH_SIZE);
          
          const batchPromises = batch.map(async (c) => {
            try {
              const caseUrl = `${R2_BASE}/ciaa/cases/${fy}/${c.case_no}.json`;
              const caseRes = await fetch(caseUrl, { signal });
              if (!caseRes.ok) return null;
              
              const caseData = await caseRes.json();
              
              return {
                id: 0, // Will be set later
                case_no: c.case_no,
                case_title: c.case_title,
                fiscal_year: index.fiscal_year,
                match_status: c.match_status,
                case_url: caseUrl,
                registration_date_bs: caseData.court_case?.registration_date_bs || 'N/A',
                registration_date_ad: caseData.court_case?.registration_date_ad || 'N/A',
                current_status: caseData.court_case?.current_status || 'Unknown',
                defendant_count: caseData.court_case?.defendants?.length || 0,
                press_release_count: (caseData.ciaa?.press_releases || []).length,
                press_releases: caseData.ciaa?.press_releases || [],
                abhiyog_patras: caseData.ciaa?.abhiyogPatras || [],
                faisala_links: caseData.court_case?.faisala_link || [],
              };
            } catch (err) {
              if (err instanceof Error && err.name === 'AbortError') return null;
              console.warn(`Error fetching case ${c.case_no}:`, err);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          if (signal?.aborted) return;
          
          const validResults = batchResults.filter(r => r !== null) as TableRow[];
          allRows.push(...validResults);
          
          // Update rows progressively after each batch
          setRows([...allRows].map((row, idx) => ({ ...row, id: idx + 1 })));
          
          // Clear loading after first successful batch
          if (!hasFirstBatch && validResults.length > 0) {
            hasFirstBatch = true;
            setLoading(false);
          }
        }
      }

      if (signal?.aborted) return;

      // Final update
      setRows(allRows.map((row, idx) => ({ ...row, id: idx + 1 })));
      if (allRows.length > 0) {
        setStats({ fy: lastFY, ...combinedStats });
      }
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to load CIAA dataset');
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, []);

  const columns: ColumnDef<TableRow>[] = [
    {
      accessorKey: 'case_no',
      header: 'Case No.',
      size: 110,
      cell: (info) => (
        <a href={info.row.original.case_url} target="_blank" rel="noopener noreferrer">
          {info.getValue() as string}
        </a>
      ),
    },
    {
      accessorKey: 'case_title',
      header: 'Case Title',
      size: 250,
    },
    {
      id: 'raw_data',
      header: 'Raw Data',
      size: 100,
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => (
        <a
          href={info.row.original.case_url}
          target="_blank"
          rel="noopener noreferrer"
          className="file-chip"
          style={{ background: '#e0e7ff', color: '#4338ca', borderColor: '#c7d2fe', textDecoration: 'none' }}
          title="View raw JSON data"
        >
          View JSON
        </a>
      ),
    },
    {
      id: 'documents',
      header: 'Related Documents',
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        const docs: ReactNode[] = [];
        
        // Press Releases
        if (row.press_releases && row.press_releases.length > 0) {
          row.press_releases.forEach((pr, idx: number) => {
            docs.push(
              <a
                key={`pr-${idx}`}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-chip"
                style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}
                title={pr.title}
              >
                Press Release #{pr.release_id}
              </a>
            );
          });
        }
        
        // Abhiyog Patras
        if (row.abhiyog_patras && row.abhiyog_patras.length > 0) {
          row.abhiyog_patras.forEach((ap, idx: number) => {
            docs.push(
              <a
                key={`ap-${idx}`}
                href={ap.url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-chip pdf"
              >
                Charge Sheet
              </a>
            );
          });
        }
        
        // Faisala (Court Decision)
        if (row.faisala_links && row.faisala_links.length > 0) {
          row.faisala_links.forEach((link: string, idx: number) => {
            const ext = link.match(/\.([A-Za-z0-9]+)$/)?.[1]?.toUpperCase() || 'DOC';
            docs.push(
              <a
                key={`faisala-${idx}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="file-chip doc"
              >
                Court Decision ({ext})
              </a>
            );
          });
        }
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {docs.length > 0 ? docs : <span style={{ color: '#64748b', fontSize: '0.8rem' }}>—</span>}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="state-container bounce-in" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading CIAA dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error fade-in" role="alert">
        <p className="error-icon" aria-hidden="true">⚠️</p>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => void load()}>Retry</button>
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="empty-state">No CIAA dataset records found.</p>;
  }

  return (
    <div className="fade-in">
      {stats && (
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          padding: '1rem 1.25rem', background: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0', fontSize: '0.8rem', fontWeight: 600,
        }}>
          <span style={{ color: '#374151' }}>Fiscal Year {stats.fy}</span>
          <span style={{ color: '#166534' }}>
            Showing {rows.length} verified cases linked with CIAA data
          </span>
        </div>
      )}
      <DataTable
        data={rows}
        columns={columns}
        pageSize={20}
        searchPlaceholder="Search by case number or title..."
      />
    </div>
  );
}
