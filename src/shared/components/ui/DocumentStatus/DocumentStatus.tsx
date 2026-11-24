import { DocumentStatus as DocumentStatusValue } from '@/shared/types/document';
import './DocumentStatus.css';

type DocumentStatusProps = {
  status: DocumentStatusValue;
};

const STATUS_LABELS: Record<DocumentStatusValue, string> = {
  [DocumentStatusValue.Ready]: 'Ready',
  [DocumentStatusValue.Processing]: 'Processing',
  [DocumentStatusValue.Failed]: 'Failed',
};

export default function DocumentStatus({ status }: DocumentStatusProps) {
  return (
    <span className={`document-status document-status--${status.toLowerCase()}`} role="status">
      <span className="document-status__dot" aria-hidden="true" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
