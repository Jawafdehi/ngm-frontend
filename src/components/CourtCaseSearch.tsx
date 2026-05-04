import { useState } from 'react';

// Court list for Nepal
const COURTS = [
    { id: 'supreme', name: 'Supreme Court' },
    { id: 'special', name: 'Special Court' },
];

interface CourtCase {
    case_number: string;
    court_identifier: string;
    registration_date_bs?: string;
    registration_date_ad?: string;
    case_type?: string;
    plaintiff?: string;
    defendant?: string;
    case_status?: string;
    [key: string]: unknown;
}

export default function CourtCaseSearch() {
    const [selectedCourt, setSelectedCourt] = useState<string>('supreme');
    const [caseNumber, setCaseNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [caseData, setCaseData] = useState<CourtCase | null>(null);

    const handleSearch = async () => {
        if (!caseNumber.trim()) {
            setError('Please enter a case number');
            return;
        }

        setLoading(true);
        setError(null);
        setCaseData(null);

        try {
            const endpoint = `/api/ngm/court_case/${selectedCourt}:${caseNumber.trim()}`;
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Case not found: ${selectedCourt}:${caseNumber.trim()}`);
                }
                throw new Error(`Failed to fetch case data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCaseData(data);
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Network error: Unable to connect to the server. The backend endpoint may not be available yet.');
            } else {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching case data');
            }
        } finally {
            setLoading(false);
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
                            onChange={(e) => setSelectedCourt(e.target.value)}
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
                            placeholder="e.g., 081-CR-0081"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {Object.entries(caseData).map(([key, value]) => (
                            <div key={key} style={{ 
                                padding: '0.75rem', 
                                background: '#f9fafb', 
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ 
                                    color: '#6b7280', 
                                    fontSize: '0.8rem', 
                                    marginBottom: '0.25rem',
                                    textTransform: 'capitalize'
                                }}>
                                    {key.replace(/_/g, ' ')}
                                </div>
                                <div style={{ 
                                    color: '#111827', 
                                    fontSize: '0.95rem', 
                                    fontWeight: 500 
                                }}>
                                    {typeof value === 'object' && value !== null 
                                        ? JSON.stringify(value, null, 2)
                                        : String(value || 'N/A')
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

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
