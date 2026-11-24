import './DocumentsPagination.css';

interface DocumentsPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function DocumentsPagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: DocumentsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="documents__pagination" aria-label="Documents pagination">
      <button
        type="button"
        disabled={currentPage <= 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
