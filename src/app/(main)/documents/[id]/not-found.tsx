import BackButton from '@/features/documents/components/BackButton/BackButton';
import './not-found.css';

export default function NotFoundPage() {
  return (
    <div className="document-not-found">
      <section className="document-not-found__card" aria-labelledby="not-found-title">
        <div className="document-not-found__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span className="document-not-found__eyebrow">Document unavailable</span>

        <h1 id="not-found-title" className="document-not-found__title">
          Document not found
        </h1>

        <p className="document-not-found__description">
          This document may have been removed or the link may be incorrect. Return to your documents
          to find what you need.
        </p>

        <div className="document-not-found__actions">
          <BackButton />
        </div>
      </section>
    </div>
  );
}
