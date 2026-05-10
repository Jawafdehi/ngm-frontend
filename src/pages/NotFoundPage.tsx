import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="state-container error fade-in" role="alert">
      <p className="error-icon" aria-hidden="true">{'\ud83d\udd0d'}</p>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
        Go Home
      </Link>
    </div>
  );
}
