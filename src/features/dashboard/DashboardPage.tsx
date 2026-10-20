import { DOCUMENTS } from '@/lib/data/documents';
import { DASHBOARD_STATS, DashboardStats } from './dashboard.constants';
import './DashboardPage.css';
import StatCard from '@/components/shared/StatCard/StatCard';
import DocumentCard from '@/components/shared/DocumentCard/DocumentCard';
import { formatFileSize } from '@/lib/utils/formatFileSize';

export default function DashboardPage() {
  const stats = DASHBOARD_STATS.map((stat) => {
    switch (stat.id) {
      case DashboardStats.Documents:
        return { ...stat, value: DOCUMENTS.length };
      case DashboardStats.Questions:
        return { ...stat, value: '-' };
      case DashboardStats.Storage: {
        const totalStorage = DOCUMENTS.reduce((total, { size }) => total + size, 0);

        return { ...stat, value: formatFileSize(totalStorage) };
      }
      default:
        return { ...stat, value: '—' };
    }
  });

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Dashboard</h1>
        <p>Welcome back, Alex</p>
      </header>

      <section className="dashboard__stats" aria-label="Statistics">
        {stats.map(({ id, title, value }) => (
          <StatCard key={id} title={title} value={value} />
        ))}
      </section>

      <section className="dashboard__documents">
        <div className="section-header">
          <h2>Recent Documents</h2>
        </div>

        <div className="documents-list">
          {DOCUMENTS.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      </section>
    </div>
  );
}
