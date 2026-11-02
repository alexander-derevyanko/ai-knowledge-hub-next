import { fetchDocuments } from '@/lib/api/documentApi';
import DocumentsClient from './components/DocumentsClient/DocumentsClient';
import './DocumentsPage.css';

export default async function DocumentsPage() {
  const documents = await fetchDocuments();

  return (
    <div className="documents">
      <header className="documents__header">
        <h1>Documents</h1>
        <p>Manage and browse your knowledge base</p>
      </header>

      <DocumentsClient initialDocuments={documents} />
    </div>
  );
}
