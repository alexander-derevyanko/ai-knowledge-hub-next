import type { Document } from '@/lib/types/document';
import './DocumentCard.css';
import { formatFileSize } from '@/lib/utils/formatFileSize';

interface DocumentCardProps {
  document: Document;
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const formatedFileSize = formatFileSize(document.size);

  return (
    <article className="document-card">
      <div className="document-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 3.5h7l5 5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-14A2 2 0 0 1 7 3.5Z" />
          <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5" />
        </svg>
      </div>

      <div className="document-card__content">
        <h2 className="document-card__title">{document.title}</h2>

        <p className="document-card__meta">
          {document.category} · {document.type} · {formatedFileSize}
        </p>

        <p className="document-card__updated">
          Updated {new Date(document.updatedAt).toLocaleString('en-EN')}
        </p>
      </div>

      <span className="document-card__status">Ready</span>
    </article>
  );
}
