import CIAADatasetViewer from '../components/CIAADatasetViewer';

export default function DatasetPage() {
  return (
    <div className="fade-in">
      <section className="page-hero">
        <h2>CIAA Dataset Viewer</h2>
        <p>
          Structured corruption cases from the Commission for the Investigation
          of Abuse of Authority, cross-referenced with court records and press
          releases.
        </p>
      </section>
      <section className="dashboard">
        <CIAADatasetViewer />
      </section>
    </div>
  );
}
