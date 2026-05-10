import IndexViewer from '../components/IndexViewer';

export default function BrowsePage() {
  return (
    <div className="fade-in">
      <section className="page-hero">
        <h2>Document Archive</h2>
        <p>
          Browse Nepal's judicial and governance records across Kanun Patrika,
          CIAA reports, press releases, and court orders.
        </p>
      </section>
      <section className="dashboard">
        <IndexViewer />
      </section>
    </div>
  );
}
