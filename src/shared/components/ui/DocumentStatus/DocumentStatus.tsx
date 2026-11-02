import { DocStatus } from '@/shared/types/document';
import './DocumentStatus.css';

type DocumentStatusProps = {
  status: DocStatus;
};

const STATUS_LABELS: Record<DocStatus, string> = {
  [DocStatus.Ready]: 'Ready',
  [DocStatus.Processing]: 'Processing',
  [DocStatus.Failed]: 'Failed',
};

export default function DocumentStatus({ status }: DocumentStatusProps) {
  return (
    <span className={`document-status document-status--${status}`} role="status">
      <span className="document-status__dot" aria-hidden="true" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
