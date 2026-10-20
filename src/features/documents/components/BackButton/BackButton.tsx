import Link from 'next/link';

export default function BackButton() {
  return (
    <Link href="/documents" className="document-details__back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19 12H5M12 19l-7-7 7-7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span>Back to documents</span>
    </Link>
  );
}
