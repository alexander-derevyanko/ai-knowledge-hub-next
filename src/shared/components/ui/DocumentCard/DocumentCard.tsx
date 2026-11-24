import Link from 'next/link';

import { type Document } from '@/shared/types/document';
import DocumentStatus from '@/shared/components/ui/DocumentStatus/DocumentStatus';
import { formatFileSize } from '@/shared/utils/formatFileSize';
import { CATEGORY_LABELS } from '@/shared/constants/document';

import './DocumentCard.css';

interface DocumentCardProps {
  document: Document;
  href?: string | null;
}

export default function DocumentCard({
  document,
  href = `/documents/${document.id}`,
}: DocumentCardProps) {
  const formattedFileSize = formatFileSize(document.sizeBytes);

  return (
    <article className="document-card">
      <div className="document-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 3.5h7l5 5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-14A2 2 0 0 1 7 3.5Z" />
          <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5" />
        </svg>
      </div>

      <div className="document-card__content">
        {href ? (
          <Link href={href}>
            <h2 className="document-card__title">{document.title}</h2>
          </Link>
        ) : (
          <h2 className="document-card__title">{document.title}</h2>
        )}

        <p className="document-card__meta">
          {CATEGORY_LABELS[document.category]} · {document.type} · {formattedFileSize}
        </p>

        <p className="document-card__updated">
          Updated {new Date(document.updatedAt).toLocaleString('en-US')}
        </p>
      </div>

      <DocumentStatus status={document.status} />
    </article>
  );
}
