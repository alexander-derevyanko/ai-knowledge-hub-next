import DocumentsClient from './components/DocumentsClient/DocumentsClient';
import './DocumentsPage.css';
import { DOCUMENTS } from '@/lib/data/documents';

export default function DocumentsPage() {
  const documents = DOCUMENTS;

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
