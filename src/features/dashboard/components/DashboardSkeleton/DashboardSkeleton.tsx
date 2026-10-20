import './DashboardSkeleton.css';

const SKELETON_STATS = [1, 2, 3];
const SKELETON_DOCUMENTS = [1, 2, 3];

export default function DashboardSkeleton() {
  return (
    <div className="dashboard dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
      <header className="dashboard__header">
        <h1>
          <span className="skeleton dashboard-skeleton__title" />
        </h1>

        <p>
          <span className="skeleton dashboard-skeleton__subtitle" />
        </p>
      </header>

      <section className="dashboard__stats" aria-label="Statistics">
        {SKELETON_STATS.map((item) => (
          <div className="dashboard-skeleton__stat-card" key={item}>
            <div className="dashboard-skeleton__stat-top">
              <div className="skeleton dashboard-skeleton__stat-label" />
              <div className="skeleton dashboard-skeleton__stat-icon" />
            </div>

            <div className="skeleton dashboard-skeleton__stat-value" />
            <div className="skeleton dashboard-skeleton__stat-caption" />
          </div>
        ))}
      </section>

      <section className="dashboard__documents">
        <div className="section-header">
          <h2>
            <span className="skeleton dashboard-skeleton__section-title" />
          </h2>
        </div>

        <div className="documents-list">
          {SKELETON_DOCUMENTS.map((item) => (
            <div className="dashboard-skeleton__document-card" key={item}>
              <div className="skeleton dashboard-skeleton__document-icon" />

              <div className="dashboard-skeleton__document-content">
                <div className="skeleton dashboard-skeleton__document-title" />

                <div className="dashboard-skeleton__document-meta">
                  <div className="skeleton dashboard-skeleton__document-category" />
                  <div className="skeleton dashboard-skeleton__document-info" />
                  <div className="skeleton dashboard-skeleton__document-info dashboard-skeleton__document-info--short" />
                </div>

                <div className="skeleton dashboard-skeleton__document-date" />
              </div>

              <div className="skeleton dashboard-skeleton__document-status" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
