import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Hearing {
  id: number;
  hearing_date_bs?: string;
  hearing_date_ad?: string;
  judge_names?: string;
  lawyer_names?: string;
  case_status?: string;
  decision_type?: string;
  remarks?: string;
  bench_type?: string;
}

interface Entity {
  id: number;
  name: string;
  side: string;
  address?: string;
}

interface CourtCase {
  case_number: string;
  court_identifier: string;
  registration_date_bs?: string;
  registration_date_ad?: string;
  case_type?: string;
  plaintiff?: string;
  defendant?: string;
  case_status?: string;
  division?: string;
  category?: string;
  section?: string | null;
  verdict_date_bs?: string | null;
  verdict_date_ad?: string | null;
  hearings?: Hearing[];
  entities?: Entity[];
}

const COURT_NAMES: Record<string, string> = {
  supreme: 'Supreme Court',
  special: 'Special Court',
};

// prettier-ignore
const HCC: Record<string, string> = {
  baglunghc:'Baglung', biratnagarhc:'Biratnagar', birganjhc:'Birgunj',
  butwalhc:'Butwal', dhankutahc:'Dhankuta', dipayalhc:'Dipayal',
  hetaudahc:'Hetauda', illamhc:'Illam', janakpurhc:'Janakpur',
  jumlahc:'Jumla', mahendranagarhc:'Mahendranagar', nepalgunjhc:'Nepalgunj',
  okhaldhungahc:'Okhaldhungha', patanhc:'Patan', pokharahc:'Pokhara',
  rajbirajhc:'Rajbiraj', surkhethc:'Surkhet', tulsipurhc:'Tulsipur',
};

function courtLabel(id: string): string {
  if (COURT_NAMES[id]) return COURT_NAMES[id];
  if (HCC[id]) return `${HCC[id]} High Court`;
  return id.replace('dc', ' District Court').replace(/^./, (c) => c.toUpperCase());
}

export default function CaseDetailPage() {
  const { court, caseNumber } = useParams<{ court: string; caseNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [caseData, setCaseData] = useState<CourtCase | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!court || !caseNumber) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setIsNotFound(false);
    setCaseData(null);

    const endpoint = `https://portal.jawafdehi.org/api/ngm/court_case/${court}:${caseNumber}`;
    fetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setIsNotFound(true);
            throw new Error(`Case not found: ${court}:${caseNumber}`);
          }
          throw new Error(`Failed to fetch case: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setCaseData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      });

    return () => controller.abort();
  }, [court, caseNumber]);

  if (loading) {
    return (
      <div className="state-container bounce-in" role="status">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error fade-in" role="alert">
        <p className="error-icon" aria-hidden="true">{'\u26A0\uFE0F'}</p>
        <h2>{isNotFound ? 'Case Not Found' : 'Unable to Load Case'}</h2>
        <p>{error}</p>
        <Link to="/search" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Back to Search
        </Link>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/search" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>
          &larr; Back to Search
        </Link>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: '12px', border: '2px solid #e5e7eb', padding: '1.5rem'
      }}>
        <h3 style={{
          color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.2rem',
          borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem'
        }}>
          &#x1F4CB; Case Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Case Number', value: caseData.case_number },
            { label: 'Court', value: courtLabel(caseData.court_identifier) },
            { label: 'Case Type', value: caseData.case_type },
            { label: 'Category', value: caseData.category },
            { label: 'Division', value: caseData.division },
            { label: 'Status', value: caseData.case_status },
            { label: 'Plaintiff', value: caseData.plaintiff },
            { label: 'Defendant', value: caseData.defendant },
            { label: 'Registration Date (BS)', value: caseData.registration_date_bs },
            { label: 'Registration Date (AD)', value: caseData.registration_date_ad },
            { label: 'Verdict Date (BS)', value: caseData.verdict_date_bs },
            { label: 'Verdict Date (AD)', value: caseData.verdict_date_ad },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>{String(value)}</div>
            </div>
          ))}
        </div>

        {caseData.entities && caseData.entities.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--navy)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              &#x1F465; Parties Involved
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {caseData.entities.map((entity) => (
                <div key={entity.id} style={{
                  padding: '0.75rem', borderRadius: '6px',
                  background: entity.side === 'plaintiff' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${entity.side === 'plaintiff' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase',
                    color: entity.side === 'plaintiff' ? '#15803d' : '#dc2626',
                  }}>
                    {entity.side === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
                  </div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>{entity.name}</div>
                  {entity.address && <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>{entity.address}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {caseData.hearings && caseData.hearings.length > 0 && (
          <div>
            <h4 style={{ color: 'var(--navy)', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              &#x1F5D3; Hearing History ({caseData.hearings.length} hearings)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {caseData.hearings.map((hearing) => (
                <div key={hearing.id} style={{
                  padding: '1rem', background: '#f8fafc', borderRadius: '8px',
                  border: '1px solid #e2e8f0', borderLeft: '4px solid var(--navy)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{hearing.hearing_date_bs}</span>
                      {hearing.hearing_date_ad && <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({hearing.hearing_date_ad})</span>}
                    </div>
                    {hearing.case_status && (
                      <span style={{ background: 'var(--bg-tint)', color: 'var(--navy)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {hearing.case_status}
                      </span>
                    )}
                  </div>
                  {hearing.decision_type && (
                    <div style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Decision:</strong> {hearing.decision_type}
                    </div>
                  )}
                  {hearing.judge_names && (
                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <strong>Judges:</strong> {hearing.judge_names.replace(/\n/g, ', ')}
                    </div>
                  )}
                  {hearing.remarks && (
                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      <strong>Remarks:</strong> {hearing.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <details style={{ marginTop: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--navy)', fontWeight: 600, fontSize: '0.9rem' }}>
            View Raw JSON
          </summary>
          <pre style={{
            background: '#1f2937', color: '#f3f4f6', padding: '1rem', borderRadius: '6px',
            overflow: 'auto', fontSize: '0.85rem', marginTop: '0.75rem',
          }}>
            {JSON.stringify(caseData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
