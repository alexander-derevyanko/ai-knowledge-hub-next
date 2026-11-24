import { fetchDocumentsServer } from './api/documentsServerApi';
import DocumentsClient from './components/DocumentsClient/DocumentsClient';

import './DocumentsPage.css';

export default async function DocumentsPage() {
  const initialData = await fetchDocumentsServer({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  return (
    <div className="documents">
      <header className="documents__header">
        <h1>Documents</h1>
        <p>Manage and browse your knowledge base</p>
      </header>

      <DocumentsClient initialData={initialData} />
    </div>
  );
}
