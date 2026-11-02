import { notFound } from 'next/navigation';

import './DocumentDetails.css';
import { formatFileSize } from '@/lib/utils/formatFileSize';
import BackButton from '../BackButton/BackButton';
import DocumentStatus from '@/components/shared/DocumentStatus/DocumentStatus';
import { getDocumentById } from '@/lib/api/documentApi';

type DocumentDetailsProps = {
  id: string;
};

export default async function DocumentDetailsPage({ id }: DocumentDetailsProps) {
  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  return (
    <section className="document-details__card">
      <header className="document-details__header">
        <BackButton />

        <DocumentStatus status={document.status} />
      </header>

      <div className="document-details__intro">
        <div className="document-details__file-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 3v7h7M8 14h8M8 17h8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="document-details__title-group">
          <span className="document-details__eyebrow">Document details</span>

          <h1 className="document-details__title">{document.title}</h1>

          <p className="document-details__description">
            Information and metadata for this document in your knowledge base.
          </p>
        </div>
      </div>

      <div className="document-details__divider" />

      <section className="document-details__metadata" aria-labelledby="document-metadata-title">
        <h2 id="document-metadata-title" className="document-details__section-title">
          Document information
        </h2>

        <dl className="document-details__grid">
          <div className="document-details__field">
            <dt>Category</dt>
            <dd>{document.category}</dd>
          </div>

          <div className="document-details__field">
            <dt>File type</dt>
            <dd>{document.type}</dd>
          </div>

          <div className="document-details__field">
            <dt>File size</dt>
            <dd>{formatFileSize(document.size)}</dd>
          </div>

          <div className="document-details__field">
            <dt>Last updated</dt>
            <dd>{new Date(document.updatedAt).toLocaleString('en-US')}</dd>
          </div>
        </dl>
      </section>
    </section>
  );
}
