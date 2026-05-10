import type { FallbackRender } from '@sentry/react'

const ErrorFallback: FallbackRender = ({ error, resetError }) => {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="app-container">
      <header className="app-header glass">
        <div className="header-content">
          <div className="logo-group">
            <h1 className="logo">Nepal Governance Modernization</h1>
            <span className="version-pill">v1.0</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero slide-down">
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. The issue has been logged and will be investigated.</p>
        </section>

        <section className="dashboard">
          <div className="state-container error" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="state-icon">&#9888;</div>
            <h3 className="state-title">Application Error</h3>
            <pre className="state-detail" style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '0.8rem',
              opacity: 0.7,
            }}>
              {message}
            </pre>
            <button className="retry-button" onClick={resetError} style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Jawafdehi.org. Open Data. Open Governance.</p>
      </footer>
    </div>
  )
}

export default ErrorFallback
