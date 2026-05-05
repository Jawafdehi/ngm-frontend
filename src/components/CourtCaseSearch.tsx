import { useState, useRef, useEffect } from 'react';

// Court list for Nepal
const COURTS = [
    { id: 'supreme', name: 'Supreme Court' },
    { id: 'special', name: 'Special Court' },
];

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

export default function CourtCaseSearch() {
    const [selectedCourt, setSelectedCourt] = useState<string>('supreme');
    const [caseNumber, setCaseNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [caseData, setCaseData] = useState<CourtCase | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        };
    }, []);

    const handleSearch = async () => {
        if (!caseNumber.trim()) {
            setError('Please enter a case number');
            return;
        }

        // Abort any in-flight request
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);
        setCaseData(null);

        try {
            const endpoint = `https://portal.jawafdehi.org/api/ngm/court_case/${selectedCourt}:${caseNumber.trim()}`;
            const response = await fetch(endpoint, { signal: controller.signal });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Case not found: ${selectedCourt}:${caseNumber.trim()}`);
                }
                throw new Error(`Failed to fetch case data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCaseData(data);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                return; // Stale request — ignore
            }
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Network error: Unable to connect to the server.');
            } else {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching case data');
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="fade-in">
            {/* Search Form */}
            <div style={{ 
                padding: '1.5rem', 
                background: '#f0f4ff', 
                borderRadius: '12px', 
                marginBottom: '1.5rem',
                border: '2px solid #bfdbfe'
            }}>
                <h3 style={{ color: '#1e40af', marginBottom: '1rem', fontSize: '1.1rem' }}>
                    🔍 Search Court Cases
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                    {/* Court Dropdown */}
                    <div>
                        <label 
                            htmlFor="court-select" 
                            style={{ 
                                display: 'block', 
                                color: '#1e40af', 
                                marginBottom: '0.5rem', 
                                fontSize: '0.9rem', 
                                fontWeight: 600 
                            }}
                        >
                            Court *
                        </label>
                        <select
                            id="court-select"
                            value={selectedCourt}
                            onChange={(e) => {
                                abortControllerRef.current?.abort();
                                abortControllerRef.current = null;
                                setCaseData(null);
                                setError(null);
                                setLoading(false);
                                setSelectedCourt(e.target.value);
                            }}
                            style={{ 
                                width: '100%', 
                                padding: '0.6rem', 
                                borderRadius: '6px', 
                                border: '2px solid #bfdbfe',
                                background: '#ffffff',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {COURTS.map(court => (
                                <option key={court.id} value={court.id}>
                                    {court.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Case Number Input */}
                    <div>
                        <label 
                            htmlFor="case-number" 
                            style={{ 
                                display: 'block', 
                                color: '#1e40af', 
                                marginBottom: '0.5rem', 
                                fontSize: '0.9rem', 
                                fontWeight: 600 
                            }}
                        >
                            Case Number *
                        </label>
                        <input
                            id="case-number"
                            type="text"
                            value={caseNumber}
                            onChange={(e) => setCaseNumber(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{ 
                                width: '100%', 
                                padding: '0.6rem', 
                                borderRadius: '6px', 
                                border: '2px solid #bfdbfe',
                                background: '#ffffff',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={loading || !caseNumber.trim()}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: !loading && caseNumber.trim() ? '#3b82f6' : '#cbd5e1',
                            color: 'white',
                            fontWeight: 600,
                            cursor: !loading && caseNumber.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <p style={{ color: '#64748b', marginTop: '0.75rem', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    💡 Enter a case number to search for court case details
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="state-container error fade-in" role="alert" style={{ marginBottom: '1.5rem' }}>
                    <p className="error-icon" aria-hidden="true">⚠️</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="state-container bounce-in" role="status" aria-live="polite">
                    <div className="spinner" aria-hidden="true"></div>
                    <p>Searching for case...</p>
                </div>
            )}

            {/* Case Data Display */}
            {caseData && !loading && (
                <div style={{ 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    border: '2px solid #e5e7eb',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ 
                        color: '#1f2937', 
                        marginBottom: '1.5rem', 
                        fontSize: '1.2rem',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '0.75rem'
                    }}>
                        📋 Case Details
                    </h3>

                    {/* Basic Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Case Number', value: caseData.case_number },
                            { label: 'Court', value: caseData.court_identifier === 'supreme' ? 'Supreme Court' : caseData.court_identifier === 'special' ? 'Special Court' : caseData.court_identifier },
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

                    {/* Entities (Parties) */}
                    {caseData.entities && caseData.entities.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#1e40af', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                👥 Parties Involved
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {caseData.entities.map((entity) => (
                                    <div key={entity.id} style={{ padding: '0.75rem', background: entity.side === 'plaintiff' ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', border: `1px solid ${entity.side === 'plaintiff' ? '#bbf7d0' : '#fecaca'}` }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: entity.side === 'plaintiff' ? '#15803d' : '#dc2626', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                            {entity.side === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
                                        </div>
                                        <div style={{ color: '#111827', fontWeight: 500 }}>{entity.name}</div>
                                        {entity.address && <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>{entity.address}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hearings */}
                    {caseData.hearings && caseData.hearings.length > 0 && (
                        <div>
                            <h4 style={{ color: '#1e40af', fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                🗓 Hearing History ({caseData.hearings.length} hearings)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {caseData.hearings.map((hearing) => (
                                    <div key={hearing.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 600, color: '#1e40af' }}>{hearing.hearing_date_bs}</span>
                                                {hearing.hearing_date_ad && <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({hearing.hearing_date_ad})</span>}
                                            </div>
                                            {hearing.case_status && (
                                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
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

                    {/* Raw JSON Display */}
                    <details style={{ marginTop: '1.5rem' }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            color: '#3b82f6', 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            View Raw JSON
                        </summary>
                        <pre style={{ 
                            background: '#1f2937', 
                            color: '#f3f4f6', 
                            padding: '1rem', 
                            borderRadius: '6px',
                            overflow: 'auto',
                            fontSize: '0.85rem',
                            marginTop: '0.75rem'
                        }}>
                            {JSON.stringify(caseData, null, 2)}
                        </pre>
                    </details>
                </div>
            )}

            {/* Empty State */}
            {!caseData && !loading && !error && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: '#9ca3af',
                    fontSize: '0.95rem'
                }}>
                    <p>Enter a case number and click search to view case details</p>
                </div>
            )}
        </div>
    );
}
