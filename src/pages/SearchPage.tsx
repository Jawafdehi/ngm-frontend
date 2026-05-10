import CourtCaseSearch from '../components/CourtCaseSearch';

export default function SearchPage() {
  return (
    <div className="fade-in">
      <section className="page-hero">
        <h2>Court Case Search</h2>
        <p>
          Search for case details across all courts in Nepal. Enter a case number
          and select the court to view full case history, hearings, and party
          information.
        </p>
      </section>
      <CourtCaseSearch />
    </div>
  );
}
