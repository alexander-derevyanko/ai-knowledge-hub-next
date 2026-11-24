import DocumentCard from '@/shared/components/ui/DocumentCard/DocumentCard';
import type { Document } from '@/shared/types/document';

import './DocumentList.css';

interface DocumentListProps {
  documents: Document[];
  totalCount: number;
  isLoading?: boolean;
}

export default function DocumentList({
  documents,
  totalCount,
  isLoading = false,
}: DocumentListProps) {
  return (
    <section className="document-list" data-testid="document-list">
      <div className="document-list__toolbar">
        <p className="document-list__count">
          {totalCount} {totalCount === 1 ? 'document' : 'documents'}
        </p>

        <span className="document-list__hint">
          {isLoading ? 'Updating results...' : 'Results update automatically'}
        </span>
      </div>

      {documents.length > 0 ? (
        <div className="document-list__items" aria-busy={isLoading}>
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="document-list__empty">
          <h2>No documents found</h2>
          <p>Try changing your search or category filters.</p>
        </div>
      )}
    </section>
  );
}
